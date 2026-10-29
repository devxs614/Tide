import 'server-only';

// The only code that talks to Claude. callJson() sends one request with the
// route's system prompt and the minimal input, parses the reply as JSON,
// validates it, and gives the model exactly one chance to fix a bad answer.
// Anything else (no key, timeout, refusal, two bad answers) becomes a typed
// AiError, and the browser falls back to the built-in suggestion.
import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';

export type AiErrorCode = 'timeout' | 'invalid_output' | 'provider_error' | 'missing_key';

export class AiError extends Error {
  constructor(
    public code: AiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AiError';
  }
}

export interface CallJsonOptions<T> {
  model: string;
  system: string;
  input: unknown;
  schema: z.ZodType<T>;
  maxTokens: number;
  timeoutMs: number;
  // Extra checks zod can't express (made-up emotion ids, a task left out of
  // a plan). Return a short reason to trigger the retry, or null if fine.
  check?: (output: T) => string | null;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiError('missing_key', 'ANTHROPIC_API_KEY is not set on the server.');
  // No SDK retries: we already retry once on bad output, and the browser has
  // its own timeout, so silent retries would only make Maya wait longer.
  client ??= new Anthropic({ apiKey, maxRetries: 0 });
  return client;
}

// Only for tests, so each case starts with a fresh client.
export function resetClientForTests(): void {
  client = null;
}

// These answers are short JSON objects with small token budgets. The current
// Haiku and Sonnet models think before answering by default, which would
// spend that budget and cut the JSON off, so thinking is turned off and
// effort set low. Sampling settings like temperature are no longer accepted
// by the API, so none are sent. Other models get the API defaults.
function modelOptions(model: string): Partial<Anthropic.MessageCreateParamsNonStreaming> {
  if (model.startsWith('claude-haiku-5-5')) {
    return { thinking: { type: 'disabled' }, output_config: { effort: 'low' } };
  }
  if (model.startsWith('claude-sonnet-5-5')) {
    return { thinking: { type: 'between_tools' }, output_config: { effort: 'low' } };
  }
  return {};
}

const INSTRUCTION = 'Respond with only the JSON object that matches the OUTPUT SCHEMA. No prose, no code fences.';

// Models occasionally wrap JSON in ``` fences or add a sentence; keep only
// the outermost object.
export function extractJson(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, '').trim();
  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('no JSON object in the reply');
  return JSON.parse(unfenced.slice(start, end + 1));
}

function shortZodError(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((i) => `${i.path.join('.') || 'output'}: ${i.message}`)
    .join('; ');
}

function validate<T>(text: string, opts: CallJsonOptions<T>): { data?: T; problem?: string } {
  let json: unknown;
  try {
    json = extractJson(text);
  } catch {
    return { problem: 'the reply was not a JSON object' };
  }
  const parsed = opts.schema.safeParse(json);
  if (!parsed.success) return { problem: shortZodError(parsed.error) };
  const semantic = opts.check?.(parsed.data);
  return semantic ? { problem: semantic } : { data: parsed.data };
}

export async function callJson<T>(opts: CallJsonOptions<T>): Promise<{ ok: true; data: T }> {
  const anthropic = getClient();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `INPUT (JSON):\n${JSON.stringify(opts.input)}\n\n${INSTRUCTION}` },
  ];

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await anthropic.messages.create(
        { model: opts.model, max_tokens: opts.maxTokens, system: opts.system, messages, ...modelOptions(opts.model) },
        { signal: controller.signal },
      );
      if (response.stop_reason === 'refusal') throw new AiError('provider_error', 'the model declined this request');
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      const result = validate(text, opts);
      if (result.data !== undefined) return { ok: true, data: result.data };
      // One retry, showing the model its own answer and what was wrong.
      messages.push({ role: 'assistant', content: text || '{}' });
      messages.push({
        role: 'user',
        content: `That output was invalid: ${result.problem}. Return only valid JSON matching the schema.`,
      });
    }
    throw new AiError('invalid_output', 'the model returned invalid output twice');
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (controller.signal.aborted || error instanceof Anthropic.APIUserAbortError) {
      throw new AiError('timeout', `no answer within ${opts.timeoutMs} ms`);
    }
    if (error instanceof Anthropic.APIConnectionTimeoutError) throw new AiError('timeout', 'connection timed out');
    throw new AiError('provider_error', error instanceof Error ? error.name : 'unknown provider error');
  } finally {
    clearTimeout(timer);
  }
}
