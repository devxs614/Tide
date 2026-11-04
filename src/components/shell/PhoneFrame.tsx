// The phone-sized column every screen sits in. On a laptop or projector the
// app stays at phone width in the middle, with a quiet border of surface-2
// around it. v2.3 Item 4: on every screen. The Tasks board (and later the
// calendar) used to widen it to 1100px, so the "phone" grew on those tabs
// only. The width stays in px, so a bigger text size can never widen it.
// `data-app-frame` lets overlays and the layout audit find its edges.
import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div data-app-frame className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg">
      {children}
    </div>
  );
}
