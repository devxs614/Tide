'use client';

// The top of Today: how Maya checked in today, or a gentle invitation to
// check in if she hasn't yet. It shows only today's check-ins; yesterday's
// mood shouldn't greet her this morning.
import { useLiveQuery } from 'dexie-react-hooks';
import { copy } from '@/copy/en';
import { db } from '@/lib/db';
import { now } from '@/lib/clock';
import { startOfDay } from '@/lib/time';
import { useCheckInSheet } from '@/lib/ui';
import { StateChip } from '@/components/ui/StateChip';
import { Button } from '@/components/ui/button';
import type { CheckIn } from '@/lib/types';
import type { ReactNode } from 'react';

export function useTodaysLatestCheckIn(): CheckIn | undefined | null {
  const dayStart = startOfDay(now());
  return useLiveQuery(
    async () =>
      (await db.checkins
        .where('ts')
        .aboveOrEqual(dayStart)
        .reverse()
        .filter((c) => !c.safetyTriggered && c.ts <= now())
        .first()) ?? null,
    [dayStart],
  );
}

export function StateCard({ children }: { children?: ReactNode }) {
  const latest = useTodaysLatestCheckIn();
  const { openCheckIn } = useCheckInSheet();

  if (latest === undefined) return <div className="min-h-28" aria-hidden />;

  return (
    <section aria-labelledby="state-heading" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <h2 id="state-heading" className={latest ? 'sr-only' : 'text-h3 font-bold'}>
        {latest ? copy.today.yourState : copy.today.arriving}
      </h2>
      {latest ? (
        <>
          <StateChip checkIn={latest} />
          <Button variant="link" size="inline" className="self-start" onClick={openCheckIn}>
            {copy.today.checkInAgain}
          </Button>
        </>
      ) : (
        <Button className="self-start" onClick={openCheckIn}>
          {copy.today.checkIn}
        </Button>
      )}
      {children}
    </section>
  );
}
