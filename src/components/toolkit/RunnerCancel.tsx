'use client';

// Cancel for a running strategy (v2.1 F-08): top left, always labeled, and
// Escape does the same. It asks only when there's typed work to lose (the
// brain dump), and then offers to keep it as tasks. Stopping never asks for
// a re-check and never says "you didn't finish".
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { navCopy as t } from '@/copy/navCopy';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ToolDraft } from './tools/types';

export function RunnerCancel({ draft, onLeave }: { draft: ToolDraft | null; onLeave: () => void }) {
  const [asking, setAsking] = useState(false);
  const cancel = () => (draft ? setAsking(true) : onLeave());

  // Escape, unless a dialog or sheet is open (that one closes first).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || document.querySelector('[role="dialog"]')) return;
      if (draft) setAsking(true);
      else onLeave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, onLeave]);

  return (
    <>
      <Button variant="quiet" size="sm" className="self-start" onClick={cancel} data-nav="cancel" data-demo-id="runner-cancel">
        <X aria-hidden />
        {t.cancel}
      </Button>
      <Dialog open={asking} onOpenChange={(open) => !open && setAsking(false)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="pr-0">
            <DialogTitle>{t.leaveTitle}</DialogTitle>
            <DialogDescription>{t.brainDumpBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col">
            <Button
              variant="secondary"
              onClick={async () => {
                setAsking(false);
                await draft?.save();
                onLeave();
              }}
            >
              {t.brainDumpSave}
            </Button>
            <Button variant="secondary" onClick={onLeave}>
              {t.leave}
            </Button>
            <Button onClick={() => setAsking(false)} autoFocus>
              {t.keepGoing}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
