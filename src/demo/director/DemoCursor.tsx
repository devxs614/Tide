'use client';

// A soft pointer that glides to whatever the tour is about to touch (v2 spec
// 16.5), so viewers can follow along. Not shown at motion Off; the
// spotlight is enough there.
import { useEffect, useState } from 'react';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';

export function DemoCursor({ target }: { target: HTMLElement | null }) {
  const level = useMotionLevel();
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!target) return;
    const r = target.getBoundingClientRect();
    const t = window.setTimeout(() => setAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 }), 0);
    return () => window.clearTimeout(t);
  }, [target]);
  if (level === 'off' || !target || !at) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none fixed z-[66] size-7 rounded-full border-2 border-white bg-primary/70 transition-all duration-500 ease-out"
      style={{ left: at.x - 14, top: at.y - 14 }}
    />
  );
}
