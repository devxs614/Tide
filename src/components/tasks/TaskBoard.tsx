'use client';

// The four-state board. v2.3 Item 4: it always stays inside the phone frame
// (v1 let it grow to 1100px on a laptop, so the "phone" got bigger on this
// tab only, and large text crushed four columns into slivers). Two views:
// "swipe" puts the columns side by side in a sideways scroller, each 85%
// wide so the next one peeks in, with the status pills kept in sync; "list"
// stacks them as foldable groups. Drag and drop (pointer or keyboard, with
// spoken announcements) and every card's "Move to…" menu work in both.
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Plus } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { tasksCopy } from '@/copy/tasksCopy';
import type { Task, TaskStatus } from '@/lib/types';
import { STATUS_ORDER } from './MoveToMenu';
import { StateColumn } from './StateColumn';
import { useTaskMoves } from './useTaskMoves';
import { SomedayList } from './SomedayList';
import { BoardSegments } from './BoardSegments';
import { BoardFilters } from './BoardFilters';
import { Button } from '@/components/ui/button';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { activeTasks, isVisibleInDone } from '@/lib/repo/taskQueries';
import { matchesFilters, useBoardFilters } from '@/lib/tasks/boardFilters';
import { now } from '@/lib/clock';
import { toISODate } from '@/lib/time';
import { useReducedMotionPref, useSettings } from '@/lib/settings';
import { ClearDoneButton, CompletedLink } from './DoneColumnParts';

function statusOf(id: string, tasks: Task[]): TaskStatus | undefined {
  if (id.startsWith('column:')) return id.slice('column:'.length) as TaskStatus;
  return tasks.find((t) => t.id === id)?.status;
}

export function TaskBoard({ onAddTask }: { onAddTask?: () => void }) {
  const tasks = useLiveQuery(() => activeTasks(), []);
  const { settings, update } = useSettings();
  const view = settings['tasks.boardView'];
  const folded = settings['tasks.collapsedGroups'];
  const filters = useBoardFilters();
  const reduceMotion = useReducedMotionPref();
  const [visible, setVisible] = useState<TaskStatus>('not_started');
  const scroller = useRef<HTMLDivElement>(null);
  const move = useTaskMoves();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Done shows only recent, uncleared tasks (v2.1 F-05); the rest wait in
  // Completed. The window is checked against now() whenever the board
  // draws, so yesterday afternoon's tasks are gone the next time it opens.
  const doneWindow = settings['tasks.doneVisibleFor'];
  const at = now();
  const today = toISODate(at);
  const columns = useMemo(() => {
    const list = (tasks ?? []).filter((t) => matchesFilters(t, filters, today));
    const shows = (t: Task, s: TaskStatus) => t.status === s && !t.someday && (s !== 'done' || isVisibleInDone(t, at, doneWindow));
    return Object.fromEntries(
      STATUS_ORDER.map((s) => [s, list.filter((t) => shows(t, s)).sort((a, b) => a.order - b.order)]),
    ) as Record<TaskStatus, Task[]>;
  }, [tasks, at, doneWindow, filters, today]);
  const earlierDone = (tasks ?? []).filter((t) => t.status === 'done').length - columns.done.length;

  // Swiping moves the highlighted pill: whichever column is mostly in view.
  const loaded = !!tasks;
  useEffect(() => {
    const root = scroller.current;
    if (view !== 'swipe' || !root || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const status = seen?.target.getAttribute('data-board-column') as TaskStatus | null;
        if (status) setVisible(status);
      },
      { root, threshold: [0.6] },
    );
    root.querySelectorAll('[data-board-column]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [view, loaded]);

  if (!tasks) return <ScreenSkeleton rows={4} rowClassName="h-20" />;
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

  // A pill brings its column into place (instantly at motion Off).
  const pick = (s: TaskStatus) => {
    setVisible(s);
    const root = scroller.current;
    const col = root?.querySelector<HTMLElement>(`[data-board-column="${s}"]`);
    if (root && col) root.scrollTo?.({ left: col.offsetLeft - root.offsetLeft - parseFloat(getComputedStyle(root).paddingLeft || '0'), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const toggleGroup = (s: TaskStatus) =>
    void update('tasks.collapsedGroups', folded.includes(s) ? folded.filter((x) => x !== s) : [...folded, s]);

  const column = (s: TaskStatus) => {
    const fold = view === 'list' ? { collapsed: folded.includes(s), onToggle: () => toggleGroup(s) } : {};
    if (s === 'done')
      return (
        <StateColumn
          status={s}
          tasks={columns.done}
          action={columns.done.length > 0 ? <ClearDoneButton ids={columns.done.map((t) => t.id)} /> : undefined}
          footer={<CompletedLink earlier={earlierDone} shown={columns.done.length} window={doneWindow} />}
          quietWhenEmpty={earlierDone > 0}
          {...fold}
        />
      );
    const add =
      s === 'not_started' && onAddTask && filters.length === 0 ? (
        <Button variant="secondary" size="sm" onClick={onAddTask}>
          <Plus aria-hidden />
          {copy.tasks.addTask}
        </Button>
      ) : undefined;
    return <StateColumn status={s} tasks={columns[s]} emptyAction={add} {...fold} />;
  };

  const noMatch = filters.length > 0 && STATUS_ORDER.every((s) => columns[s].length === 0);

  return (
    <div className="flex flex-col gap-4">
      <BoardFilters />
      {view === 'swipe' && (
        <BoardSegments active={visible} counts={Object.fromEntries(STATUS_ORDER.map((s) => [s, columns[s].length])) as Record<TaskStatus, number>} onPick={pick} showDots />
      )}
      {noMatch && <p className="text-ink-soft">{tasksCopy.noTasksMatch}</p>}
      <p id="board-drag-hint" className="sr-only">
        {copy.tasks.dragHint}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
        accessibility={{ announcements, screenReaderInstructions: { draggable: copy.tasks.dragHint } }}
      >
        {view === 'swipe' ? (
          // Edge to edge inside the frame; dragging a card near the side
          // scrolls to the next column (dnd-kit's auto-scroll). `relative`
          // matters: without it, screen-reader-only text in the far columns
          // is positioned against the frame, escapes this scroller's clip
          // and made the whole page scroll sideways.
          <div ref={scroller} className="relative -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
            {STATUS_ORDER.map((s) => (
              // 85% of the frame (the scroller's content plus its 1.25rem
              // padding each side), per the spec; 85% of the content alone
              // left "Programming" no room at 150% text on a 320px phone.
              <div key={s} data-board-column={s} className="w-[calc(85%+2.125rem)] shrink-0 snap-start">
                {column(s)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {STATUS_ORDER.map((s) => (
              <div key={s}>{column(s)}</div>
            ))}
          </div>
        )}
      </DndContext>
      <SomedayList tasks={(tasks ?? []).filter((t) => t.someday && t.status !== 'done')} />
    </div>
  );
}
