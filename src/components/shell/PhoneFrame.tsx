// The phone-sized column every screen sits in. On a laptop or projector the
// app stays at phone width in the middle, with a quiet border of surface-2
// around it; the Tasks board is allowed to go wide on big screens.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PhoneFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        'relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg',
        wide && 'lg:max-w-[1100px]',
      )}
    >
      {children}
    </div>
  );
}
