// The phone-sized column every screen sits in. On a laptop or projector the
// app stays at phone width in the middle, with a quiet border of surface-2
// around it. v2.3 Item 4: on every screen. The Tasks board (and later the
// calendar) used to widen it to 1100px, so the "phone" grew on those tabs
// only. The width stays in px, so a bigger text size can never widen it.
// `data-app-frame` lets overlays and the layout audit find its edges.
import type { ReactNode } from 'react';
import { OVERLAY_ROOT_ID } from '@/lib/overlay/overlayRoot';
import { CaptionBar } from '@/components/companion/CaptionBar';

// `captions`: where the companion's caption bar goes (v2.3 Item 3). Screens
// with a top bar put it under the bar themselves; the rest get it here.
export function PhoneFrame({ children, captions = true }: { children: ReactNode; captions?: boolean }) {
  return (
    <div data-app-frame className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg">
      {captions && <CaptionBar top={0} />}
      {children}
      {/* v2.3 Item 3: the layer bubbles and tooltips attach to, inside the
          frame and clipped to it, so nothing can paint past the "phone".
          It lets taps through except on what's floating in it. */}
      <div id={OVERLAY_ROOT_ID} data-frame-overlays className="pointer-events-none absolute inset-0 z-(--z-bubble) overflow-clip" />
    </div>
  );
}
