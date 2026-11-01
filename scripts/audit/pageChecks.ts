// The checks the layout audit runs inside the page (v2.1 spec 4.3): page
// overflow, clipped text, overlapping and covered content, controls pushed
// off screen, the companion's bubble, and small targets as warnings. It is
// passed to page.evaluate, so it must not use anything from outside itself.
// "Layers" matter: the sticky bars, sheets, bubbles and toasts are marked
// data-overlay, and content only counts as covered by something in its own
// layer, or when an overlay ends up hidden under the page.

export interface PageFinding {
  check: string;
  selector: string;
  detail: string;
  warn?: boolean;
}

export function pageChecks(): PageFinding[] {
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

  // Screen-reader-only text (1px, or clipped to nothing) is hidden on
  // purpose; it isn't "clipped" content.
  const visible = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    const cs = getComputedStyle(el);
    if (cs.clip.startsWith('rect(0') || cs.clipPath.includes('inset(50%)')) return false;
    // A closed <details> keeps its contents laid out but not shown.
    const details = el.closest('details');
    if (details && !details.open && !el.closest('summary')) return false;
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  };
  // Toasts and Radix menus are overlays too, though the libraries draw them.
  const OVERLAY = '[data-overlay], [data-sonner-toaster], [data-radix-popper-content-wrapper]';
  const layer = (el: Element): Element | null => el.closest(OVERLAY);
  const directText = (el: Element) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0);
  const INTERACTIVE = 'button, a[href], input, select, textarea, [role="switch"], [role="tab"], [role="radio"], [role="checkbox"], [role="button"]';

  // Things that scroll sideways on purpose (the presets row) may hold
  // controls past the edge; that is scrolling, not overflow.
  const inSideScroller = (el: Element): boolean => {
    for (let e = el.parentElement; e; e = e.parentElement) {
      const ox = getComputedStyle(e).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && e.scrollWidth > e.clientWidth + 1) return true;
    }
    return false;
  };

  // Five sample points: the center and four corners, inset past a rounded
  // corner's curve (hit-testing follows border-radius, so a point just inside
  // a round button's corner lands on whatever is behind it).
  const samples = (el: Element, r: DOMRect): Array<[number, number]> => {
    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, r.width / 2, r.height / 2);
    const d = Math.min(Math.max(3, radius * 0.3 + 2), r.width / 2 - 1, r.height / 2 - 1);
    return [
      [r.left + r.width / 2, r.top + r.height / 2],
      [r.left + d, r.top + d],
      [r.right - d, r.top + d],
      [r.left + d, r.bottom - d],
      [r.right - d, r.bottom - d],
    ];
  };

  const all = Array.from(document.querySelectorAll('body *')).filter((el) => !(el instanceof SVGElement) && visible(el));
  const boxes = all.filter((el) => directText(el) || el.matches(INTERACTIVE));

  // 1. The page scrolls sideways.
  if (document.documentElement.scrollWidth > vw + 1) {
    out.push({ check: 'page-overflow-x', selector: 'html', detail: `${document.documentElement.scrollWidth} > ${vw}` });
  }

  // 2. Text cut off by a clipping box (anything with text inside it).
  for (const el of all) {
    if (el.closest('[data-allow-clip]') || !(el.textContent ?? '').trim()) continue;
    const cs = getComputedStyle(el);
    const clipX = cs.overflowX === 'hidden' || cs.overflowX === 'clip' || cs.textOverflow === 'ellipsis';
    const clipY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    if ((clipX && el.scrollWidth > el.clientWidth + 1) || (clipY && el.scrollHeight > el.clientHeight + 1)) {
      out.push({ check: 'clipped', selector: describe(el), detail: `${el.scrollWidth}x${el.scrollHeight} in ${el.clientWidth}x${el.clientHeight}` });
    }
  }

  // 3. Two unrelated pieces of content in the same layer overlap.
  const rects = boxes.map((el) => el.getBoundingClientRect());
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.contains(b) || b.contains(a) || layer(a) !== layer(b)) continue;
      const ra = rects[i];
      const rb = rects[j];
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w > 4 && h > 4) out.push({ check: 'overlap', selector: `${describe(a)} <> ${describe(b)}`, detail: `${Math.round(w)}x${Math.round(h)}` });
    }
  }

  // 4. Content covered by something else in its own layer, or an overlay
  // (a bubble, a sheet) hidden under the page.
  for (const el of boxes) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
    const pts = samples(el, r);
    const mine = layer(el);
    let by = '';
    const covered = pts.filter(([x, y]) => {
      if (x < 0 || y < 0 || x >= vw || y >= vh) return false;
      const hit = document.elementFromPoint(x, y);
      if (!hit || hit === el || el.contains(hit) || hit.contains(el)) return false;
      const theirs = layer(hit);
      // Under a different overlay (a sheet, the sticky bar): that overlay is
      // audited on its own.
      if (theirs && theirs !== mine) return false;
      by = describe(hit);
      return true;
    });
    if (covered.length >= 2) out.push({ check: 'covered', selector: describe(el), detail: `${covered.length}/5 points, by ${by}` });
  }

  // 5. A control reaching past the side of the screen.
  for (const el of all) {
    if (!el.matches(INTERACTIVE) || inSideScroller(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.left < -1 || r.right > vw + 1) out.push({ check: 'offscreen-x', selector: describe(el), detail: `${Math.round(r.left)}..${Math.round(r.right)}` });
  }

  // 6. The companion's bubble: fully on screen, on top, nothing cut. (The
  // second selector finds the v2.0 bubble, so the "before" audit sees it.)
  // Only at the top of the page: once scrolled, a bubble rightly follows its
  // companion off screen.
  for (const bubble of Array.from(document.querySelectorAll('[data-companion-bubble], [data-companion-placement] [role="status"]'))) {
    if (!visible(bubble) || window.scrollY > 1) continue;
    const r = bubble.getBoundingClientRect();
    // Entirely past the edge: it's next to a companion that is itself off
    // screen (below the fold), where the person will find both together.
    if (r.top >= vh || r.bottom <= 0) continue;
    if (r.left < 0 || r.top < 0 || r.right > vw || r.bottom > vh) {
      out.push({ check: 'bubble-offscreen', selector: describe(bubble), detail: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.right)},${Math.round(r.bottom)}` });
    }
    const text = bubble.querySelector('[data-bubble-text]') ?? bubble;
    const scrollable = getComputedStyle(text).overflowY === 'auto';
    if (!scrollable && text.scrollHeight > text.clientHeight + 1) {
      out.push({ check: 'bubble-clipped', selector: describe(bubble), detail: `${text.scrollHeight} in ${text.clientHeight}` });
    }
    const pts = samples(text, text.getBoundingClientRect());
    let by = '';
    const hidden = pts.filter(([x, y]) => {
      const hit = document.elementFromPoint(Math.min(Math.max(x, 0), vw - 1), Math.min(Math.max(y, 0), vh - 1));
      // Its own container counts: the corners are rounded, so a point just
      // inside a corner can fall on the box around the bubble.
      if (hit && (bubble.contains(hit) || hit.contains(bubble))) return false;
      by = hit ? describe(hit) : 'nothing';
      return true;
    });
    if (hidden.length > 0) out.push({ check: 'bubble-covered', selector: describe(bubble), detail: `${hidden.length}/5 points, by ${by}` });
  }

  // 7. Scrolled to the very end, nothing may still sit under the tab bar
  // and Check in button; at the very top, nothing under the top bar. Content
  // there could never be seen or tapped. (Mid-scroll, content passing under
  // the sticky bars is just scrolling.)
  const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 2;
  const atTop = window.scrollY <= 1;
  if (atEnd || atTop) {
    const chrome = Array.from(document.querySelectorAll('[data-overlay="chrome"]'))
      .filter(visible)
      .map((c) => c.getBoundingClientRect())
      .filter((c) => (c.top + c.bottom) / 2 > vh / 2 ? atEnd : atTop);
    for (let i = 0; i < boxes.length; i++) {
      if (layer(boxes[i])) continue;
      const r = rects[i];
      const under = chrome.some((c) => Math.min(r.right, c.right) - Math.max(r.left, c.left) > 4 && Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top) > 4);
      if (under) out.push({ check: 'hidden-under-bar', selector: describe(boxes[i]), detail: `${Math.round(r.top)}..${Math.round(r.bottom)}` });
    }
  }

  // 8. Small touch targets: a warning, not a failure.
  for (const el of all) {
    if (!el.matches(INTERACTIVE) || el.closest('[data-small-target-ok]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 44 || r.height < 44) out.push({ check: 'small-target', selector: describe(el), detail: `${Math.round(r.width)}x${Math.round(r.height)}`, warn: true });
  }

  return out;
}
