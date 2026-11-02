'use client';

// "End the focus block?" (v2.1 F-08): asked when End is tapped more than a
// minute into a block, so a stray tap doesn't throw the block away. "Keep
// going" is the default. Ending keeps the time so far and goes back to
// Tasks without the outcome question (that's for "I'm done early").
import { navCopy as t } from '@/copy/navCopy';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function EndFocusDialog({ open, onKeep, onEnd }: { open: boolean; onKeep: () => void; onEnd: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onKeep()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="pr-0">
          <DialogTitle>{t.endFocusTitle}</DialogTitle>
          <DialogDescription>{t.endFocusBody}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onEnd}>
            {t.endFocusConfirm}
          </Button>
          <Button onClick={onKeep} autoFocus>
            {t.keepGoing}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
