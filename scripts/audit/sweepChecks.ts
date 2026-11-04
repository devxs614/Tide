// The checks added for the v2.2 bug sweep (spec 6.1). v2.1's audit reported
// zero failures, yet the team found words split letter by letter, bubbles
// outside the phone frame, a companion painted over a sheet and content
// stuck under the Check-in button. Each check here closes one of those
// blind spots. Like pageChecks, these run inside the page and must not use
// anything from outside their own bodies.
import type { PageFinding } from './pageChecks.ts';

export function sweepChecks(): PageFinding[] {
  const out: PageFinding[] = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const describe = (el: Element): string => {
    const parts: string[] = [];
    for (let e: Element | null = el; e && parts.length < 4; e = e.parentElement) {
      const tag = e.tagName.toLowerCase();
      const id = e.getAttribute('data-demo-id') || e.id || e.getAttribute('data-slot') || '';
      parts.unshift(id ? `${tag}[${id}]` : tag);
    }
    const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${parts.join(' > ')}${label ? ` "${label}"` : ''}`;
  };
  const shown = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1 || el.closest('.sr-only')) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  };
  // The box a line of text wraps inside: inline parents have no width.
  const blockOf = (el: Element): Element => {
    let b = el;
    while (b.parentElement && ['inline', 'contents'].includes(getComputedStyle(b).display)) b = b.parentElement;
    return b;
  };

  // 1. Words split in the middle ("Toolki t"). Hyphens are fair places to
  // break, so words are split at them first. The spec's first idea was to
  // fail only words narrower than their box, but the bug is the box itself
  // getting squeezed narrower than an ordinary word, so that rule missed
  // "Toolki t". Any normal word (up to 24 letters, narrower than a phone's
  // line) that breaks fails; only things like long links warn.
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0';
  document.body.appendChild(probe);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent instanceof SVGElement || parent.closest('[data-allow-clip], code, pre, [aria-hidden="true"], .sr-only, script, style')) continue;
    const text = node.textContent ?? '';
    if (text.trim().length < 2) continue;
    const cs = getComputedStyle(parent);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    for (const m of text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu)) {
      if (m[0].length < 2) continue;
      const range = document.createRange();
      range.setStart(node, m.index!);
      range.setEnd(node, m.index! + m[0].length);
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
      if (rects.length < 2 || new Set(rects.map((r) => Math.round(r.top / 3))).size < 2) continue;
      probe.style.font = cs.font;
      probe.style.letterSpacing = cs.letterSpacing;
      probe.textContent = m[0];
      const box = blockOf(parent);
      const bs = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
      const wordWidth = probe.getBoundingClientRect().width;
      const ordinary = m[0].length <= 24 && wordWidth <= Math.min(vw, 430) - 64;
      out.push({ check: 'mid-word-break', selector: describe(parent), detail: `"${m[0]}" (${Math.round(wordWidth)}px word, ${Math.round(room)}px box)`, warn: !ordinary });
    }
  }
  probe.remove();

  // 2. Outside the app frame. On a laptop Tide is a phone-sized column;
  // anything of the app's that paints outside it looks broken even though
  // it's on screen. The demo's controls span the screen on purpose.
  const frameEl =
    document.querySelector('[data-app-frame]') ??
    Array.from(document.querySelectorAll('body div')).find((d) => ['430px', '1100px'].includes(getComputedStyle(d).maxWidth) && d.getBoundingClientRect().height > vh * 0.5);
  const frame = frameEl?.getBoundingClientRect();
  if (frame && vw > frame.width + 2) {
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (el.closest('[data-frame-exempt], [data-demo-hud], [data-demo-cursor], [aria-hidden="true"]') || el instanceof SVGElement || !shown(el)) continue;
      // Only things a person reads or presses; a full-width backdrop is fine.
      const reads = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim()) || el.matches('button, a[href], input, textarea, select');
      if (!reads) continue;
      // Cards in a sideways carousel sit past the frame's edge but are
      // clipped by their scroller, so only the part that can paint counts.
      let left = el.getBoundingClientRect().left;
      let right = el.getBoundingClientRect().right;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX === 'visible') continue;
        const c = a.getBoundingClientRect();
        left = Math.max(left, c.left);
        right = Math.min(right, c.right);
      }
      if (right - left <= 1) continue;
      const r = { left, right };
      if (r.left < frame.left - 1 || r.right > frame.right + 1) {
        out.push({ check: 'outside-frame', selector: describe(el), detail: `${Math.round(r.left)}..${Math.round(r.right)} vs frame ${Math.round(frame.left)}..${Math.round(frame.right)}` });
      }
    }
  }

  // 3. Inputs under 16px: iOS Safari zooms the whole page when one gets
  // focus, which reads as "the screen got bigger".
  for (const el of Array.from(document.querySelectorAll('input, textarea, select'))) {
    if (!shown(el) || (el instanceof HTMLInputElement && ['checkbox', 'radio', 'range', 'hidden', 'color', 'file'].includes(el.type))) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 16) out.push({ check: 'input-font-size', selector: describe(el), detail: `${size}px` });
  }

  // 4. Phone fields: a phone keyboard and no letters. A field counts as a
  // phone if it says so (data-phone, autocomplete, its label or name).
  for (const el of Array.from(document.querySelectorAll('input'))) {
    if (!shown(el)) continue;
    const label = el.labels?.[0]?.textContent ?? '';
    const isPhone = el.hasAttribute('data-phone') || el.autocomplete === 'tel' || /phone|tel[eé]fono/i.test(`${label} ${el.name} ${el.id} ${el.placeholder}`);
    if (!isPhone) continue;
    if (el.type !== 'tel' || el.inputMode !== 'tel') out.push({ check: 'phone-input', selector: describe(el), detail: `type=${el.type} inputmode=${el.inputMode || '-'}` });
  }

  // 5. A bubble or popover over something it must never cover (the focus
  // timer, the breathing square, inputs, primary buttons).
  const avoid = Array.from(document.querySelectorAll('[data-bubble-avoid]')).filter(shown);
  // Only within the same layer: a line inside a sheet sits over the page's
  // buttons behind the sheet's backdrop, which is fine.
  const layerOf = (el: Element) => el.closest('[data-slot="sheet-content"], [data-slot="dialog-content"]');
  for (const b of Array.from(document.querySelectorAll('[data-companion-bubble]')).filter(shown)) {
    const r = b.getBoundingClientRect();
    for (const a of avoid) {
      if (a.contains(b) || b.contains(a) || layerOf(a) !== layerOf(b)) continue;
      const q = a.getBoundingClientRect();
      if (Math.min(r.right, q.right) - Math.max(r.left, q.left) > 2 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 2) {
        out.push({ check: 'bubble-over-avoid', selector: describe(b), detail: `over ${describe(a)}` });
      }
    }
  }

  // 6. An open sheet is the top layer: nothing from the page (a companion,
  // its bubble) may paint over it, and the sheet must fit on screen, or
  // its last buttons ("Close") are cut off.
  // A confirm dialog (and its backdrop) opened from a sheet is meant to be
  // on top of it, as are toasts, menus and the demo's controls.
  const ABOVE_SHEETS = '[data-sonner-toaster], [data-radix-popper-content-wrapper], [data-demo-hud], [data-demo-cursor], [data-frame-exempt], [role="alertdialog"], [role="dialog"]:not([data-slot="sheet-content"]), [data-slot="dialog-overlay"], [data-slot="alert-dialog-overlay"]';
  for (const sheet of Array.from(document.querySelectorAll('[data-slot="sheet-content"]')).filter(shown)) {
    const r = sheet.getBoundingClientRect();
    if (r.bottom > vh + 1 || r.top < -1) out.push({ check: 'sheet-cut', selector: describe(sheet), detail: `${Math.round(r.top)}..${Math.round(r.bottom)} in ${vh}` });
    const pts: Array<[number, number]> = [];
    for (const fx of [0.1, 0.3, 0.5, 0.7, 0.9]) for (const y of [r.top + 3, r.top + 24, r.top + r.height / 2]) pts.push([r.left + r.width * fx, y]);
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x >= vw || y >= vh) continue;
      const hit = document.elementFromPoint(x, y);
      if (!hit || sheet.contains(hit) || hit.closest(ABOVE_SHEETS)) continue;
      out.push({ check: 'over-sheet', selector: describe(hit), detail: `at ${Math.round(x)},${Math.round(y)} over ${describe(sheet)}` });
      break;
    }
  }
  return out;
}

// Scrolled to the very end, the last stretch of content must be reachable:
// not sitting under the Check-in button, the mini player, a toast or any
// other floating thing. Run after scrolling the page (or a sheet) down.
export function endCoverage(): PageFinding[] {
  const out: PageFinding[] = [];
  const vh = window.innerHeight;
  const describe = (el: Element): string => {
    const parts: string[] = [];
    for (let e: Element | null = el; e && parts.length < 4; e = e.parentElement) {
      const tag = e.tagName.toLowerCase();
      const id = e.getAttribute('data-demo-id') || e.id || e.getAttribute('data-slot') || '';
      parts.unshift(id ? `${tag}[${id}]` : tag);
    }
    const label = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${parts.join(' > ')}${label ? ` "${label}"` : ''}`;
  };
  // A dialog waits for an answer and covers the page on purpose; so does the
  // refocus check-in card. Neither is a floating control content hides under.
  if (document.querySelector('[data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-overlay="nudge"]')) return out;
  // The Check-in button is listed by its hook too, since before the sweep it
  // wasn't marked as an overlay.
  const FLOATING = '[data-overlay], [data-sonner-toaster], [data-demo-id="fab-checkin"]';
  const sheet = Array.from(document.querySelectorAll('[data-slot="sheet-content"]')).find((s) => s.getBoundingClientRect().height > 0);
  // Scroll whatever scrolls (the open sheet, or the page) all the way down.
  if (sheet) sheet.scrollTop = sheet.scrollHeight;
  else window.scrollTo(0, document.documentElement.scrollHeight);
  const scope: Element = sheet ?? document.body;
  const view = sheet ? sheet.getBoundingClientRect() : { top: 0, bottom: vh, height: vh };
  for (const el of Array.from(scope.querySelectorAll('*'))) {
    if (el.closest(FLOATING) && !(sheet && el.closest(FLOATING) === sheet.closest(FLOATING))) continue;
    const r = el.getBoundingClientRect();
    if (r.height <= 1 || r.width <= 1 || r.top < view.top + view.height * 0.7 || r.bottom > view.bottom + 1) continue;
    const reads = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim()) || el.matches('button, a[href], input, textarea');
    if (!reads) continue;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!hit || hit === el || el.contains(hit) || hit.contains(el)) continue;
    const floating = hit.closest(FLOATING);
    if (floating && !floating.contains(el)) out.push({ check: 'covered-at-end', selector: describe(el), detail: `by ${describe(hit)}` });
  }
  return out;
}

// The app frame's width, compared across text sizes by the runner: bigger
// text must never make the phone column itself wider.
export function frameWidth(): number {
  const el =
    document.querySelector('[data-app-frame]') ??
    Array.from(document.querySelectorAll('body div')).find((d) => ['430px', '1100px'].includes(getComputedStyle(d).maxWidth) && d.getBoundingClientRect().height > window.innerHeight * 0.5);
  return el ? Math.round(el.getBoundingClientRect().width) : -1;
}
