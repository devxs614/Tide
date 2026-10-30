'use client';

// The four-state board. On a phone one column shows at a time, picked with
// the segmented control (which also shows the counts); on a wide screen all
// four sit side by side. Drag and drop has keyboard support and spoken
// announcements; every move is also in each card's "Move to…" menu.
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { copy, fill } from '@/copy/en';
import { db } from '@/lib/db';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { STATUS_ORDER } from './MoveToMenu';
import { StateColumn } from './StateColumn';
import { useTaskMoves } from './useTaskMoves';
import { SomedayList } from './SomedayList';

function statusOf(id: string, tasks: Task[]): TaskStatus | undefined {
  if (id.startsWith('column:')) return id.slice('column:'.length) as TaskStatus;
  return tasks.find((t) => t.id === id)?.status;
}

export function TaskBoard() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const [visible, setVisible] = useState<TaskStatus>('not_started');
  const move = useTaskMoves();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columns = useMemo(() => {
    const list = tasks ?? [];
    return Object.fromEntries(
      STATUS_ORDER.map((s) => [s, list.filter((t) => t.status === s && !t.someday).sort((a, b) => a.order - b.order)]),
    ) as Record<TaskStatus, Task[]>;
  }, [tasks]);

  if (!tasks) return null;
  const titleOf = (id: string | number) => tasks.find((t) => t.id === id)?.title ?? '';
  const nameOf = (id: string | number | undefined) => {
    const status = id === undefined ? undefined : statusOf(String(id), tasks);
    return status ? copy.tasks.statuses[status] : '';
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => fill(copy.tasks.dndPickedUp, { title: titleOf(active.id) }),
    onDragOver: ({ active, over }) => (over ? fill(copy.tasks.dndOver, { title: titleOf(active.id), status: nameOf(over.id) }) : undefined),
    onDragEnd: ({ active, over }) => (over ? fill(copy.tasks.dndDropped, { title: titleOf(active.id), status: nameOf(over.id) }) : undefined),
    onDragCancel: ({ active }) => fill(copy.tasks.dndCancelled, { title: titleOf(active.id) }),
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const target = statusOf(String(over.id), tasks);
    if (!target) return;
    const column = columns[target].filter((t) => t.id !== active.id);
    const overIndex = column.findIndex((t) => t.id === over.id);
    void move(String(active.id), target, overIndex < 0 ? column.length : overIndex);
  };

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label={copy.tasks.segmentLabel} className="flex flex-wrap gap-2 lg:hidden">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={visible === s}
            onClick={() => setVisible(s)}
            className={cn(
              'min-h-12 rounded-full border px-3 text-caption',
              visible === s ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface text-ink',
            )}
          >
            {fill(copy.tasks.countLabel, { status: copy.tasks.statuses[s], count: columns[s].length })}
          </button>
        ))}
      </div>
      <p id="board-drag-hint" className="sr-only">
        {copy.tasks.dragHint}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
        accessibility={{ announcements, screenReaderInstructions: { draggable: copy.tasks.dragHint } }}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {STATUS_ORDER.map((s) => (
            <StateColumn key={s} status={s} tasks={columns[s]} hiddenOnMobile={s !== visible} />
          ))}
        </div>
      </DndContext>
      <SomedayList tasks={(tasks ?? []).filter((t) => t.someday && t.status !== 'done')} />
    </div>
  );
}
