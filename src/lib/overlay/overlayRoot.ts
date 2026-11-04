// Where floating things (the companion's speech bubble, tooltips) attach
// (v2.1 spec 5.3). Inside a sheet that's the sheet itself: Radix makes
// everything outside an open dialog inert, so a bubble portaled to <body>
// would be unclickable and could sit behind the sheet. Everywhere else it's
// the layer inside the app frame. v2.3 Item 3: that layer used to sit at
// the end of <body>, outside the phone-sized frame, so on a laptop a bubble
// could float past the frame's edges; now it's the frame's last child and
// clips whatever would leave it.
export const OVERLAY_ROOT_ID = 'tide-overlays';

export function appFrameOf(el: Element | null): HTMLElement | null {
  return el?.closest<HTMLElement>('[data-app-frame]') ?? document.querySelector<HTMLElement>('[data-app-frame]');
}

export function overlayRootFor(el: Element | null): HTMLElement {
  const inside = el?.closest<HTMLElement>('[data-overlay-root]');
  if (inside) return inside;
  const frame = appFrameOf(el);
  return frame?.querySelector<HTMLElement>(':scope > [data-frame-overlays]') ?? document.getElementById(OVERLAY_ROOT_ID) ?? document.body;
}
