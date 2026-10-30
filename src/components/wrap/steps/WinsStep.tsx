'use client';

// Step 4, "Wins wash up": today's things on a little strip of shore, each
// one readable. With none: "Some days are about getting through. That
// counts too." and a way to add something Maya did (a sand dollar).
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy } from '@/copy/en';
import { SHORE_ITEMS } from '@/data/shoreItems';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { addWin } from '@/lib/repo/wins';
import { useSettings } from '@/lib/settings';
import { shoreItems } from '@/lib/shore/items';
import { toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { ItemArt } from '@/components/shore/ItemArt';
import type { WrapStepProps } from '../WrapStep';

export function WinsStep({ facts }: WrapStepProps) {
  const { settings } = useSettings();
  const wins = useLiveQuery(() => db.wins.toArray(), []) ?? [];
  // The wrap's own date, which after midnight is still yesterday.
  const items = shoreItems(wins, settings.firsts, 'all', now()).filter((i) => toISODate(i.ts) === facts.date);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.winsTitle}</h1>
      {items.length === 0 && <p>{copy.wrap.noWins}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={item.id} className="stagger-in card-flat flex items-center gap-3 p-3" style={{ '--i': i } as React.CSSProperties}>
            <svg aria-hidden viewBox="-24 -24 48 48" className="size-10 shrink-0">
              <ItemArt type={item.type} variant={item.variant} />
            </svg>
            <span className="flex flex-col">
              <span className="font-bold">{SHORE_ITEMS[item.type].name}</span>
              <span className="text-small text-ink-soft">{item.winText ?? item.description}</span>
            </span>
          </li>
        ))}
      </ul>
      {adding ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            void addWin(text.slice(0, 200), 'manual', undefined, 'manual');
            setText('');
            setAdding(false);
          }}
        >
          <label htmlFor="wrap-win" className="font-bold">
            {copy.wrap.addWinLabel}
          </label>
          <input id="wrap-win" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} className="min-h-12 rounded-input border-2 border-line bg-surface px-3" />
          <Button type="submit">{copy.global.save}</Button>
        </form>
      ) : (
        <Button variant="secondary" className="self-start" onClick={() => setAdding(true)}>
          {copy.wrap.addWin}
        </Button>
      )}
    </>
  );
}
