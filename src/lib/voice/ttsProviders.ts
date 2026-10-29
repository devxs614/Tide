// The two cloud voice APIs, in one place, for both the /api/tts route and
// the clip generator script. Request shapes follow each provider's docs as
// checked on 2026-10-29 (D68): OpenAI POST /v1/audio/speech with model,
// voice, input, instructions, response_format and speed; ElevenLabs POST
// /v1/text-to-speech/{voice_id} with text, model_id and voice_settings.
import { OPENAI_VOICE_INSTRUCTIONS, type TtsProvider } from '@/data/voices';

export interface SpeechRequest {
  text: string;
  voice: string;
  speed: number;
}

export function requestSpeech(
  provider: TtsProvider,
  key: string,
  { text, voice, speed }: SpeechRequest,
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (provider === 'openai') {
    return fetchImpl('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.TIDE_TTS_OPENAI_MODEL ?? 'gpt-4o-mini-tts',
        voice,
        input: text,
        instructions: OPENAI_VOICE_INSTRUCTIONS,
        response_format: 'mp3',
        speed,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  }
  return fetchImpl(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: env.TIDE_TTS_ELEVEN_MODEL ?? 'eleven_multilingual_v2',
      // ElevenLabs accepts speeds from 0.7 to 1.2.
      voice_settings: { speed: Math.min(1.2, Math.max(0.7, speed)) },
    }),
    signal: AbortSignal.timeout(15_000),
  });
}
