// Natural cloud voices through Tide's own /api/tts route (v2 spec 7.6), only
// when the team configured a provider. Audio is cached in the browser's
// Cache Storage under a hash of provider, voice, speed and text, so fixed
// texts (strategy steps, companion lines) download once. The cache keeps at
// most 200 clips, dropping the least recently used.
import type { CloudVoice, TtsProvider } from '@/data/voices';
import { voiceCacheKey } from './hash';
import { playSequence } from './audioPlayer';
import { speechChunks } from './speechText';
import type { SpeakEvents } from './browserEngine';

export interface TtsStatus {
  available: boolean;
  provider: TtsProvider | 'none';
  voices: CloudVoice[];
  maxChars: number;
}

const OFF: TtsStatus = { available: false, provider: 'none', voices: [], maxChars: 600 };
const CACHE_NAME = 'tide-voice-v1';
const INDEX_KEY = 'tide-voice-index';
const MAX_CLIPS = 200;

let status: Promise<TtsStatus> | null = null;

export function ttsStatus(): Promise<TtsStatus> {
  if (typeof window === 'undefined') return Promise.resolve(OFF);
  status ??= fetch('/api/tts/status')
    .then((r) => (r.ok ? (r.json() as Promise<TtsStatus>) : OFF))
    .catch(() => OFF);
  return status;
}

export function resetTtsStatusForTests(): void {
  status = null;
}

function readIndex(): string[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function writeIndex(keys: string[]): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(keys));
  } catch {
    // Storage blocked: the cache still works, it just can't be trimmed.
  }
}

async function cachedAudio(provider: string, voice: string, speed: number, text: string): Promise<Blob> {
  const key = await voiceCacheKey(provider, voice, speed, text);
  const url = `/__tide-voice/${key}.mp3`;
  const cache = typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME).catch(() => null);
  const hit = await cache?.match(url);
  const index = readIndex().filter((k) => k !== key);
  if (hit) {
    writeIndex([...index, key]);
    return hit.blob();
  }
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, speed }),
  });
  if (!res.ok) throw new Error(`tts ${res.status}`);
  const blob = await res.blob();
  if (cache) {
    await cache.put(url, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } }));
    const next = [...index, key];
    for (const old of next.splice(0, Math.max(0, next.length - MAX_CLIPS))) await cache.delete(`/__tide-voice/${old}.mp3`);
    writeIndex(next);
  }
  return blob;
}

export async function speakWithCloud(
  text: string,
  opts: { voice: string; speed: number },
  events: SpeakEvents = {},
): Promise<() => void> {
  const s = await ttsStatus();
  if (!s.available || s.provider === 'none') throw new Error('cloud voice unavailable');
  const pieces = speechChunks(text, s.maxChars);
  const blobs = await Promise.all(pieces.map((piece) => cachedAudio(s.provider, opts.voice, opts.speed, piece)));
  return playSequence(blobs.map((b) => URL.createObjectURL(b)), events);
}

export async function clearVoiceCache(): Promise<void> {
  if (typeof caches !== 'undefined') await caches.delete(CACHE_NAME).catch(() => false);
  writeIndex([]);
}
