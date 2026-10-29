'use client';

// The round "Check in" button that floats above the tab bar on every screen.
// Checking in is step one of Tide's loop, so it is always one tap away. The
// word "Check in" is always visible, not only the wave icon.
import { WavesHorizontal } from 'lucide-react';
import { copy } from '@/copy/en';
import { useCheckInSheet } from '@/lib/ui';

export function CheckInFab() {
  const { openCheckIn } = useCheckInSheet();
  return (
    <div className="pointer-events-none flex justify-center pb-1">
      <button
        type="button"
        onClick={openCheckIn}
        className="group pointer-events-auto flex flex-col items-center gap-1 rounded-full"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-sheet transition-transform group-hover:scale-105">
          <WavesHorizontal className="size-7" aria-hidden />
        </span>
        <span className="rounded-full bg-bg/90 px-2 text-caption font-bold text-ink">
          {copy.shell.checkIn}
        </span>
      </button>
    </div>
  );
}
