'use client';

// The Done column's extras (v2.1 F-05): "Clear" in its header, which moves
// what's there off the board (with Undo; nothing is deleted), and the way
// to everything finished earlier, in the Completed archive.
import Link from 'next/link';
import { BrushCleaning, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { doneCopy as t } from '@/copy/doneCopy';
import { clearDoneTasks, unclearTasks, UNDO_MS } from '@/lib/repo/taskEdits';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function ClearDoneButton({ ids }: { ids: string[] }) {
  const clear = async () => {
    await clearDoneTasks(ids);
    toast(t.cleared, { duration: UNDO_MS, action: { label: copy.global.undo, onClick: () => void unclearTasks(ids) } });
  };
  return (
    <Button variant="secondary" size="sm" onClick={() => void clear()} aria-label={t.clearLabel} data-demo-id="done-clear">
      <BrushCleaning aria-hidden />
      {t.clear}
    </Button>
  );
}

export function CompletedLink({ earlier, shown, window }: { earlier: number; shown: number; window: Settings['tasks.doneVisibleFor'] }) {
  if (earlier === 0) return null;
  return (
    <div className="flex flex-col gap-1 px-1">
      {shown === 0 && <p className="text-ink-soft">{t.emptyRecent[window]}</p>}
      <Link
        href="/tasks/completed"
        className="inline-flex min-h-12 items-center gap-1 self-start rounded-md font-bold text-primary underline underline-offset-4 hover:no-underline"
        data-demo-id="done-archive"
      >
        {shown === 0 ? t.seeAll : fill(t.completedEarlier, { n: earlier })}
        <ChevronRight aria-hidden className="size-5" />
      </Link>
    </div>
  );
}
