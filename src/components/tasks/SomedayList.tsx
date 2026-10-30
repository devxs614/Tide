'use client';

// "Someday" under the board (v2 spec 18.5): tasks Maya let go of in Close
// the day. They're out of Today, Day Mode and loose ends, never deleted, and
// one tap brings any of them back.
import { copy, fill } from '@/copy/en';
import { bringBack } from '@/lib/repo/tasks';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function SomedayList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;
  return (
    <details className="card-flat p-4">
      <summary className="min-h-12 cursor-pointer font-display font-extrabold">{fill(copy.wrap.someday, { n: tasks.length })}</summary>
      <p className="text-small text-ink-soft">{copy.wrap.somedayHint}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <span className="flex-1">{t.title}</span>
            <Button variant="secondary" size="sm" onClick={() => void bringBack(t.id)}>
              {copy.wrap.bringBack}
            </Button>
          </li>
        ))}
      </ul>
    </details>
  );
}
