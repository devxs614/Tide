'use client';

// The check-in sheet that opens from the Check in button. Phase 0 only wires
// the button to an empty sheet; Phase 2 fills in the four steps.
import { copy } from '@/copy/en';
import { useCheckInSheet } from '@/lib/ui';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

export function CheckInSheet() {
  const { open, closeCheckIn } = useCheckInSheet();
  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeCheckIn()}>
      <SheetContent className="h-[92dvh]">
        <SheetTitle className="px-5 pt-5">{copy.checkin.step1Title}</SheetTitle>
      </SheetContent>
    </Sheet>
  );
}
