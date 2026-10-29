'use client';

// One task: title, type with its icon, energy cost, due date and the "Move
// to…" menu. In progress it offers "I'm stuck" and "Focus"; in Stuck it
// shows why, when Maya said. Nothing here is ever red or says "overdue".
import Link from 'next/link';
import { Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { copy, fill } from '@/copy/en';
import { getTaskType } from '@/data/taskTypes';
import { now } from '@/lib/clock';
import { dueLabel } from '@/lib/time';
import { useUnstickSheet } from '@/lib/ui';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EnergyDots } from '@/components/ui/Dots';
import { MoveToMenu } from './MoveToMenu';
import { cn } from '@/lib/utils';

export function TaskCard({ task, handle, compact = false }: { task: Task; handle?: ReactNode; compact?: boolean }) {
  const { openUnstick } = useUnstickSheet();
  const type = getTaskType(task.type);
  const Icon = type.icon;

  return (
    <article className={cn('flex flex-col gap-2 rounded-card border border-line bg-surface p-4', compact && 'p-3')}>
      <div className="flex items-start gap-2">
        {handle}
        <h3 className="min-w-0 flex-1 text-body font-bold break-words text-ink">{task.title}</h3>
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <Icon className="size-4" aria-hidden />
          {type.label}
        </span>
        <EnergyDots cost={task.energyCost} />
        {task.due && <span>{dueLabel(task.due, now())}</span>}
        {task.movedTo && <span>{copy.tasks.movedLabel}</span>}
      </p>
      {task.status === 'stuck' && task.stuckReason && (
        <p className="text-caption text-ink-soft">{fill(copy.tasks.stuckBecause, { reason: copy.unstick.reasons[task.stuckReason] })}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {task.status === 'in_progress' && (
          <>
            <Button variant="secondary" size="sm" onClick={() => openUnstick({ taskId: task.id })}>
              {copy.tasks.imStuck}
            </Button>
            <Button asChild size="sm">
              <Link href={`/focus/${task.id}`}>
                <Timer aria-hidden />
                {copy.tasks.focus}
              </Link>
            </Button>
          </>
        )}
        {task.status === 'stuck' && (
          <Button variant="secondary" size="sm" onClick={() => openUnstick({ taskId: task.id })}>
            {copy.unstick.firstStepTitle}
          </Button>
        )}
        <div className="ml-auto">
          <MoveToMenu task={task} />
        </div>
      </div>
    </article>
  );
}
