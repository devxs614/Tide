// How the director touches the app (v2 spec 16.4): wait for an element to
// be on screen, then click it the way a pointer would (Radix menus open on
// pointerdown), or type into it one character at a time so React sees every
// change. Nothing here reaches into components; it's what a person would do.
import { realNow } from '@/lib/clock';

const VISIBLE_POLL_MS = 50;

// On screen and taking up space. The test environment doesn't lay pages
// out, so there being connected is enough.
function visible(el: Element): boolean {
  if (process.env.NODE_ENV === 'test') return el.isConnected;
  const rect = el.getBoundingClientRect();
  return el.getClientRects().length > 0 && (rect.width > 0 || rect.height > 0);
}

export function findTarget(id: string, timeoutMs = 4000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const started = realNow();
    const look = () => {
      const match = [...document.querySelectorAll<HTMLElement>(`[data-demo-id="${id}"]`)].find(visible);
      if (match) return resolve(match);
      if (realNow() - started > timeoutMs) return reject(new Error(`not found: ${id}`));
      window.setTimeout(look, VISIBLE_POLL_MS);
    };
    look();
  });
}

// The element itself, or the first thing inside it that can be pressed.
function pressable(el: HTMLElement): HTMLElement {
  if (el.matches('button, a, input, textarea, [role="button"], [role="checkbox"], [role="radio"]')) return el;
  return el.querySelector<HTMLElement>('button, a, [role="button"], [role="checkbox"], [role="radio"]') ?? el;
}

export function click(el: HTMLElement): void {
  const target = pressable(el);
  const opts = { bubbles: true, cancelable: true, button: 0 };
  target.dispatchEvent(new PointerEvent('pointerdown', { ...opts, pointerType: 'mouse' }));
  target.dispatchEvent(new MouseEvent('mousedown', opts));
  target.dispatchEvent(new PointerEvent('pointerup', { ...opts, pointerType: 'mouse' }));
  target.dispatchEvent(new MouseEvent('mouseup', opts));
  target.click();
}

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

// React tracks input values itself, so set the value through the native
// setter and then announce it, the same way a keystroke would.
export async function typeInto(el: HTMLElement, text: string, cps: number, speed: number): Promise<void> {
  const field = (el.matches('input, textarea') ? el : el.querySelector('input, textarea')) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!field) throw new Error('nothing to type into');
  field.focus();
  const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setValue = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  let value = '';
  for (const ch of text) {
    value += ch;
    setValue.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    const jitter = 0.7 + Math.random() * 0.6;
    await sleep(((1000 / cps) * jitter) / speed);
  }
}
