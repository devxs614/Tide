// A speech-bubble hint (v2 spec 4.4), for onboarding tips and the demo
// tour's captions near a control. It's ordinary text in the page, announced
// politely, never a blocking popup.
import * as React from 'react';
import { cn } from '@/lib/utils';

export function CoachMark({
  children,
  side = 'top',
  className,
}: {
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={cn('anim-pop relative max-w-[280px]', className)}>
      <div className="card-flat border-primary bg-surface px-4 py-3 font-display text-[0.9412rem] font-semibold text-ink">
        {children}
      </div>
      <span
        aria-hidden
        className={cn(
          'absolute left-6 size-3 rotate-45 border-primary bg-surface',
          side === 'top' ? '-bottom-1.5 border-r-2 border-b-2' : '-top-1.5 border-t-2 border-l-2',
        )}
      />
    </div>
  );
}
