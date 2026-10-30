'use client';

// The Collection (v2 spec 13.8): a field guide to the shore, not a checklist.
// Each kind of item, how many Maya has found and when the first one came;
// kinds she hasn't found are soft outlines with how they arrive. No progress
// bar, no percentage. Then the notes she let drift, still readable, and the
// pearls from her firsts.
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { FEATURE_WORDS, SHORE_ITEMS, SHORE_ITEM_TYPES } from '@/data/shoreItems';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { useSettings } from '@/lib/settings';
import { shoreItems } from '@/lib/shore/items';
import { formatLongDate } from '@/lib/time';
import type { FirstFeature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ItemArt } from './ItemArt';
import { ScreenSkeleton } from '@/components/ui/skeleton';

export function CollectionScreen() {
  const { settings } = useSettings();
  const wins = useLiveQuery(() => db.wins.toArray(), []);
  const released = useLiveQuery(() => db.bottles.filter((b) => !!b.releasedAt).toArray(), []) ?? [];
  const items = shoreItems(wins ?? [], settings.firsts, 'all', now());
  const pearls = (Object.entries(settings.firsts) as Array<[FirstFeature, number]>).sort((a, b) => a[1] - b[1]);
  // Otherwise every item would show as "not found yet" for a moment.
  if (!wins) return <ScreenSkeleton rows={4} rowClassName="h-32" />;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="quiet" size="sm" className="self-start" asChild>
        <Link href="/shore">
          <ArrowLeft aria-hidden />
          {copy.shore.backToShore}
        </Link>
      </Button>
      <h2 className="text-h1 font-extrabold">{copy.shore.collectionTitle}</h2>
      <ul className="grid grid-cols-2 gap-3">
        {SHORE_ITEM_TYPES.map((type) => {
          const found = items.filter((i) => i.type === type).sort((a, b) => a.ts - b.ts);
          const info = SHORE_ITEMS[type];
          return (
            <li key={type} className="card flex flex-col items-center gap-1 p-3 text-center">
              <svg aria-hidden viewBox="-24 -24 48 48" className={found.length ? 'size-16' : 'size-16 opacity-35 grayscale'}>
                <ItemArt type={type} variant={found[0]?.variant ?? 'medium'} />
              </svg>
              <h3 className="font-display font-extrabold">{info.name}</h3>
              {found.length ? (
                <>
                  <p className="text-small font-bold">{fill(copy.shore.found, { n: found.length })}</p>
                  <p className="text-caption text-ink-soft">{fill(copy.shore.firstFound, { date: formatLongDate(found[0].ts) })}</p>
                </>
              ) : (
                <>
                  <p className="text-small text-ink-soft">{copy.shore.notFound}</p>
                  <p className="text-caption text-ink-soft">{info.howTo}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="released-notes" className="flex flex-col gap-2">
        <h3 id="released-notes" className="text-h3 font-extrabold">
          {copy.shore.releasedNotes}
        </h3>
        {released.length === 0 && <p className="text-ink-soft">{copy.shore.noReleased}</p>}
        {released.map((b) => (
          <figure key={b.id} className="card-flat p-3">
            <blockquote className="font-display">{b.text}</blockquote>
            <figcaption className="text-caption text-ink-soft">{fill(copy.bottle.wroteOn, { date: formatLongDate(b.ts) })}</figcaption>
          </figure>
        ))}
      </section>

      {pearls.length > 0 && (
        <section aria-labelledby="pearls" className="flex flex-col gap-2">
          <h3 id="pearls" className="text-h3 font-extrabold">
            {copy.shore.pearls}
          </h3>
          <ul className="flex flex-col gap-1">
            {pearls.map(([feature, ts]) => (
              <li key={feature} className="flex items-center gap-2">
                <svg aria-hidden viewBox="-12 -12 24 24" className="size-6">
                  <ItemArt type="pearl" variant="plain" />
                </svg>
                {SHORE_ITEMS.pearl.description.replace('{feature}', FEATURE_WORDS[feature])} · {formatLongDate(ts)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
