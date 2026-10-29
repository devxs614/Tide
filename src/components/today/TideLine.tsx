'use client';

// The Tide Line: the rest of Maya's day as one simple list. Finished events
// fold away under "Earlier today", a "Now" marker (in the color of how she
// checked in) splits past from future, today's tasks sit right under it,
// and anything Day Mode moved waits at the end with a "Bring back" button.
import { copy, fill } from '@/copy/en';
import { bringBackToday } from '@/lib/repo/dayPlans';
import { useSettings } from '@/lib/settings';
import { formatTime } from '@/lib/time';
import type { CalendarEvent, Quadrant, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { QuadrantDot } from '@/components/ui/QuadrantDot';

interface Props {
  events: CalendarEvent[];
  tasks: Task[];
  moved: Task[];
  nowTs: number;
  today: string;
  quadrant: Quadrant | null;
  onAddEvent: () => void;
  onAddTask: () => void;
}

function EventBlock({ event }: { event: CalendarEvent }) {
  return (
    <li className="flex flex-col border-l-4 border-line bg-surface py-2 pr-3 pl-4">
      <span className="font-bold break-words">{event.title}</span>
      <span className="text-caption text-ink-soft">
        {fill(copy.today.eventTime, { start: formatTime(event.start), end: formatTime(event.end) })}
        {event.place && ` · ${event.place}`}
      </span>
    </li>
  );
}

export function TideLine({ events, tasks, moved, nowTs, today, quadrant, onAddEvent, onAddTask }: Props) {
  const { settings } = useSettings();
  const earlier = events.filter((e) => e.end <= nowTs);
  const ongoing = events.filter((e) => e.start <= nowTs && e.end > nowTs);
  const upcoming = events.filter((e) => e.start > nowTs);
  const heading = settings.communicationMode === 'literal' ? copy.today.tideLineLiteral : copy.today.tideLine;

  return (
    <section aria-labelledby="tideline-heading" className="flex flex-col gap-3">
      <h2 id="tideline-heading" className="text-h3 font-bold">
        {heading}
      </h2>

      {earlier.length > 0 && (
        <details className="card">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 text-ink-soft">
            {fill(copy.today.earlierToday, { count: earlier.length })}
          </summary>
          <ul className="flex flex-col gap-2 p-3">
            {earlier.map((e) => (
              <EventBlock key={e.id} event={e} />
            ))}
          </ul>
        </details>
      )}

      {ongoing.length > 0 && (
        <ul className="flex flex-col gap-2">
          {ongoing.map((e) => (
            <EventBlock key={e.id} event={e} />
          ))}
        </ul>
      )}

      <p className="flex items-center gap-2 font-bold">
        {quadrant ? <QuadrantDot quadrant={quadrant} /> : <span aria-hidden className="size-3 rounded-full bg-ink-soft" />}
        <span aria-hidden className="h-px flex-1 bg-ink-soft" />
        <span>{fill(copy.today.now, { time: formatTime(nowTs) })}</span>
      </p>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold">{copy.today.todaysTasks}</h3>
        {tasks.length === 0 ? (
          <p className="flex flex-wrap items-center gap-x-2 text-ink-soft">
            {copy.today.noTasks}
            <Button variant="link" size="inline" onClick={onAddTask}>
              {copy.today.addTask}
            </Button>
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <li key={t.id}>
                <TaskCard task={t} compact />
              </li>
            ))}
          </ul>
        )}
      </div>

      {upcoming.length > 0 && (
        <ul className="flex flex-col gap-2">
          {upcoming.map((e) => (
            <EventBlock key={e.id} event={e} />
          ))}
        </ul>
      )}
      {events.length === 0 && (
        <p className="flex flex-wrap items-center gap-x-2 text-ink-soft">
          {copy.today.noEvents}
          <Button variant="link" size="inline" onClick={onAddEvent}>
            {copy.today.addEvent}
          </Button>
        </p>
      )}
      {events.length > 0 && (
        <Button variant="link" size="inline" className="self-start" onClick={onAddEvent}>
          {copy.today.addEvent}
        </Button>
      )}

      {moved.length > 0 && (
        <details className="card">
          <summary className="flex min-h-12 cursor-pointer items-center px-4">{fill(copy.today.movedGroup, { count: moved.length })}</summary>
          <ul className="flex flex-col gap-2 p-3">
            {moved.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="flex-1 break-words">{t.title}</span>
                <Button variant="secondary" size="sm" onClick={() => void bringBackToday(t.id, today)}>
                  {copy.today.bringBack}
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
