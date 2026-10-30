// The v2 additions to the demo seed (v2 spec 16.10), built on top of the v1
// seed, which stays exactly as it was. Maya now has Lolo, the Lagoon theme,
// twelve closed days in her history (which plant exactly one wrap pattern:
// days with box breathing ended okay more often), and a note in a bottle
// from October 29 that surfaces on the demo afternoon.
import { DEMO_START } from '@/lib/clock';
import { DAY, toISODate } from '@/lib/time';
import type { Bottle, DayWrap, Overall, Settings, StrategyUse } from '@/lib/types';

export const DEMO_SETTINGS_V2: Partial<Settings> = {
  'companion.species': 'axolotl',
  'companion.name': 'Lolo',
  'companion.variant': 'pink',
  'companion.accessory': 'scarf',
  'companion.talkativeness': 'some',
  'appearance.theme': 'lagoon',
  'appearance.followSystem': false,
  'appearance.font': 'playful',
  'motion.level': 'lively',
  'sound.enabled': false,
  schemaVersion: 2,
  'whatsNew.seen': true,
  'shore.lastSeenAt': DEMO_START - 2 * 60 * 60 * 1000,
};

const at = (date: string, h: number) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, h, 0).getTime();
};

function wrap(date: string, overall: Overall, helped: string[], hard: string[]): DayWrap {
  return { date, startedAt: at(date, 20), completedAt: at(date, 21), step: 13, helped, hard, carryover: [], overall };
}

// Twelve of the 21 past days: the days with box breathing (the v1 seed has
// five; four ended okay or good) and six without (one did), so
// `wrapHelped:c-box` shows. Adding box-breathing uses to reach the spec's
// six would change the v1 patterns, so the seed keeps v1's five (D112).
export function demoDayWraps(strategyUses: StrategyUse[]): DayWrap[] {
  const boxDays = new Set(strategyUses.filter((u) => u.strategyId === 'c-box').map((u) => toISODate(u.ts)));
  const past = Array.from({ length: 21 }, (_, i) => toISODate(DEMO_START - (21 - i) * DAY));
  const withBox = past.filter((d) => boxDays.has(d)).slice(0, 6);
  const without = past.filter((d) => !boxDays.has(d) && [2, 4].includes(new Date(at(d, 12)).getDay())).concat(past.filter((d) => !boxDays.has(d))).filter((d, i, all) => all.indexOf(d) === i).slice(0, 6);
  const withOverall: Overall[] = ['okay', 'good', 'okay', 'good', 'hard', 'mixed'];
  const withoutOverall: Overall[] = ['hard', 'mixed', 'okay', 'very_hard', 'mixed', 'hard'];
  return [
    ...withBox.map((d, i) => wrap(d, withOverall[i], ['strategy:c-box', 'general:person'], i % 2 ? ['general:switching'] : ['general:starting'])),
    ...without.map((d, i) => wrap(d, withoutOverall[i], i % 2 ? ['general:break'] : ['general:music'], ['general:starting', 'general:tooMuch'])),
  ];
}

export const DEMO_BOTTLE: Bottle = {
  id: 'demo-bottle-1',
  ts: new Date(2026, 9, 29, 21, 10).getTime(),
  text: "You've done hard weeks before. Breathe first, then just the title.",
  fromWrapDate: '2026-10-29',
};
