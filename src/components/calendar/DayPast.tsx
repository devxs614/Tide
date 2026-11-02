'use client';

// A day that's over (v2.1 F-10, spec 14.4): a read-only look back. Its
// events, check-ins with their times, tasks finished that day, what washed
// up on the shore, the strategies tried, and the day's close if there was
// one. Nothing here is counted or graded.
import { fill } from '@/copy/en';
import { calendarCopy as t } from '@/copy/calendarCopy';
import { strategyName } from '@/data/strategies';
import type { DayDetail } from '@/lib/calendar/data';
import { formatTime } from '@/lib/time';
import { StateChip } from '@/components/ui/StateChip';
import { TaskCard } from '@/components/tasks/TaskCard';
import { EventRows } from './EventRows';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="text-h3 font-bold">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function DayPast({ day }: { day: DayDetail }) {
  const closed = day.wrap?.completedAt;
  const empty = !day.events.length && !day.checkins.length && !day.finished.length && !day.wins.length && !day.strategies.length && !closed;
  if (empty) return <p className="text-ink-soft">{t.pastEmpty}</p>;
  const highlight = day.wrap?.aiSummary?.highlight;
  return (
    <div className="flex flex-col gap-5">
      {closed && <p className="rounded-card bg-surface-2 p-3">{highlight ? fill(t.closedDay, { highlight }) : t.closedNoHighlight}</p>}
      {day.events.length > 0 && (
        <Section id="past-events" title={t.eventsHeading}>
          <EventRows events={day.events} />
        </Section>
      )}
      {day.checkins.length > 0 && (
        <Section id="past-checkins" title={t.checkinsHeading}>
          <ul className="flex flex-wrap gap-2">
            {day.checkins.map((c) => (
              <li key={c.id}>
                <StateChip checkIn={c} />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {day.finished.length > 0 && (
        <Section id="past-finished" title={t.finishedHeading}>
          <ul className="flex flex-col gap-2">
            {day.finished.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} compact />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {day.wins.length > 0 && (
        <Section id="past-wins" title={t.winsHeading}>
          <ul className="flex flex-col gap-1">
            {day.wins.map((w) => (
              <li key={w.id} className="break-words">
                <span className="text-ink-soft">{formatTime(w.ts)}</span> {w.text}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {day.strategies.length > 0 && (
        <Section id="past-strategies" title={t.strategiesHeading}>
          <ul className="flex flex-col gap-1">
            {day.strategies.map((u) => (
              <li key={u.id}>
                <span className="text-ink-soft">{formatTime(u.ts)}</span> {strategyName(u.strategyId)}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
