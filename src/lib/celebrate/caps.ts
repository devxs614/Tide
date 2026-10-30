// Celebration frequency caps (v2 spec 10.4): at most one big overlay every
// 10 minutes and three small celebrations a minute. A burst of wins is still
// acknowledged, just more quietly, so the app never turns into a slot
// machine. Kept in memory: a reload starting fresh is harmless.
import type { Tier } from './matrix';

const BIG_GAP_MS = 10 * 60 * 1000;
const SMALL_WINDOW_MS = 60 * 1000;
const SMALL_MAX = 3;

let lastBig = Number.NEGATIVE_INFINITY;
let smalls: number[] = [];

export function capTier(tier: Tier, nowTs: number): Tier {
  let result = tier;
  if (result === 'big') {
    if (nowTs - lastBig < BIG_GAP_MS) result = 'small';
    else lastBig = nowTs;
  }
  if (result === 'small') {
    smalls = smalls.filter((t) => nowTs - t < SMALL_WINDOW_MS);
    if (smalls.length >= SMALL_MAX) result = 'micro';
    else smalls.push(nowTs);
  }
  return result;
}

export function resetCelebrationCapsForTests(): void {
  lastBig = Number.NEGATIVE_INFINITY;
  smalls = [];
}
