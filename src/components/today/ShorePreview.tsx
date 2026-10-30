'use client';

// A thin strip of Maya's shore on Today (v2 spec 12): sky, sea and sand
// with today's things on it. Tapping it opens the Shore. A small "New" pill
// (never a number) when something washed up since her last visit.
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy } from '@/copy/en';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { useSettings } from '@/lib/settings';
import { shoreItems } from '@/lib/shore/items';
import { ItemArt } from '@/components/shore/ItemArt';

export function ShorePreview() {
  const { settings } = useSettings();
  const wins = useLiveQuery(() => db.wins.toArray(), []);
  if (!wins) return null;
  const today = shoreItems(wins, settings.firsts, 'today', now()).slice(-8);
  const fresh = [...wins.map((w) => w.ts), ...Object.values(settings.firsts)].some((ts) => (ts ?? 0) > settings['shore.lastSeenAt']);
  return (
    <Link href="/shore" aria-label={copy.shorePreview.label} className="relative block h-24 overflow-hidden rounded-card border-2 border-line">
      <svg aria-hidden viewBox="0 0 390 96" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <rect width="390" height="96" fill="var(--sky-bottom)" />
        <path d="M0 30 Q48 24 97 30 T195 30 T292 30 T390 30 V96 H0 Z" fill="var(--sea)" opacity={0.7} />
        <path d="M0 52 Q100 42 200 50 T390 48 V96 H0 Z" fill="var(--sand)" />
      </svg>
      <svg aria-hidden viewBox="0 0 390 96" className="absolute inset-0 size-full">
        {today.map((item, i) => (
          <g key={item.id} transform={`translate(${40 + i * 44} 74) scale(0.7)`}>
            <ItemArt type={item.type} variant={item.variant} />
          </g>
        ))}
      </svg>
      {fresh && (
        <span className="absolute top-2 right-2 rounded-full bg-primary px-2.5 py-0.5 font-display text-caption font-bold text-on-primary">
          {copy.shorePreview.newPill}
        </span>
      )}
    </Link>
  );
}
