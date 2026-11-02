'use client';

// The "Sounds" sheet on the Focus screen (v2.1 F-09): the ambience player,
// with "Until focus ends" as one of the lengths.
import { ambienceCopy as t } from '@/copy/ambienceCopy';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AmbienceControls } from './AmbienceControls';

export function AmbienceSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{t.sounds}</SheetTitle>
        </SheetHeader>
        <div className="px-5 pt-3 pb-6">
          <AmbienceControls inFocus />
        </div>
      </SheetContent>
    </Sheet>
  );
}
