// Waits until the screen stops moving before the tour points at something
// (demo fix pack, D-3). Before, the spotlight was placed a fixed 250 ms
// after the target appeared, so it often framed where a sheet's button was
// halfway through sliding up, and the next caption started while a page
// was still arriving. Now: two frames, then the target's box unchanged
// (within 1 px) for three frames in a row, its own animations finished
// (CSS and Web Animations; framer-motion is covered by the box check), and
// no theme crossfade still fading. Never longer than the timeout.
import { realNow } from '@/lib/clock';
import { nextFrame, orAbort, wait } from './abortable';

type Box = { x: number; y: number; w: number; h: number };

const box = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const same = (a: Box, b: Box) => Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.w - b.w) <= 1 && Math.abs(a.h - b.h) <= 1;

export interface Settled {
  ms: number;
  timedOut: boolean;
}

export async function waitForStable(target: Element | null, { timeout = 2500, signal }: { timeout?: number; signal?: AbortSignal } = {}): Promise<Settled> {
  const started = realNow();
  const left = () => started + timeout - realNow();
  await nextFrame(signal);
  await nextFrame(signal);
  if (target?.isConnected) {
    let last = box(target);
    let still = 0;
    while (still < 3 && left() > 0 && target.isConnected) {
      await nextFrame(signal);
      const now = box(target);
      still = same(last, now) ? still + 1 : 0;
      last = now;
    }
    const scope = [target, target.closest('[data-overlay-root]')].filter((el): el is Element => !!el);
    const running = scope
      .flatMap((el) => el.getAnimations?.({ subtree: true }) ?? [])
      .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity);
    if (running.length && left() > 0) await orAbort(Promise.race([Promise.allSettled(running.map((a) => a.finished)), wait(left())]), signal);
  }
  // The theme crossfade's veil (applyTheme.ts) is gone once it has faded.
  while (document.querySelector('[data-theme-veil]') && left() > 0) await nextFrame(signal);
  return { ms: realNow() - started, timedOut: left() <= 0 };
}
