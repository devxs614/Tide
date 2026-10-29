'use client';

// The round "Check in" button above the tab bar on every screen (v2 spec
// 4.4). Checking in is step one of Tide's loop, so it's always one tap away.
// It presses down into its ledge, sends out a soft ripple, and at the Lively
// motion level it "breathes" very slowly. The word stays visible under it.
import { useState } from 'react';
import { WavesHorizontal } from 'lucide-react';
import { copy } from '@/copy/en';
import { useCheckInSheet } from '@/lib/ui';
import { useFeedback } from '@/lib/sound/useFeedback';

export function CheckInFab() {
  const { openCheckIn } = useCheckInSheet();
  const [ripple, setRipple] = useState(0);
  const feedback = useFeedback();
  return (
    <div className="pointer-events-none flex justify-center pb-1">
      <button
        type="button"
        onClick={() => {
          feedback('tap');
          openCheckIn();
        }}
        onPointerDown={() => setRipple((n) => n + 1)}
        className="group pointer-events-auto flex flex-col items-center gap-1 rounded-full"
      >
        <span className="fab-breath relative">
          <span className="press-3d relative flex size-[68px] items-center justify-center overflow-hidden rounded-full bg-primary text-on-primary [--ledge-color:var(--primary-shadow)] [--press-depth:5px] group-active:translate-y-[5px] group-active:shadow-none">
            <WavesHorizontal className="size-8 stroke-[2.5]" aria-hidden />
            {ripple > 0 && (
              <span
                key={ripple}
                aria-hidden
                className="absolute inset-0 rounded-full bg-on-primary/40 [animation:tide-ripple_600ms_var(--ease-out)_forwards]"
              />
            )}
          </span>
        </span>
        <span className="rounded-full bg-bg/90 px-2 font-display text-[0.8235rem] font-extrabold text-ink">
          {copy.shell.checkIn}
        </span>
      </button>
    </div>
  );
}
