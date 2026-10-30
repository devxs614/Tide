'use client';

// Step 13, goodnight: the day is closed. The wrap is saved as complete, a
// piece of driftwood washes up on the shore, the companion falls asleep,
// and the celebration fits how the evening check-in said Maya feels.
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { copy, fill } from '@/copy/en';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';
import { emitCompanion } from '@/lib/companion/bus';
import { completeWrap } from '@/lib/repo/dayWraps';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import type { WrapStepProps } from '../WrapStep';

export function GoodnightStep({ wrap }: WrapStepProps) {
  const router = useRouter();
  const { settings } = useSettings();
  const celebrate = useCelebrate();
  const done = useRef(false);
  const name = settings.name.trim();

  useEffect(() => {
    if (done.current || wrap.completedAt) return;
    done.current = true;
    void (async () => {
      await completeWrap(wrap.date, copy.wrap.winText);
      emitCompanion({ type: 'wrapEnded' });
      const first = !settings.firsts.wrap;
      void celebrate(first ? 'firstTime' : 'wrapDone', { feature: 'wrap', tier: first ? 'big' : undefined });
    })();
  }, [wrap, settings.firsts.wrap, celebrate]);

  return (
    <>
      <h1 className="text-h1 font-extrabold">{name ? fill(copy.wrap.goodnight, { name }) : copy.wrap.goodnightNoName}</h1>
      <div className="mt-auto">
        <Button size="block" onClick={() => router.push('/')}>
          {copy.wrap.done}
        </Button>
      </div>
    </>
  );
}
