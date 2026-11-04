// A Floating UI middleware that keeps the companion's bubble off things it
// must never cover (v2.3 Item 3, v2.2 spec B-02): the focus timer, the
// breathing square, countdowns, inputs, primary buttons and open sheets.
// It runs last, after flip and shift have found the best spot inside the
// frame. If that spot still overlaps one of them, it reports a collision and
// the bubble hands its line to the caption bar instead of covering anything.
// (A first version tried the other sides itself, but `flip` kept sending the
// bubble back, and it ended wherever Floating UI's reset limit stopped it,
// sometimes on top of Today's "Check in" button at big text.)
import type { Middleware } from '@floating-ui/react-dom';

export const AVOID_SELECTOR =
  '[data-bubble-avoid], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, [data-slot="sheet-content"]';

export interface AvoidData {
  collided: boolean;
}

function overlaps(a: { left: number; top: number; right: number; bottom: number }, b: DOMRect): boolean {
  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
}

export function avoidElements(reference: Element): Middleware {
  return {
    name: 'avoidElements',
    fn({ x, y, rects, strategy, elements }) {
      // Where the bubble would be on screen: its x/y are relative to the
      // viewport (fixed) or to the layer it's in (absolute).
      const origin = strategy === 'fixed' ? { left: 0, top: 0 } : ((elements.floating.offsetParent as HTMLElement | null)?.getBoundingClientRect() ?? { left: 0, top: 0 });
      // Its real size: the size middleware's width cap can wrap the words
      // onto more lines than Floating UI measured at the start, and a taller
      // bubble than expected was landing on the button under it.
      const real = elements.floating.getBoundingClientRect();
      const width = Math.max(rects.floating.width, real.width);
      const height = Math.max(rects.floating.height, real.height);
      const box = { left: origin.left + x, top: origin.top + y, right: origin.left + x + width, bottom: origin.top + y + height };
      const blocked = Array.from(document.querySelectorAll(AVOID_SELECTOR)).some((el) => {
        // The companion's own surroundings (the breathing square it sits in,
        // the sheet it speaks from) aren't in the way.
        if (el.contains(reference) || elements.floating.contains(el)) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && overlaps(box, r);
      });
      return { data: { collided: blocked } };
    },
  };
}
