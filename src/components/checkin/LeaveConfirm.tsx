'use client';

// "Leave without saving?" Shown only when Maya has typed something and tries
// to close the sheet, so a stray Escape never throws her words away. Keep
// editing is the first, default button.
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function LeaveConfirm({ open, onKeep, onLeave }: { open: boolean; onKeep: () => void; onLeave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onKeep()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="pr-0">
          <DialogTitle>{copy.checkin.leaveTitle}</DialogTitle>
          <DialogDescription>{copy.checkin.leaveBody}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onLeave}>
            {copy.checkin.leave}
          </Button>
          <Button onClick={onKeep} autoFocus>
            {copy.checkin.keepEditing}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
