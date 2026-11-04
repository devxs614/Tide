'use client';

// "Not true for me": hides a pattern for good. A reason is optional and
// stays on the device; "Keep it" is just as easy as "Hide it".
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleChip } from '@/components/checkin/ToggleChip';
import { patternsCopy } from '@/copy/patternsCopy';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHide: (reason?: string) => void;
}

export function NotTrueDialog({ open, onOpenChange, onHide }: Props) {
  const [reason, setReason] = useState<string | undefined>();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patternsCopy.notTrueTitle}</DialogTitle>
          <DialogDescription>{patternsCopy.notTrueBody}</DialogDescription>
        </DialogHeader>
        <div role="group" aria-label={patternsCopy.notTrue} className="flex flex-wrap gap-2">
          {patternsCopy.notTrueReasons.map((r) => (
            <ToggleChip key={r} label={r} pressed={reason === r} onToggle={() => setReason(reason === r ? undefined : r)} />
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {patternsCopy.keepPattern}
          </Button>
          <Button onClick={() => onHide(reason)}>{patternsCopy.hidePattern}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
