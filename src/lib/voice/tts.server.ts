import 'server-only';

// Natural voices on the server (v2 spec 7.6): turns on-screen text into
// audio with OpenAI or ElevenLabs, whichever the team configured. The key
// never leaves the server, the text is never logged (only provider, status,
// time and length), and with no provider set every request answers
// "not available" so the browser uses the device's own voice.
// API shapes checked against each provider's docs on 2026-10-29 (D68).
import { z } from 'zod';
import { allowRequest, rateLimitConfig } from '@/lib/ai/rateLimit';
import { realNow } from '@/lib/clock';
import { CLOUD_VOICES, DEFAULT_CLOUD_VOICE, type TtsProvider } from '@/data/voices';
import { requestSpeech } from './ttsProviders';

export interface TtsConfig {
  provider: TtsProvider | 'none';
  key: string | undefined;
  maxChars: number;
}

export function ttsConfig(): TtsConfig {
  const raw = process.env.TIDE_TTS_PROVIDER;
  const provider: TtsConfig['provider'] = raw === 'openai' || raw === 'elevenlabs' ? raw : 'none';
  const key = provider === 'openai' ? process.env.OPENAI_API_KEY : provider === 'elevenlabs' ? process.env.ELEVENLABS_API_KEY : undefined;
  return { provider, key: key || undefined, maxChars: Number(process.env.TIDE_TTS_MAX_CHARS ?? 600) };
}

export function ttsStatusBody() {
  const { provider, key, maxChars } = ttsConfig();
  const available = provider !== 'none' && Boolean(key);
  return { available, provider: available ? provider : ('none' as const), voices: available ? CLOUD_VOICES[provider as TtsProvider] : [], maxChars };
}

function logLine(provider: string, status: number, ms: number, chars: number): void {
  if (process.env.NODE_ENV === 'test') return;
  // Deliberate server log: metadata only, never the text being read.
  console.info(`[tts] provider=${provider} status=${status} ms=${ms} chars=${chars}`);
}

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
}

export async function handleTts(req: Request, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const started = realNow();
  const { provider, key, maxChars } = ttsConfig();
  const done = (res: Response, chars = 0) => {
    logLine(provider, res.status, realNow() - started, chars);
    return res;
  };
  if (provider === 'none' || !key) return done(Response.json({ available: false }, { status: 503 }));

  const { max, windowMs } = rateLimitConfig();
  if (!allowRequest(clientIp(req), started, max, windowMs)) return done(Response.json({ error: 'rate_limited' }, { status: 429 }));

  const schema = z.object({
    text: z.string().trim().min(1).max(maxChars),
    voice: z.string().max(60).optional(),
    speed: z.number().min(0.5).max(2).optional(),
  });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return done(Response.json({ error: 'invalid_input' }, { status: 400 }));
  const { text, speed = 1 } = parsed.data;
  const known = CLOUD_VOICES[provider].map((v) => v.id);
  const voice = parsed.data.voice && known.includes(parsed.data.voice) ? parsed.data.voice : DEFAULT_CLOUD_VOICE[provider];

  try {
    const upstream = await requestSpeech(provider, key, { text, voice, speed }, process.env, fetchImpl);
    if (!upstream.ok) return done(Response.json({ error: 'provider_error' }, { status: 502 }), text.length);
    const audio = await upstream.arrayBuffer();
    return done(new Response(audio, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } }), text.length);
  } catch {
    return done(Response.json({ error: 'provider_error' }, { status: 502 }), text.length);
  }
}
