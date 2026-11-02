'use client';

// Settings → Privacy & data → "Permanently remove deleted events" (v2.1
// F-04). Deleted events stay hidden so a backup is complete; this removes
// them for good, after a question. One that a past switch refers to stays
// as a nameless stub with only its kind, so that switch's record holds.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { fill } from '@/copy/en';
import { eventEditCopy as t } from '@/copy/eventEditCopy';
import { countDeletedEvents } from '@/lib/repo/eventQueries';
import { purgeDeletedEvents } from '@/lib/repo/eventEdits';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PurgeDeletedEvents() {
  const count = useLiveQuery(() => countDeletedEvents(t.stubTitle), []) ?? 0;
  const [asking, setAsking] = useState(false);
  const run = async () => {
    setAsking(false);
    await purgeDeletedEvents(t.stubTitle);
    toast(t.purgeDone);
  };
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display font-extrabold">{t.purge}</h3>
      <p className="text-caption text-ink-soft">{count > 0 ? t.purgeHelp : t.purgeNone}</p>
      <Button variant="secondary" className="self-start" disabled={count === 0} onClick={() => setAsking(true)}>
        {t.purge}
      </Button>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="pr-0">
            <DialogTitle>{fill(t.purgeConfirm, { n: count })}</DialogTitle>
            <DialogDescription>{t.purgeHelp}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="notice" onClick={() => void run()}>
              {t.remove}
            </Button>
            <Button onClick={() => setAsking(false)} autoFocus>
              {t.keepIt}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
