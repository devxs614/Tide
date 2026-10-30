'use client';

// "Proof I can": things Maya did, grouped by day, kept for the days that feel
// heavy. There are no counts, totals, streaks or comparisons anywhere, and
// nothing here can ever go down. She can add her own wins and the small
// rewards Tide may suggest after a focus block.
import { useLiveQuery } from 'dexie-react-hooks';
import { copy } from '@/copy/en';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { relativeDayLabel, toISODate } from '@/lib/time';
import type { Win } from '@/lib/types';
import { AddWinForm } from './AddWinForm';
import { RewardsList } from './RewardsList';
import { WinItem } from './WinItem';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

function groupByDay(wins: Win[]): Array<{ day: string; label: string; wins: Win[] }> {
  const groups: Array<{ day: string; label: string; wins: Win[] }> = [];
  const at = now();
  for (const w of wins) {
    const day = toISODate(w.ts);
    const last = groups.at(-1);
    if (last?.day === day) last.wins.push(w);
    else groups.push({ day, label: relativeDayLabel(w.ts, at), wins: [w] });
  }
  return groups;
}

export function ProofScreen() {
  const wins = useLiveQuery(async () => (await db.wins.orderBy('ts').reverse().toArray()).filter((w) => w.ts <= now()), []);
  if (!wins) return <ScreenSkeleton rows={3} />;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h1 font-bold">{copy.proof.title}</h2>
        <p className="text-ink-soft">{copy.proof.subtitle}</p>
      </div>
      <AddWinForm />
      {wins.length === 0 ? (
        <EmptyState body={copy.proof.empty} className="py-4" />
      ) : (
        groupByDay(wins).map((g) => (
          <section key={g.day} aria-labelledby={`day-${g.day}`} className="flex flex-col gap-2">
            <h3 id={`day-${g.day}`} className="font-bold">
              {g.label}
            </h3>
            <ul className="flex flex-col gap-2">
              {g.wins.map((w) => (
                <WinItem key={w.id} win={w} />
              ))}
            </ul>
          </section>
        ))
      )}
      <RewardsList />
    </div>
  );
}
