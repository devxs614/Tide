'use client';

// A task's details (v2.1 F-03), opened by tapping its title on the board or
// on Today: what it is, how heavy, when it's due, its first step and where
// Maya left off, with Edit, Focus and Delete, and the columns as plain
// buttons (a menu inside a sheet would be one more layer to manage).
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Timer, Trash2 } from 'lucide-react';
import { copy } from '@/copy/en';
import { getTaskType } from '@/data/taskTypes';
import { now } from '@/lib/clock';
import { getTask } from '@/lib/repo/taskQueries';
import { dueLabel } from '@/lib/time';
import { openTaskDelete, openTaskEdit } from '@/lib/taskSheets';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EnergyDots } from '@/components/ui/Dots';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { STATUS_ORDER } from './MoveToMenu';
import { useTaskMoves } from './useTaskMoves';

export function TaskDetailSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const task = useLiveQuery(() => getTask(id), [id]);
  const move = useTaskMoves();
  const t = copy.taskEdit;
  if (task === undefined) return null;
  const type = getTaskType(task.type);
  const Icon = type.icon;
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle className="break-words">{task.title}</SheetTitle>
        </SheetHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-5 pt-3">
          <dt className="font-bold">{t.detailType}</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <Icon aria-hidden className="size-4 shrink-0" />
            {type.label}
          </dd>
          <dt className="font-bold">{t.detailEnergy}</dt>
          <dd>
            <EnergyDots cost={task.energyCost} />
          </dd>
          <dt className="font-bold">{t.detailDue}</dt>
          <dd>{task.due ? dueLabel(task.due, now()) : t.detailNoDue}</dd>
          {task.firstStep && (
            <>
              <dt className="font-bold">{t.detailFirstStep}</dt>
              <dd className="min-w-0 break-words">{task.firstStep}</dd>
            </>
          )}
          {task.parkingNote && (
            <>
              <dt className="font-bold">{t.detailLeftOff}</dt>
              <dd className="min-w-0 break-words">{task.parkingNote}</dd>
            </>
          )}
        </dl>
        <div role="group" aria-label={t.detailStatus} className="flex flex-col gap-2 px-5 pt-4">
          <span className="font-bold">{t.detailStatus}</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((status) => (
              <Chip key={status} label={copy.tasks.statuses[status]} pressed={task.status === status} onToggle={() => void move(task.id, status)} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-5 pt-5 pb-6">
          <Button variant="secondary" onClick={() => openTaskEdit(task.id)} data-demo-id="task-detail-edit">
            <Pencil aria-hidden />
            {t.edit}
          </Button>
          {task.status !== 'done' && (
            <Button asChild variant="secondary">
              <Link href={`/focus/${task.id}`} onClick={onClose}>
                <Timer aria-hidden />
                {t.focus}
              </Link>
            </Button>
          )}
          <Button variant="notice" onClick={() => openTaskDelete([task.id])} data-demo-id="task-detail-delete">
            <Trash2 aria-hidden />
            {t.delete}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
