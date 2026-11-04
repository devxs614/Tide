'use client';

// The top of Today: how Maya checked in today, or a gentle invitation to
// check in if she hasn't yet. Only today's check-ins count; yesterday's mood
// shouldn't greet her this morning. On a low day it also shows a win from a
// day that felt the same.
import { copy } from '@/copy/en';
import { useCheckInSheet } from '@/lib/ui';
import type { CheckIn } from '@/lib/types';
import { StateChip } from '@/components/ui/StateChip';
import { Button } from '@/components/ui/button';
import { WinCard } from './WinCard';
import { openQuickCheckIn } from '@/lib/checkin/quickCheckIn';

export function StateCard({ latest }: { latest: CheckIn | null }) {
  const { openCheckIn } = useCheckInSheet();
  return (
    <section aria-labelledby="state-heading" className="flex flex-col gap-3 card p-4">
      <h2 id="state-heading" className={latest ? 'sr-only' : 'text-h3 font-bold'}>
        {latest ? copy.today.yourState : copy.today.arriving}
      </h2>
      {latest ? (
        <>
          <StateChip checkIn={latest} />
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Button variant="link" size="inline" className="self-start" onClick={openCheckIn}>
              {copy.today.checkInAgain}
            </Button>
            {/* v2.3 Item 1: two taps instead of words. */}
            <Button variant="link" size="inline" className="self-start" onClick={openQuickCheckIn}>
              {copy.today.quickCheckIn}
            </Button>
          </div>
          <WinCard latest={latest} />
        </>
      ) : (
        <Button className="self-start" onClick={openCheckIn}>
          {copy.today.checkIn}
        </Button>
      )}
    </section>
  );
}
