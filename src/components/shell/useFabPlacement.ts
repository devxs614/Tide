'use client';

// What the smart check-in button needs to know about the page around it
// (v2.3 Item 1): whether a text field has focus (the on-screen keyboard is
// probably up), whether the page is scrolling, whether something you could
// press sits right under it (then it shrinks and slides 12px aside), how
// wide the phone frame is, and, when "Let me move the button" is on, a
// long-press drag that snaps it to the left, center or right.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { appFrameOf } from '@/lib/overlay/overlayRoot';
import { useSettings } from '@/lib/settings';

const PRESSABLE = 'button, a[href], input, textarea, select, [role="button"], .card';
const isField = (el: Element | null) => !!el?.matches('input, textarea, select, [contenteditable="true"]');

export function useFabPlacement(button: RefObject<HTMLButtonElement | null>) {
  const pathname = usePathname();
  const { update } = useSettings();
  const [typing, setTyping] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [under, setUnder] = useState({ over: false, nudge: 0 });
  const [frameWidth, setFrameWidth] = useState(430);
  const [dx, setDx] = useState(0);
  const dragState = useRef<{ startX: number; moved: boolean } | null>(null);

  useEffect(() => {
    const onFocus = () => setTyping(isField(document.activeElement));
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onFocus);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onFocus);
    };
  }, []);

  // After layout settles (and 150ms after each scroll), look at what's
  // right under the button's middle, ignoring the bars it sits in.
  useEffect(() => {
    let settle = 0;
    let check = 0;
    const look = () => {
      const el = button.current;
      if (!el) return;
      setFrameWidth(appFrameOf(el)?.clientWidth ?? window.innerWidth);
      // On Today, at the top of the page, it stays full size: it's where
      // most people first check in, and the demo starts there (v2.3 spec 2.3).
      if (pathname === '/' && window.scrollY < 1) return setUnder({ over: false, nudge: 0 });
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const hit = document.elementsFromPoint(x, r.top + r.height / 2).find((n) => !n.closest('[data-overlay="chrome"], [data-overlay="fab"]'));
      const target = hit?.closest(PRESSABLE);
      if (!target) return setUnder({ over: false, nudge: 0 });
      const t = target.getBoundingClientRect();
      setUnder({ over: true, nudge: x >= t.left + t.width / 2 ? 12 : -12 });
    };
    const onScroll = () => {
      setScrolling(true);
      window.clearTimeout(settle);
      window.clearTimeout(check);
      settle = window.setTimeout(() => setScrolling(false), 200);
      check = window.setTimeout(look, 350);
    };
    check = window.setTimeout(look, 150);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', look);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', look);
      window.clearTimeout(settle);
      window.clearTimeout(check);
    };
  }, [button, pathname]);

  const drag = {
    dx,
    arm: (x: number) => {
      dragState.current = { startX: x, moved: false };
    },
    move: (x: number) => {
      const d = dragState.current;
      if (!d) return;
      if (Math.abs(x - d.startX) > 12) d.moved = true;
      if (d.moved) setDx(x - d.startX);
    },
    // Snaps to the third of the frame the pointer ended in.
    end: (x: number): boolean => {
      const d = dragState.current;
      if (!d?.moved) return false;
      dragState.current = null;
      setDx(0);
      const frame = appFrameOf(button.current)?.getBoundingClientRect();
      const left = frame?.left ?? 0;
      const width = frame?.width ?? window.innerWidth;
      const third = (x - left) / width;
      void update('checkin.buttonSide', third < 1 / 3 ? 'left' : third > 2 / 3 ? 'right' : 'center');
      return true;
    },
    armedWithoutMove: (): boolean => {
      const armed = !!dragState.current && !dragState.current.moved;
      dragState.current = null;
      return armed;
    },
  };

  return { typing, scrolling, overInteractive: under.over, nudge: under.over ? under.nudge : 0, frameWidth, drag };
}
