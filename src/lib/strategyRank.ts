// Orders strategies for a given state, using what has actually worked for
// Maya. Personal results come first (smoothed so one lucky try doesn't jump
// to the top), then default suitability for her current state. Anything that
// made her feel worse twice in the last four weeks sinks to the bottom and is
// never offered automatically.
import { STRATEGIES, type Strategy } from '@/data/strategies';
import { DAY } from './time';
import type { Quadrant, StrategyContext, StrategyUse } from './types';

export interface RankedStrategy {
  strategy: Strategy;
  better: number; // re-checks that came back "better"
  n: number; // re-checks with any result
  worseRecent: number; // "worse" results in the last 28 days
  score: number;
  suppressed: boolean; // true when it must not be auto-suggested
}

export const BRIDGE_MAX_SECONDS = 180;

export function strategyStats(strategyId: string, uses: StrategyUse[], nowTs: number) {
  const rated = uses.filter((u) => u.strategyId === strategyId && u.result);
  const since = nowTs - 28 * DAY;
  return {
    better: rated.filter((u) => u.result === 'better').length,
    n: rated.length,
    worseRecent: rated.filter((u) => u.result === 'worse' && u.ts >= since).length,
  };
}

export function rankStrategies(opts: {
  quadrant?: Quadrant;
  uses: StrategyUse[];
  context: StrategyContext;
  now: number;
}): RankedStrategy[] {
  const pool = STRATEGIES.filter((s) => {
    if (!s.contexts.includes(opts.context)) return false;
    // Bridges happen minutes before the next thing starts, so only short
    // strategies make sense there.
    return opts.context !== 'bridge' || s.durationSec <= BRIDGE_MAX_SECONDS;
  });

  const ranked = pool.map((strategy) => {
    const stats = strategyStats(strategy.id, opts.uses, opts.now);
    // Laplace smoothing: no data scores 0.5, 4 of 5 scores 0.71.
    const personal = (stats.better + 1) / (stats.n + 2);
    const suits = opts.quadrant && strategy.suits.includes(opts.quadrant) ? 0.2 : 0;
    return {
      strategy,
      ...stats,
      score: personal + suits,
      suppressed: stats.worseRecent >= 2,
    };
  });

  return ranked.sort((a, b) => {
    if (a.suppressed !== b.suppressed) return a.suppressed ? 1 : -1;
    if (b.score !== a.score) return b.score - a.score;
    if (opts.context === 'bridge' && a.strategy.durationSec !== b.strategy.durationSec) {
      return a.strategy.durationSec - b.strategy.durationSec;
    }
    return STRATEGIES.indexOf(a.strategy) - STRATEGIES.indexOf(b.strategy);
  });
}
