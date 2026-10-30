'use client';

// The spotlight (v2 spec 16.5): the screen dims except a rounded window
// around what the tour is showing. It never catches a tap, so viewers can
// still use the app, and it follows the element if the page scrolls.
import { useEffect, useState } from 'react';

export function Spotlight({ target }: { target: HTMLElement | null }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!target) return;
    let frame = 0;
    const track = () => {
      setRect(target.getBoundingClientRect());
      frame = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frame);
  }, [target]);
  if (!target || !rect) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[65] rounded-[20px] transition-all duration-300 ease-out"
      style={{ left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16, boxShadow: '0 0 0 200vmax rgb(0 0 0 / 0.45)' }}
    />
  );
}
