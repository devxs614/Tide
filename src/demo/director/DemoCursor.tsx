'use client';

// A soft pointer that glides to whatever the tour is about to tap (v2 spec
// 16.5), so viewers can follow along. Not shown at motion Off; the
// spotlight is enough there.
// Demo fix pack (D-3): it shows only while it glides to a tap and for the
// tap's ripple, then goes. It used to stay on the last target through
// typing and every hold, on top of what was being shown. It moves with
// transform and fades with opacity only.
import { useEffect, useState } from 'react';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import type { EngineState } from './engine';

type Cursor = EngineState['cursor'];

function centerOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function DemoCursor({ cursor }: { cursor: Cursor }) {
  const level = useMotionLevel();
  // Where it is drawn: it starts a little below and left of the target and
  // glides in on the next frame.
  const [at, setAt] = useState<{ x: number; y: number; for: HTMLElement } | null>(null);
  const el = cursor?.el ?? null;
  useEffect(() => {
    if (!el) return;
    const end = centerOf(el);
    const frame = requestAnimationFrame(() => setAt({ ...end, for: el }));
    return () => cancelAnimationFrame(frame);
  }, [el]);
  if (level === 'off' || !cursor) return null;
  const end = centerOf(cursor.el);
  const arrived = at?.for === cursor.el;
  const x = arrived ? at.x : end.x - 60;
  const y = arrived ? at.y : end.y + 60;
  return (
    <span
      aria-hidden
      data-demo-cursor
      className="pointer-events-none fixed top-0 left-0 z-[calc(var(--z-demo)+1)] size-7 rounded-full border-2 border-white bg-primary/70 ease-out"
      style={{ transform: `translate(${x - 14}px, ${y - 14}px)`, transitionProperty: 'transform', transitionDuration: `${cursor.tap ? 0 : cursor.ms}ms` }}
    >
      {cursor.tap && <Ripple />}
    </span>
  );
}

// The tap: a ring that grows and fades once.
function Ripple() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <span
      className="absolute inset-0 rounded-full border-2 border-primary transition-[transform,opacity] duration-300 ease-out"
      style={{ transform: grown ? 'scale(2.2)' : 'scale(1)', opacity: grown ? 0 : 0.8 }}
    />
  );
}
