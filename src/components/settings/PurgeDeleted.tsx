'use client';

// Settings → Privacy & data → "Permanently remove deleted tasks" (v2.1
// F-03). Deleted tasks stay hidden in Maya's data so an export is complete;
// this removes them for good, after a question, with or without the shells
// and pattern history that came from them.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { countDeletedTasks } from '@/lib/repo/taskQueries';
import { purgeAllDeletedTasks } from '@/lib/repo/taskEdits';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PurgeDeleted() {
  const t = copy.taskEdit;
  const count = useLiveQuery(() => countDeletedTasks(), []) ?? 0;
  const [asking, setAsking] = useState(false);
  const [withHistory, setWithHistory] = useState(false);
  const run = async () => {
    setAsking(false);
    await purgeAllDeletedTasks({ withHistory });
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
          <CheckboxRow id="purge-history" label={t.purgeHistory} checked={withHistory} onCheckedChange={setWithHistory} />
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
