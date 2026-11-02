'use client';

// The Completed archive (v2.1 F-05, /tasks/completed): every finished task,
// grouped by the day it was finished, with a search, a way back onto the
// board, Delete, and a Select mode to delete several at once. Finished work
// rests here; nothing in it is counted or graded.
import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Shell } from 'lucide-react';
import { fill } from '@/copy/en';
import { doneCopy as t } from '@/copy/doneCopy';
import { getTaskType } from '@/data/taskTypes';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { completedTasks } from '@/lib/repo/taskQueries';
import { moveTask } from '@/lib/repo/tasks';
import { openTaskDelete } from '@/lib/taskSheets';
import { formatTime, relativeDayLabel } from '@/lib/time';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { SIZES } from '@/lib/companion/registry';
import { CompanionHost } from '@/components/companion/CompanionHost';

function Row({ task, shellId, selecting, selected, onSelect }: { task: Task; shellId?: string; selecting: boolean; selected: boolean; onSelect: (on: boolean) => void }) {
  const type = getTaskType(task.type);
  const Icon = type.icon;
  return (
    <li className="card flex flex-col gap-2 p-3">
      <div className="flex items-start gap-3">
        {selecting && (
          // The box is 24px; its label makes the target 48px.
          <label htmlFor={`pick-${task.id}`} className="-m-3 flex size-12 shrink-0 cursor-pointer items-center justify-center">
            <Checkbox
              id={`pick-${task.id}`}
              aria-label={fill(t.selectTask, { title: task.title })}
              checked={selected}
              onCheckedChange={(on) => onSelect(on === true)}
            />
          </label>
        )}
        <Icon aria-hidden className="mt-1 size-5 shrink-0 text-ink-soft" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold break-words">{task.title}</span>
          <span className="text-caption text-ink-soft">
            {type.label} · {fill(t.finishedAt, { time: formatTime(task.doneAt ?? 0) })}
          </span>
        </div>
      </div>
      {!selecting && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void moveTask(task.id, 'in_progress')}>
            {t.moveBack}
          </Button>
          <Button variant="quiet" size="sm" onClick={() => openTaskDelete([task.id])}>
            {t.delete}
          </Button>
          {shellId && (
            <Button variant="link" size="inline" asChild>
              <Link href={`/shore?item=${shellId}`}>
                <Shell aria-hidden className="size-4" />
                {t.onShore}
              </Link>
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export function CompletedArchive() {
  const data = useLiveQuery(async () => {
    const [tasks, wins] = await Promise.all([completedTasks(), db.wins.toArray()]);
    // The shell a finished task left on the shore, if it's still there.
    const shells = new Map(wins.filter((w) => w.kind === 'task_done' && w.refId).map((w) => [w.refId!, w.id]));
    return { tasks, shells };
  }, []);
  const [query, setQuery] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  if (!data) return <ScreenSkeleton rows={4} rowClassName="h-20" />;

  const at = now();
  const q = query.trim().toLowerCase();
  const shown = q ? data.tasks.filter((task) => task.title.toLowerCase().includes(q)) : data.tasks;
  // Only what's still listed counts as picked (a deleted task drops out).
  const selected = picked.filter((id) => shown.some((task) => task.id === id));
  const groups = new Map<string, Task[]>();
  for (const task of shown) {
    const day = relativeDayLabel(task.doneAt ?? 0, at);
    groups.set(day, [...(groups.get(day) ?? []), task]);
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="quiet" size="sm" className="self-start" asChild>
        <Link href="/tasks" data-nav="back">
          <ArrowLeft aria-hidden />
          {t.back}
        </Link>
      </Button>
      <h2 className="text-h1 font-extrabold">{t.title}</h2>

      {data.tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CompanionHost placement="empty" size={SIZES.md} base="idle" bubble="none" noneAlt="waves" decorative />
          <p className="text-ink-soft">{t.empty}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
              <label htmlFor="completed-search" className="font-bold">
                {t.search}
              </label>
              <input
                id="completed-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setSelecting(!selecting);
                setPicked([]);
              }}
            >
              {selecting ? t.cancelSelect : t.select}
            </Button>
          </div>
          {selecting && (
            <Button variant="notice" className="self-start" disabled={selected.length === 0} onClick={() => openTaskDelete(selected)}>
              {fill(t.deleteSelected, { n: selected.length })}
            </Button>
          )}
          {shown.length === 0 && <p className="text-ink-soft">{fill(t.noMatch, { q: query.trim() })}</p>}
          {[...groups].map(([day, tasks]) => (
            <section key={day} className="flex flex-col gap-2" aria-label={day}>
              <h3 className="text-h3 font-bold">{day}</h3>
              <ul className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <Row
                    key={task.id}
                    task={task}
                    shellId={data.shells.get(task.id)}
                    selecting={selecting}
                    selected={selected.includes(task.id)}
                    onSelect={(on) => setPicked(on ? [...picked, task.id] : picked.filter((id) => id !== task.id))}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
