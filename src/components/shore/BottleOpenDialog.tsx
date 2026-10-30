'use client';

// Opening a bottle (v2 spec 13.7): the note Maya wrote, when she wrote it,
// read aloud if she wants, and a choice: keep it on her shore, or let it
// drift (still readable in the Collection). Nothing is ever deleted.
import { useEffect } from 'react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import type { Bottle } from '@/lib/types';
import { keepBottle, openBottle, releaseBottle } from '@/lib/repo/bottles';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';
import { useSound } from '@/lib/sound/useSound';
import { formatLongDate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export function BottleOpenDialog({ bottle, onClose }: { bottle: Bottle | null; onClose: () => void }) {
  const play = useSound();
  const celebrate = useCelebrate();
  const id = bottle?.id;
  useEffect(() => {
    if (!id) return;
    void openBottle(id);
    play('bottle');
  }, [id, play]);

  const keep = async () => {
    if (!bottle) return;
    await keepBottle(bottle.id, copy.bottle.keptWin);
    onClose();
    toast(copy.bottle.kept);
    void celebrate('bottleOpened');
  };
  const drift = async () => {
    if (!bottle) return;
    await releaseBottle(bottle.id);
    onClose();
    toast(copy.bottle.drifted);
  };

  return (
    <Dialog open={!!bottle} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="cel-overlay-in">
        {bottle && (
          <div className="flex flex-col gap-4">
            <DialogTitle>{fill(copy.bottle.wroteOn, { date: formatLongDate(bottle.ts) })}</DialogTitle>
            <DialogDescription asChild>
              <p className="rounded-card border-2 border-line bg-surface-2 p-4 font-display text-lead">{bottle.text}</p>
            </DialogDescription>
            <ReadAloudButton text={bottle.text} />
            <div className="flex flex-col gap-2">
              <Button onClick={() => void keep()}>{copy.bottle.keep}</Button>
              <Button variant="secondary" onClick={() => void drift()}>
                {copy.bottle.drift}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
