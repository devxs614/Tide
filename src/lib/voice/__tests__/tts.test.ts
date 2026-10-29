// The /api/tts route (v2 spec 7.6): it validates input, talks to the
// configured provider in that provider's request shape, answers "not
// available" without a key, and never writes the text to the server log.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetRateLimitForTests } from '@/lib/ai/rateLimit';
import { handleTts, ttsStatusBody } from '../tts.server';

const post = (body: unknown) =>
  new Request('http://localhost/api/tts', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const audio = () => vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 }));

afterEach(() => {
  vi.unstubAllEnvs();
  resetRateLimitForTests();
  vi.restoreAllMocks();
});

describe('/api/tts', () => {
  it('answers 503 { available: false } when no provider or key is set', async () => {
    vi.stubEnv('TIDE_TTS_PROVIDER', 'none');
    const res = await handleTts(post({ text: 'Hello' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ available: false });
    expect(ttsStatusBody()).toMatchObject({ available: false, provider: 'none', voices: [] });
  });

  it('calls OpenAI with model, voice, input and instructions, and returns mp3', async () => {
    vi.stubEnv('TIDE_TTS_PROVIDER', 'openai');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    const fetchImpl = audio();
    const res = await handleTts(post({ text: 'Breathe in.', voice: 'coral', speed: 1 }), fetchImpl);
    expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/audio/speech');
    expect(JSON.parse(String(init.body))).toMatchObject({ voice: 'coral', input: 'Breathe in.', response_format: 'mp3' });
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');
  });

  it('calls ElevenLabs with the voice id in the path and the xi-api-key header', async () => {
    vi.stubEnv('TIDE_TTS_PROVIDER', 'elevenlabs');
    vi.stubEnv('ELEVENLABS_API_KEY', 'el-test');
    const fetchImpl = audio();
    await handleTts(post({ text: 'Hold.', voice: 'not-a-voice' }), fetchImpl);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    // An unknown voice falls back to the provider default.
    expect(url).toContain('/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM');
    expect((init.headers as Record<string, string>)['xi-api-key']).toBe('el-test');
    expect(JSON.parse(String(init.body))).toMatchObject({ text: 'Hold.', model_id: 'eleven_multilingual_v2' });
  });

  it('rejects empty or too-long text before calling anyone', async () => {
    vi.stubEnv('TIDE_TTS_PROVIDER', 'openai');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('TIDE_TTS_MAX_CHARS', '20');
    const fetchImpl = audio();
    expect((await handleTts(post({ text: '' }), fetchImpl)).status).toBe(400);
    expect((await handleTts(post({ text: 'x'.repeat(21) }), fetchImpl)).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('logs provider, status, time and length, never the text', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('TIDE_TTS_PROVIDER', 'openai');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    await handleTts(post({ text: 'My private sentence' }), audio());
    const lines = log.mock.calls.map((c) => String(c[0]));
    expect(lines.some((l) => l.includes('provider=openai') && l.includes('chars=19'))).toBe(true);
    expect(lines.join(' ')).not.toContain('private');
  });
});
