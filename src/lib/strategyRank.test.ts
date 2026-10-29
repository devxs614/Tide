import { describe, expect, it } from 'vitest';
import { rankStrategies } from './strategyRank';
import { DAY } from './time';
import type { RecheckResult, StrategyUse } from './types';

const NOW = new Date(2026, 10, 5, 15, 40).getTime();

function uses(strategyId: string, results: RecheckResult[], daysAgo = 2): StrategyUse[] {
  return results.map((result, i) => ({
    id: `${strategyId}-${i}`,
    strategyId,
    ts: NOW - daysAgo * DAY,
    context: 'toolkit',
    result,
  }));
}

describe('rankStrategies', () => {
  it('puts strategies that suit the current state first when there is no history', () => {
    const ranked = rankStrategies({ quadrant: 'surge', uses: [], context: 'toolkit', now: NOW });
    expect(ranked[0].strategy.suits).toContain('surge');
  });

  it('lifts a strategy that worked for this person above the defaults', () => {
    const ranked = rankStrategies({
      quadrant: 'surge',
      uses: uses('m-shake-20', ['better', 'better', 'better', 'better']),
      context: 'toolkit',
      now: NOW,
    });
    // (4+1)/(4+2) = 0.83 beats any untried strategy at 0.5 + 0.2.
    expect(ranked[0].strategy.id).toBe('m-shake-20');
    expect(ranked[0].better).toBe(4);
  });

  it('sinks a strategy that made things worse twice in the last four weeks', () => {
    const ranked = rankStrategies({
      quadrant: 'surge',
      uses: uses('c-box', ['worse', 'worse']),
      context: 'toolkit',
      now: NOW,
    });
    const box = ranked.find((r) => r.strategy.id === 'c-box')!;
    expect(box.suppressed).toBe(true);
    expect(ranked.at(-1)!.strategy.id).toBe('c-box');
  });

  it('forgets old "worse" results after four weeks', () => {
    const ranked = rankStrategies({
      quadrant: 'surge',
      uses: uses('c-box', ['worse', 'worse'], 40),
      context: 'toolkit',
      now: NOW,
    });
    expect(ranked.find((r) => r.strategy.id === 'c-box')!.suppressed).toBe(false);
  });

  it('only offers strategies of three minutes or less for a bridge, shortest first on ties', () => {
    const ranked = rankStrategies({ quadrant: 'ebb', uses: [], context: 'bridge', now: NOW });
    expect(ranked.every((r) => r.strategy.durationSec <= 180)).toBe(true);
    const topScore = ranked[0].score;
    const tied = ranked.filter((r) => r.score === topScore);
    const durations = tied.map((r) => r.strategy.durationSec);
    expect(durations).toEqual([...durations].sort((a, b) => a - b));
  });
});
