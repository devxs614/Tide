'use client';

// The top of each check-in step: "Step 2 of 4" in words, then the step's
// title. The title takes focus when the step changes, so a screen-reader
// user hears where they are instead of being left on a button that vanished.
import { useEffect, useRef } from 'react';
import { SheetTitle } from '@/components/ui/sheet';
import { copy, fill } from '@/copy/en';

export function StepHeader({ title, stepNumber }: { title: string; stepNumber?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [title]);
  // The sheet's Close button sits on top of this corner, so long titles
  // wrap before reaching it instead of running underneath at phone width.
  return (
    <div className="flex flex-col gap-1 pr-24">
      {stepNumber !== undefined && <p className="text-caption text-ink-soft">{fill(copy.checkin.stepOf, { n: stepNumber })}</p>}
      <SheetTitle ref={ref} tabIndex={-1} className="outline-none">
        {title}
      </SheetTitle>
    </div>
  );
}
