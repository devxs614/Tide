// Desktop keyboard shortcuts (v2 spec 17.1), as a plain function from a key
// press to what it means. Kept apart from React so the rules about when a
// key must be ignored (typing, a modifier held, a sheet open) are easy to
// read and to test.

export type ShortcutAction =
  | { kind: 'checkIn' }
  | { kind: 'quickCheckIn' }
  | { kind: 'newTask' }
  | { kind: 'tab'; href: string }
  | { kind: 'wrap' }
  | { kind: 'calendar' }
  | { kind: 'searchSettings' }
  | { kind: 'help' }
  | { kind: 'demo' };

export const TAB_HREFS = ['/', '/tasks', '/toolkit', '/patterns', '/shore'];

// Someone typing "c" in a task title must get a "c", never a check-in.
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target.matches('input, textarea, select, [role="textbox"], [role="combobox"]');
}

interface KeyLike {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  repeat?: boolean;
  isComposing?: boolean;
  target: EventTarget | null;
}

export function shortcutFor(e: KeyLike): ShortcutAction | null {
  // Browser and screen reader commands use the modifier keys; leave them be.
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.isComposing) return null;
  if (isTypingTarget(e.target)) return null;
  if (e.shiftKey && e.key === 'D') return { kind: 'demo' };
  if (e.key === '?') return { kind: 'help' };
  if (e.shiftKey) return null;
  switch (e.key) {
    case 'c':
      return { kind: 'checkIn' };
    // v2.3 Item 1: Quick check-in, two taps instead of words.
    case 'q':
      return { kind: 'quickCheckIn' };
    case 'n':
      return { kind: 'newTask' };
    case 'w':
      return { kind: 'wrap' };
    case 'm':
      return { kind: 'calendar' };
    case '/':
      return { kind: 'searchSettings' };
  }
  const tab = Number(e.key);
  if (Number.isInteger(tab) && tab >= 1 && tab <= TAB_HREFS.length) return { kind: 'tab', href: TAB_HREFS[tab - 1] };
  return null;
}
