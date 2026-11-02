'use client';

// A day still to come (v2.1 F-10, spec 14.4): its events, the tasks due
// then or snoozed until then, and ways to add an event (one-off or weekly)
// or a task due that day. No Now marker and no Bridge: those belong to
// Today's Tide Line.
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { calendarCopy as t } from '@/copy/calendarCopy';
import type { DayDetail } from '@/lib/calendar/data';
import { fromISODate } from '@/lib/time';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { EventRows } from './EventRows';

const AddEventSheet = dynamic(() => import('@/components/today/AddEventSheet').then((m) => m.AddEventSheet), { ssr: false });
const TaskForm = dynamic(() => import('@/components/tasks/TaskForm').then((m) => m.TaskForm), { ssr: false });

function TaskSection({ id, title, tasks }: { id: string; title: string; tasks: Task[] }) {
  if (!tasks.length) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="text-h3 font-bold">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DayAhead({ date, day }: { date: string; day: DayDetail }) {
  const [adding, setAdding] = useState<'event' | 'task' | null>(null);
  const empty = !day.events.length && !day.due.length && !day.snoozed.length;
  return (
    <div className="flex flex-col gap-5">
      {empty && <p className="text-ink-soft">{t.nothingThisDay}</p>}
      {day.events.length > 0 && (
        <section aria-labelledby="day-events" className="flex flex-col gap-2">
          <h3 id="day-events" className="text-h3 font-bold">
            {t.eventsHeading}
          </h3>
          <EventRows events={day.events} />
        </section>
      )}
      <TaskSection id="day-due" title={t.dueHeading} tasks={day.due} />
      <TaskSection id="day-snoozed" title={t.snoozedHeading} tasks={day.snoozed} />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setAdding('event')} data-demo-id="calendar-add-event">
          {t.addEvent}
        </Button>
        <Button variant="secondary" onClick={() => setAdding('task')}>
          {t.addTask}
        </Button>
      </div>
      {adding === 'event' && <AddEventSheet open onOpenChange={(open) => !open && setAdding(null)} dayStart={fromISODate(date)} />}
      {adding === 'task' && <TaskForm open onOpenChange={(open) => !open && setAdding(null)} defaultDue={date} />}
    </div>
  );
}
