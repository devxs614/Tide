'use client';

// "A bottle washed up" on Today (v2 spec 12, 13.7): on a hard day, a note
// Maya wrote to herself at least a day ago. One a day at most.
import '@/components/shore/shore.css';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy } from '@/copy/en';
import { now } from '@/lib/clock';
import { getEligibleBottle, markSurfaced } from '@/lib/repo/bottles';
import type { Bottle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// The dialog only loads when a bottle is actually opened.
const BottleOpenDialog = dynamic(() => import('@/components/shore/BottleOpenDialog').then((m) => m.BottleOpenDialog), { ssr: false });
import { ItemArt } from '@/components/shore/ItemArt';

export function BottleCard() {
  const bottle = useLiveQuery(() => getEligibleBottle(now()), []);
  const [opening, setOpening] = useState<Bottle | null>(null);
  const id = bottle?.id;
  useEffect(() => {
    if (id) void markSurfaced(id);
  }, [id]);
  return (
    <>
      {bottle && (
        <section aria-labelledby="bottle-card" className="card flex items-center gap-3 p-4">
          <svg aria-hidden viewBox="-24 -24 48 48" className="shore-bob size-14 shrink-0">
            <ItemArt type="bottle" variant="green" />
          </svg>
          <div className="flex flex-1 flex-col gap-1">
            <h2 id="bottle-card" className="text-h3 font-extrabold">
              {copy.bottle.cardTitle}
            </h2>
            <p className="text-small text-ink-soft">{copy.bottle.cardBody}</p>
            <Button size="sm" className="self-start" onClick={() => setOpening(bottle)}>
              {copy.bottle.open}
            </Button>
          </div>
        </section>
      )}
      {opening && <BottleOpenDialog bottle={opening} onClose={() => setOpening(null)} />}
    </>
  );
}
