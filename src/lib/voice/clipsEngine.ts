// Pre-generated voice clips (v2 spec 7.7): if the team ran
// `npm run voice:clips`, /public/voice holds an mp3 for each fixed text
// (strategy steps, companion lines, demo captions, breathing cues), and the
// demo can sound natural even with no network. If the folder isn't there,
// this simply finds nothing.
import { sha256Hex } from './hash';

interface Manifest {
  voice: string;
  clips: Record<string, string>;
}

let manifest: Promise<Manifest | null> | null = null;

function loadManifest(): Promise<Manifest | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  manifest ??= fetch('/voice/manifest.json')
    .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
    .catch(() => null);
  return manifest;
}

export function resetClipsForTests(): void {
  manifest = null;
}

// The clip's URL for this exact (speech-ready) text, or null.
export async function findClip(text: string): Promise<string | null> {
  const m = await loadManifest();
  if (!m) return null;
  const file = m.clips[await sha256Hex(text)];
  return file ? `/voice/${file}` : null;
}
