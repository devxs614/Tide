// Plays an audio file (a cached cloud voice or a pre-generated clip) with
// the same start / end / error events the browser voice engine uses, so the
// read-aloud button can't tell which engine spoke.
import type { SpeakEvents } from './browserEngine';

export function playAudio(src: string, events: SpeakEvents = {}): Promise<() => void> {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    let settled = false;
    audio.onplaying = () => events.onStart?.();
    audio.onended = () => events.onEnd?.();
    audio.onerror = () => events.onError?.();
    const stop = () => {
      audio.pause();
      audio.src = '';
    };
    audio
      .play()
      .then(() => {
        settled = true;
        resolve(stop);
      })
      .catch(() => {
        if (!settled) events.onError?.();
        resolve(stop);
      });
  });
}

// Several files, one after another (cloud text longer than one request).
export async function playSequence(srcs: string[], events: SpeakEvents = {}): Promise<() => void> {
  let stopped = false;
  let stopCurrent: () => void = () => {};
  let index = 0;
  const playNext = async (): Promise<void> => {
    if (stopped) return;
    if (index >= srcs.length) return events.onEnd?.();
    const first = index === 0;
    stopCurrent = await playAudio(srcs[index++], {
      onStart: first ? events.onStart : undefined,
      onEnd: () => void playNext(),
      onError: events.onError,
    });
  };
  await playNext();
  return () => {
    stopped = true;
    stopCurrent();
  };
}
