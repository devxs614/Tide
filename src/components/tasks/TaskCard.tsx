'use client';

// One task: title, type with its icon, energy cost, due date and the "Move
// to…" menu. In progress it offers "I'm stuck" and "Focus"; in Stuck it
// shows why, when Maya said. Nothing here is ever red or says "overdue".
// Since v2.1 the title opens the task's details, and with keyboard shortcuts
// on, E edits and Delete asks to delete the focused card.
import Link from 'next/link';
import { ChevronRight, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { copy, fill } from '@/copy/en';
import { getTaskType } from '@/data/taskTypes';
import { now } from '@/lib/clock';
import { dueLabel, toISODate } from '@/lib/time';
import { useUnstickSheet } from '@/lib/ui';
import { useSettings } from '@/lib/settings';
import { isTypingTarget } from '@/lib/shortcuts';
import { openTaskDelete, openTaskDetail, openTaskEdit } from '@/lib/taskSheets';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EnergyDots } from '@/components/ui/Dots';
import { MoveToMenu } from './MoveToMenu';
import { cn } from '@/lib/utils';

export function TaskCard({ task, handle, compact = false }: { task: Task; handle?: ReactNode; compact?: boolean }) {
  const { openUnstick } = useUnstickSheet();
  const { settings } = useSettings();
  const type = getTaskType(task.type);
  const Icon = type.icon;
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!settings['shortcuts.enabled'] || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
    if (e.key === 'e') {
      e.preventDefault();
      openTaskEdit(task.id);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      openTaskDelete([task.id]);
    }
  };

  return (
    <article onKeyDown={onKeyDown} className={cn('flex flex-col gap-2 card p-4', compact && 'p-3')}>
      {/* v2.3 Item 4: at 150% text in a 320px phone's column the drag handle
          and chevron left the title about 35px, and every word split. With
          an 8em start the title moves under the handle instead; at 100% it
          keeps its place beside it, even at 320px. */}
      <div className="flex flex-wrap items-start gap-2">
        {handle}
        <h3 className="min-w-0 flex-1 basis-[8em] text-body font-bold break-words text-ink">
          <button
            type="button"
            onClick={() => openTaskDetail(task.id)}
            data-small-target-ok
            data-demo-id={`task-open-${task.id}`}
            className="flex w-full items-start justify-between gap-1 rounded-md text-left hover:underline hover:underline-offset-4"
          >
            <span className="min-w-0 break-words">{task.title}</span>
            {/* The way to the details, where Edit and Delete live. The v1
                "Move to…" menu stays columns only (a v1 test checks it). */}
            <ChevronRight aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-soft" />
          </button>
        </h3>
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <Icon className="size-4" aria-hidden />
          {type.label}
        </span>
        <EnergyDots cost={task.energyCost} />
        {task.due && <span>{dueLabel(task.due, now())}</span>}
        {task.movedTo && <span>{copy.tasks.movedLabel}</span>}
        {task.snoozedUntil && task.snoozedUntil > toISODate(now()) && <span>{fill(copy.wrap.snoozedLabel, { date: dueLabel(task.snoozedUntil, now()) })}</span>}
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
