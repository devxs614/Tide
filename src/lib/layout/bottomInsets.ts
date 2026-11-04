'use client';

// The height of everything fixed at the bottom of the screen (the tab bar,
// the check-in button, the mini player), measured as it changes and written
// to `--bottom-insets` (v2.3 Item 1, v2.2 spec B-05). The page pads its
// bottom by at least that much, so the last card can always scroll fully
// above them, whatever the text size or which bars are showing.
import { useEffect, useRef } from 'react';

export function useBottomInsets<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const write = () => document.documentElement.style.setProperty('--bottom-insets', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--bottom-insets');
    };
  }, []);
  return ref;
}
