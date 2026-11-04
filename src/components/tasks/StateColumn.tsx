'use client';

// One column of the board (Not started, In progress, Stuck, Done). It is a
// drop target even when empty, and each card has a drag handle that works
// with a pointer or with the keyboard (space to pick up, arrows, space to
// drop). The "Move to…" menu on each card does the same without dragging.
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { copy, fill } from '@/copy/en';
import { tasksCopy } from '@/copy/tasksCopy';
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

// v2.1 F-05: the Done column adds "Clear" beside its heading and the link
// to Completed under its list (`action`, `footer`); when only that link has
// something to say, it replaces the "Nothing here" line (`quietWhenEmpty`).
// v2.3 Item 4: every column is a named region ("In progress, 1 task"); in
// the one-list view its heading folds it (`collapsed`, `onToggle`), and an
// empty Not started column offers "Add task" (`emptyAction`).
export function StateColumn({
  status,
  tasks,
  action,
  footer,
  quietWhenEmpty = false,
  collapsed = false,
  onToggle,
  emptyAction,
}: {
  status: TaskStatus;
  tasks: Task[];
  action?: ReactNode;
  footer?: ReactNode;
  quietWhenEmpty?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  emptyAction?: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}`, data: { status } });
  const headingId = `column-${status}`;
  const name = copy.tasks.statuses[status];
  const heading = fill(copy.tasks.countLabel, { status: name, count: tasks.length });
  const region = fill(tasks.length === 1 ? tasksCopy.columnRegion.one : tasksCopy.columnRegion.many, { status: name, count: tasks.length });
  return (
    <section aria-label={region} data-column={status} className="flex min-w-0 flex-col gap-3">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={headingId} className="text-h3 font-bold">
            {onToggle ? (
              <button
                type="button"
                aria-expanded={!collapsed}
                aria-label={fill(collapsed ? tasksCopy.showGroup : tasksCopy.hideGroup, { status: name })}
                onClick={onToggle}
                className="flex min-h-12 items-center gap-2 text-left"
              >
                <ChevronDown aria-hidden className={cn('size-5 shrink-0 transition-transform', collapsed && '-rotate-90')} />
                {heading}
              </button>
            ) : (
              heading
            )}
          </h2>
          {action}
        </div>
        {status === 'stuck' && <p className="text-ink-soft">{copy.tasks.stuckSubtitle}</p>}
      </div>
      {!collapsed && (
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ul
            ref={setNodeRef}
            className={cn('flex min-h-24 flex-col gap-3 rounded-card p-1', isOver && 'bg-surface-2')}
          >
            {tasks.map((t) => (
              <SortableTask key={t.id} task={t} />
            ))}
            {tasks.length === 0 && !quietWhenEmpty && (
              <li className="flex flex-col items-start gap-2 p-3 text-ink-soft">
                {copy.tasks.emptyColumn}
                {emptyAction}
              </li>
            )}
          </ul>
        </SortableContext>
      )}
      {!collapsed && footer}
    </section>
  );
}
