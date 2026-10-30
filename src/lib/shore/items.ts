// The things on Maya's shore for a range of days (v2 spec 13.2–13.4): one
// item per win, plus a pearl for each first time she used a feature. Each
// carries the words shown when she taps it.
import { FEATURE_WORDS, SHORE_ITEMS, itemForWin, type ItemVariant, type ShoreItemType } from '@/data/shoreItems';
import { strategyName } from '@/data/strategies';
import { DAY, toISODate } from '@/lib/time';
import type { FirstFeature, Settings, Win } from '@/lib/types';

export type ShoreRange = 'today' | 'week' | 'all';

export interface ShoreItem {
  id: string;
  ts: number;
  type: ShoreItemType;
  variant: ItemVariant;
  // What the item means ("A starfish. 3-minute walk helped.").
  description: string;
  // The win itself, if this item came from one.
  winText?: string;
}

export function inRange(ts: number, range: ShoreRange, nowTs: number): boolean {
  if (range === 'all') return true;
  if (range === 'today') return toISODate(ts) === toISODate(nowTs);
  return ts > nowTs - 7 * DAY;
}

export function shoreItems(wins: Win[], firsts: Settings['firsts'], range: ShoreRange, nowTs: number): ShoreItem[] {
  const fromWins = wins.map((win): ShoreItem => {
    const { type, variant } = itemForWin(win);
    const strategy = win.meta?.strategyId ? strategyName(win.meta.strategyId) : '';
    return {
      id: win.id,
      ts: win.ts,
      type,
      variant,
      description: SHORE_ITEMS[type].description.replace('{strategy}', strategy || 'A strategy'),
      winText: win.text,
    };
  });
  const pearls = (Object.entries(firsts) as Array<[FirstFeature, number]>).map(
    ([feature, ts]): ShoreItem => ({
      id: `pearl-${feature}`,
      ts,
      type: 'pearl',
      variant: 'plain',
      description: SHORE_ITEMS.pearl.description.replace('{feature}', FEATURE_WORDS[feature]),
    }),
  );
  return [...fromWins, ...pearls].filter((item) => inRange(item.ts, range, nowTs));
}
