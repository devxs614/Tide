// A Floating UI middleware that keeps the companion's bubble off things it
// must never cover (v2.3 Item 3, v2.2 spec B-02): the focus timer, the
// breathing square, countdowns, inputs, primary buttons and open sheets.
// After the usual placement, if the bubble would overlap one of them it
// tries the other sides in turn; if every side collides it reports that, and
// the bubble hands its line to the caption bar instead of covering anything.
import type { Middleware, Placement } from '@floating-ui/react-dom';

export const AVOID_SELECTOR =
  '[data-bubble-avoid], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, [data-slot="sheet-content"]';

const ORDER: Placement[] = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'];

export interface AvoidData {
  tried: Placement[];
  collided: boolean;
}

function overlaps(a: { left: number; top: number; right: number; bottom: number }, b: DOMRect): boolean {
  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
}

export function avoidElements(reference: Element): Middleware {
  return {
    name: 'avoidElements',
    fn({ x, y, rects, placement, strategy, elements, middlewareData }) {
      const data = middlewareData.avoidElements as AvoidData | undefined;
      // Where the bubble would be on screen: its x/y are relative to the
      // viewport (fixed) or to the layer it's in (absolute).
      const origin = strategy === 'fixed' ? { left: 0, top: 0 } : ((elements.floating.offsetParent as HTMLElement | null)?.getBoundingClientRect() ?? { left: 0, top: 0 });
      const box = { left: origin.left + x, top: origin.top + y, right: origin.left + x + rects.floating.width, bottom: origin.top + y + rects.floating.height };
      const blocked = Array.from(document.querySelectorAll(AVOID_SELECTOR)).some((el) => {
        // The companion's own surroundings (the breathing square it sits in,
        // the sheet it speaks from) aren't in the way.
        if (el.contains(reference) || elements.floating.contains(el)) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && overlaps(box, r);
      });
      const tried = [...(data?.tried ?? []), placement];
      if (!blocked) return { data: { tried, collided: false } };
      const next = ORDER.find((p) => !tried.includes(p));
      if (!next) return { data: { tried, collided: true } };
      return { data: { tried, collided: false }, reset: { placement: next } };
    },
  };
}
