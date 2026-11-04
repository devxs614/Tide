// How the director touches the app (v2 spec 16.4): wait for an element to
// be on screen, then click it the way a pointer would (Radix menus open on
// pointerdown), or type into it one character at a time so React sees every
// change. Nothing here reaches into components; it's what a person would do.
// Since the demo fix pack (D-5) the search and the typing stop the moment a
// pause or Next calls them off, and typing can pick up where it stopped.
import { realNow } from '@/lib/clock';
import { AbortedError, wait } from './abortable';

const VISIBLE_POLL_MS = 50;

// On screen and taking up space. The test environment doesn't lay pages
// out, so there being connected is enough.
function visible(el: Element): boolean {
  if (process.env.NODE_ENV === 'test') return el.isConnected;
  const rect = el.getBoundingClientRect();
  return el.getClientRects().length > 0 && (rect.width > 0 || rect.height > 0);
}

export function findTarget(id: string, timeoutMs = 4000, signal?: AbortSignal): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const started = realNow();
    let timer = 0;
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new AbortedError());
    };
    if (signal?.aborted) return onAbort();
    signal?.addEventListener('abort', onAbort, { once: true });
    const look = () => {
      const match = [...document.querySelectorAll<HTMLElement>(`[data-demo-id="${id}"]`)].find(visible);
      const finish = (fn: () => void) => {
        signal?.removeEventListener('abort', onAbort);
        fn();
      };
      if (match) return finish(() => resolve(match));
      if (realNow() - started > timeoutMs) return finish(() => reject(new Error(`not found: ${id}`)));
      timer = window.setTimeout(look, VISIBLE_POLL_MS);
    };
    look();
  });
}

// The element itself, or the first thing inside it that can be pressed.
function pressable(el: HTMLElement): HTMLElement {
  if (el.matches('button, a, input, textarea, [role="button"], [role="checkbox"], [role="radio"]')) return el;
  return el.querySelector<HTMLElement>('button, a, [role="button"], [role="checkbox"], [role="radio"]') ?? el;
}

// Every event dispatched here has `isTrusted` false, which is how the tour's
// own controls tell the director's clicks from a person's: only a person's
// press may pause or play the tour.
export function click(el: HTMLElement): void {
  const target = pressable(el);
  const opts = { bubbles: true, cancelable: true, button: 0 };
  target.dispatchEvent(new PointerEvent('pointerdown', { ...opts, pointerType: 'mouse' }));
  target.dispatchEvent(new MouseEvent('mousedown', opts));
  target.dispatchEvent(new PointerEvent('pointerup', { ...opts, pointerType: 'mouse' }));
  target.dispatchEvent(new MouseEvent('mouseup', opts));
  target.click();
}

export function fieldIn(el: HTMLElement): HTMLInputElement | HTMLTextAreaElement | null {
  return (el.matches('input, textarea') ? el : el.querySelector('input, textarea')) as HTMLInputElement | HTMLTextAreaElement | null;
}

// React tracks input values itself, so set the value through the native
// setter and then announce it, the same way a keystroke would.
export function setFieldValue(field: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

// Types `text` from character `from` on, reporting each character so a
// paused step knows how far it got. `msPerChar` already includes the speed.
export async function typeInto(
  el: HTMLElement,
  text: string,
  msPerChar: number,
  opts: { from?: number; signal?: AbortSignal; onChar?: (typed: number) => void } = {},
): Promise<void> {
  const field = fieldIn(el);
  if (!field) throw new Error('nothing to type into');
  field.focus();
  const chars = [...text];
  for (let i = opts.from ?? 0; i < chars.length; i++) {
    setFieldValue(field, chars.slice(0, i + 1).join(''));
    opts.onChar?.(i + 1);
    const jitter = 0.7 + Math.random() * 0.6;
    await wait(msPerChar * jitter, opts.signal);
  }
}
