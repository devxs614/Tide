'use client';

// The tour's keyboard shortcuts (v2 spec 16.5): Space, K or P to pause and
// play, → / PageDown for Next and ← / PageUp for back (a presentation
// clicker sends those), Esc to leave the tour, and S, C, N for speed,
// captions and narration.
// Demo fix pack (D-5): Space on a focused button is left to the button.
// Before, clicking Pause left focus on it, and the next Space toggled
// twice (once here, once as the button's own click), so nothing seemed to
// happen. Arrows inside a group that uses them (radio buttons, tabs,
// sliders) stay with that group. The handler calls preventDefault only
// when it acts, and the engine ignores a second toggle within 300 ms.
import { useEffect } from 'react';
import { director } from './engine';

const SPEEDS = [1, 1.5, 2];
const TYPING = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const PRESSABLE = '[data-demo-hud], button, a[href], [role="button"], [role="checkbox"], [role="radio"], [role="switch"]';
const ARROW_GROUPS = '[role="radiogroup"], [role="tablist"], [role="slider"], [role="listbox"], [role="menu"]';

export function directorKey(e: KeyboardEvent): boolean {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return false;
  const el = e.target instanceof Element ? e.target : null;
  if (el?.closest(TYPING)) return false;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === ' ') {
    if (el?.closest(PRESSABLE)) return false;
    director.toggle('key');
  } else if (key === 'k' || key === 'p') director.toggle('key');
  else if (key === 'PageDown' || (key === 'ArrowRight' && !el?.closest(ARROW_GROUPS))) director.next();
  else if (key === 'PageUp' || (key === 'ArrowLeft' && !el?.closest(ARROW_GROUPS))) director.prev();
  else if (key === 'Escape') director.exit();
  else if (key === 's') director.setSpeed(SPEEDS[(SPEEDS.indexOf(director.getState().speed) + 1) % SPEEDS.length]);
  else if (key === 'c') director.toggleCaptions();
  else if (key === 'n') director.toggleNarration();
  else return false;
  return true;
}

export function useDirectorKeys(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (directorKey(e)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export const DIRECTOR_SPEEDS = SPEEDS;
