import 'server-only';

// The shared body of the five /api/ai/* routes, so each route file only says
// which schemas, prompt, model tier and checks it uses. Order of work:
// rate limit → validate input → call the model → validate output → checks →
// envelope. The server log line has the route, status, latency and whether
// the browser will fall back. It never includes what Maya wrote.
import type { z } from 'zod';
import { realNow } from '@/lib/clock';
import { AiError, callJson, type AiErrorCode } from './client';
import { systemPrompt, type AiRoute } from './prompts';
import { allowRequest, rateLimitConfig } from './rateLimit';

export type AiFailure = 'rate_limited' | 'invalid_input' | AiErrorCode;

export type AiEnvelope<T> = { ok: true; data: T; source: 'ai' } | { ok: false; error: AiFailure };

interface RouteConfig<I, O> {
  route: AiRoute;
  tier: 'fast' | 'smart';
  maxTokens: number;
  input: z.ZodType<I>;
  output: z.ZodType<O>;
  check?: (input: I, output: O) => string | null;
  // Last-step repair that never rejects (narrate swaps a card with an
  // unverifiable number for the template version of that card).
  finalize?: (input: I, output: O) => O;
}

const STATUS: Record<AiFailure, number> = {
  rate_limited: 429,
  invalid_input: 400,
  missing_key: 503,
  timeout: 504,
  invalid_output: 502,
  provider_error: 502,
};

export function modelFor(tier: 'fast' | 'smart'): string {
  return tier === 'fast'
    ? (process.env.TIDE_MODEL_FAST ?? 'claude-haiku-5-5')
    : (process.env.TIDE_MODEL_SMART ?? 'claude-sonnet-5-5');
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip') || 'local';
}

function logLine(route: AiRoute, status: number, ms: number, fallback: boolean): void {
  if (process.env.NODE_ENV === 'test') return;
  // Deliberate server log (spec 10.1): metadata only, never request bodies.
  console.info(`[ai] route=${route} status=${status} ms=${ms} fallback=${fallback}`);
}

export async function handleAiRoute<I, O>(req: Request, cfg: RouteConfig<I, O>): Promise<Response> {
  const started = realNow();
  const respond = (body: AiEnvelope<O>, status: number) => {
    logLine(cfg.route, status, realNow() - started, !body.ok);
    return Response.json(body, { status });
  };
  const fail = (error: AiFailure) => respond({ ok: false, error }, STATUS[error]);

  const { max, windowMs } = rateLimitConfig();
  if (!allowRequest(clientIp(req), started, max, windowMs)) return fail('rate_limited');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail('invalid_input');
  }
  const parsed = cfg.input.safeParse(body);
  if (!parsed.success) return fail('invalid_input');
  const input = parsed.data;

  try {
    const { data } = await callJson({
      model: modelFor(cfg.tier),
      system: systemPrompt(cfg.route),
      input,
      schema: cfg.output,
      maxTokens: cfg.maxTokens,
      timeoutMs: Number(process.env.TIDE_AI_TIMEOUT_MS ?? 8000),
      check: cfg.check ? (output) => cfg.check!(input, output) : undefined,
    });
    const finalData = cfg.finalize ? cfg.finalize(input, data) : data;
    return respond({ ok: true, data: finalData, source: 'ai' }, 200);
  } catch (error) {
    return fail(error instanceof AiError ? error.code : 'provider_error');
  }
}
