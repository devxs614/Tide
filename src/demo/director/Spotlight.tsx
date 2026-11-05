'use client';

// The spotlight (v2 spec 16.5): the screen dims except a rounded window
// around what the tour is showing. It never catches a tap, so viewers can
// still use the app.
// Demo fix pack (D-3): it follows its target on every frame and whenever
// the target resizes, without sliding behind it (it used to ease 300 ms
// after the element, so it showed where a sheet's button had been); it
// fades out if the target goes away; and its window stays inside the phone
// frame on a laptop. There is only ever one, and it's gone before the next
// step's appears.
import { useEffect, useState } from 'react';
import { appFrameOf } from '@/lib/overlay/overlayRoot';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { cn } from '@/lib/utils';

type Box = { left: number; top: number; width: number; height: number } | null;

// The target's box with the spotlight's 8 px margin, cut to the frame.
export function spotlightBox(target: Element): Box {
  const r = target.getBoundingClientRect();
  if (!target.isConnected || (r.width === 0 && r.height === 0 && process.env.NODE_ENV !== 'test')) return null;
  const f = appFrameOf(target)?.getBoundingClientRect();
  let left = r.left - 8;
  let top = r.top - 8;
  let right = r.right + 8;
  let bottom = r.bottom + 8;
  if (f && f.width > 0) {
    left = Math.max(left, f.left);
    right = Math.min(right, f.right);
    top = Math.max(top, f.top);
    bottom = Math.min(bottom, f.bottom);
  }
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

const same = (a: Box, b: Box) => a === b || (!!a && !!b && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5);

export function Spotlight({ target }: { target: HTMLElement | null }) {
  const level = useMotionLevel();
  // The last place the target was, and whether it has gone since.
  const [seen, setSeen] = useState<{ for: HTMLElement; box: NonNullable<Box>; gone: boolean } | null>(null);
  useEffect(() => {
    if (!target) return;
    let frame = 0;
    const measure = () => {
      const next = spotlightBox(target);
      setSeen((prev) => {
        const mine = prev?.for === target ? prev : null;
        if (!next) return mine && !mine.gone ? { ...mine, gone: true } : mine;
        return mine && !mine.gone && same(mine.box, next) ? mine : { for: target, box: next, gone: false };
      });
    };
    const track = () => {
      measure();
      frame = requestAnimationFrame(track);
    };
    frame = requestAnimationFrame(track);
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    resize?.observe(target);
    return () => {
      cancelAnimationFrame(frame);
      resize?.disconnect();
    };
  }, [target]);
  if (!target || seen?.for !== target) return null;
  const { box, gone } = seen;
  return (
    <div
      aria-hidden
      data-overlay="demo"
      data-demo-spotlight
      className={cn('pointer-events-none fixed z-(--z-demo) rounded-[20px]', level !== 'off' && 'animate-in fade-in-0 transition-opacity duration-200', gone && 'opacity-0')}
      style={{ left: box.left, top: box.top, width: box.width, height: box.height, boxShadow: '0 0 0 200vmax rgb(0 0 0 / 0.45)' }}
    />
  );
}
