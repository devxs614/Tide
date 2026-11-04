// Waiting that can be called off (demo fix pack, D-5). Every pause, Next,
// Previous and exit aborts the running step, and each of these stops at
// once instead of finishing later and moving the tour on. Before, pause was
// a flag checked only between steps: a hold or a typing loop that was
// already waiting finished on its own and the tour carried on.
import { realNow } from '@/lib/clock';

export class AbortedError extends Error {
  constructor() {
    super('aborted');
    this.name = 'AbortError';
  }
}

export function isAborted(error: unknown): boolean {
  return error instanceof AbortedError || (error instanceof Error && error.name === 'AbortError');
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new AbortedError();
}

// Resolves after `ms`, or rejects the moment the signal aborts.
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortedError());
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, Math.max(0, ms));
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new AbortedError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// The next animation frame, abortable. Falls back to a timer where frames
// don't run (a hidden tab), so a wait never hangs on them.
export function nextFrame(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortedError());
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(fallback);
      signal?.removeEventListener('abort', onAbort);
      resolve();
    };
    const onAbort = () => {
      if (done) return;
      done = true;
      window.clearTimeout(fallback);
      reject(new AbortedError());
    };
    const fallback = window.setTimeout(finish, 100);
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(finish);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// Lets a promise that can't be cancelled itself (a database write, a voice
// request) stop being waited for the moment the step is called off.
export function orAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) return reject(new AbortedError());
    const onAbort = () => reject(new AbortedError());
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

// A hold that remembers how much of it is left when it's called off, so a
// paused step resumes with the rest of its hold, not all of it again.
export async function hold(ms: number, signal: AbortSignal, left: (remaining: number) => void): Promise<void> {
  const started = realNow();
  try {
    await wait(ms, signal);
    left(0);
  } catch (error) {
    left(Math.max(0, ms - (realNow() - started)));
    throw error;
  }
}
