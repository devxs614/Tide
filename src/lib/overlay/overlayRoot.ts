// Where floating things (the companion's speech bubble, tooltips) attach
// (v2.1 spec 5.3). Inside a sheet that's the sheet itself: Radix makes
// everything outside an open dialog inert, so a bubble portaled to <body>
// would be unclickable and could sit behind the sheet. Everywhere else it's
// the app-wide layer at the end of the page.
export const OVERLAY_ROOT_ID = 'tide-overlays';

export function overlayRootFor(el: Element | null): HTMLElement {
  const inside = el?.closest<HTMLElement>('[data-overlay-root]');
  return inside ?? document.getElementById(OVERLAY_ROOT_ID) ?? document.body;
}
