'use client';

// "How was the switch from Chemistry lab to Calculus?" on Today, ten minutes
// after the next event started. Easy, Okay or Hard, one tap. Easy and Okay
// go into the proof log; every answer helps the patterns.
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { getPendingRating } from '@/lib/bridge';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { rateTransition, transitionLabels } from '@/lib/repo/transitions';
import { DAY } from '@/lib/time';
import type { TransitionRating as Rating } from '@/lib/types';
import { Button } from '@/components/ui/button';

const RATINGS: Rating[] = ['easy', 'okay', 'hard'];

export function TransitionRating({ nowTs }: { nowTs: number }) {
  const bucket = Math.floor(nowTs / 30_000);
  const pending = useLiveQuery(async () => {
    const at = now();
    const [transitions, events] = await Promise.all([
      db.transitions.toArray(),
      db.events.where('start').between(at - 2 * DAY, at, true, true).toArray(),
    ]);
    const t = getPendingRating(at, transitions, events);
    return t ? { t, labels: await transitionLabels(t) } : null;
  }, [bucket]);

  if (!pending) return null;
  const { t, labels } = pending;
  const rate = async (r: Rating) => {
    await rateTransition(t.id, r);
    toast(copy.bridge.rated);
  };
  return (
    <section aria-labelledby="rate-heading" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <h2 id="rate-heading" className="text-h3 font-bold">
        {fill(copy.bridge.rate, { from: labels.from, to: labels.to })}
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {RATINGS.map((r) => (
          <Button key={r} variant="secondary" onClick={() => void rate(r)}>
            {copy.bridge.ratings[r]}
          </Button>
        ))}
      </div>
    </section>
  );
}
