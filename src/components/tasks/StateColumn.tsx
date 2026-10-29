'use client';

// One column of the board (Not started, In progress, Stuck, Done). It is a
// drop target even when empty, and each card has a drag handle that works
// with a pointer or with the keyboard (space to pick up, arrows, space to
// drop). The "Move to…" menu on each card does the same without dragging.
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'opacity-60')}>
      <TaskCard
        task={task}
        handle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={fill(copy.tasks.dragHandle, { title: task.title })}
            aria-describedby="board-drag-hint"
            className="-ml-2 flex size-12 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-ink-soft hover:bg-surface-2"
          >
            <GripVertical className="size-5" aria-hidden />
          </button>
        }
      />
    </li>
  );
}

export function StateColumn({ status, tasks, hiddenOnMobile }: { status: TaskStatus; tasks: Task[]; hiddenOnMobile: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}`, data: { status } });
  const headingId = `column-${status}`;
  return (
    <section aria-labelledby={headingId} className={cn('flex min-w-0 flex-col gap-3', hiddenOnMobile && 'hidden lg:flex')}>
      <div>
        <h2 id={headingId} className="text-h3 font-bold">
          {fill(copy.tasks.countLabel, { status: copy.tasks.statuses[status], count: tasks.length })}
        </h2>
        {status === 'stuck' && <p className="text-ink-soft">{copy.tasks.stuckSubtitle}</p>}
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={cn('flex min-h-24 flex-col gap-3 rounded-card p-1', isOver && 'bg-surface-2')}
        >
          {tasks.map((t) => (
            <SortableTask key={t.id} task={t} />
          ))}
          {tasks.length === 0 && <li className="p-3 text-ink-soft">{copy.tasks.emptyColumn}</li>}
        </ul>
      </SortableContext>
    </section>
  );
}
