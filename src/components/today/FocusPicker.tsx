'use client';

// "Focus" from Today's quick actions: which task first? In progress comes
// before Not started, in the board's own order, and tasks set aside for
// someday stay out of the way. Choosing one opens its focus page.
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight } from 'lucide-react';
import { copy } from '@/copy/en';
import { db } from '@/lib/db';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const RANK = { in_progress: 0, not_started: 1 } as const;

export function FocusPicker({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const tasks = useLiveQuery(
    async () =>
      (await db.tasks.toArray())
        .filter((t) => (t.status === 'in_progress' || t.status === 'not_started') && !t.someday)
        .sort((a, b) => RANK[a.status as keyof typeof RANK] - RANK[b.status as keyof typeof RANK] || a.order - b.order),
    [],
  );
  const q = copy.today.quick;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{q.pickTitle}</SheetTitle>
          <SheetDescription>{q.pickBody}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 overflow-y-auto px-5 pt-3 pb-6">
          {tasks?.length === 0 && (
            <p className="text-ink-soft">
              {q.pickNone}{' '}
              <Link href="/tasks" className="font-bold text-primary underline underline-offset-4">
                {q.pickAdd}
              </Link>
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {tasks?.map((t) => (
              <li key={t.id}>
                <Link href={`/focus/${t.id}`} className="card-flat flex min-h-12 items-center gap-3 px-4 py-2 hover:bg-surface-2">
                  <span className="flex flex-1 flex-col">
                    <span className="font-bold">{t.title}</span>
                    <span className="text-caption text-ink-soft">{copy.tasks.statuses[t.status]}</span>
                  </span>
                  <ChevronRight aria-hidden className="size-5 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
