// Where the tour's bar sits when it's at the bottom: just above the bars
// fixed there (tab bar, check-in button, mini player), never on them (demo
// fix pack, D-3). They're measured rather than read from --bottom-insets,
// which a page change can leave unset for a moment (it did, on Tasks and
// at the start of the tour, and the bar covered the check-in button).
export function bottomBarsHeight(): number {
  let top = window.innerHeight;
  for (const el of document.querySelectorAll('[data-overlay="chrome"]')) {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && Math.abs(r.bottom - window.innerHeight) < 2) top = Math.min(top, r.top);
  }
  return window.innerHeight - top;
}

export function barBottom(): number {
  // 16 px clear, so the check-in button can grow back from its smaller
  // size without touching the bar.
  return Math.max(96, Math.round(bottomBarsHeight() + 16));
}
