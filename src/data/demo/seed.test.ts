// The demo seed must plant exactly the three patterns in Section 14.2, with
// those numbers, and nothing else. If a future change to the seed or the
// engine adds an accidental pattern, this is the test that says so.
import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_START, setDemoClock } from '@/lib/clock';
import { computePatterns } from '@/lib/patterns/engine';
import { loadPatternInput } from '@/lib/patterns/data';
import { getUpcomingTransition } from '@/lib/bridge';
import { DEMO_JUMP_TIME, loadDemoData } from '@/lib/repo/demo';
import { getSettings } from '@/lib/repo/settings';
import { db } from '@/lib/db';
import { toISODate } from '@/lib/time';
import { buildDemoData } from './seed';

beforeEach(() => setDemoClock(null));

describe('demo seed', () => {
  it('is the same on every run', () => {
    expect(JSON.stringify(buildDemoData())).toBe(JSON.stringify(buildDemoData()));
  });

  it('plants exactly the three patterns, with the exact numbers', async () => {
    await loadDemoData();
    const patterns = computePatterns(await loadPatternInput(DEMO_START, 28));
    expect(patterns.map((p) => p.key).sort()).toEqual([
      'hardTransition:lab:class',
      'strategyBeforeTask:m-walk-3:writing',
      'strategyEffect:c-box',
    ]);
    const byKey = Object.fromEntries(patterns.map((p) => [p.key, p]));
    expect(byKey['strategyBeforeTask:m-walk-3:writing']).toMatchObject({ k: 4, n: 5, confidence: 2 });
    expect(byKey['strategyBeforeTask:m-walk-3:writing'].facts.baselinePct).toBe(25);
    expect(byKey['hardTransition:lab:class']).toMatchObject({ k: 3, n: 4, confidence: 1 });
    expect(byKey['hardTransition:lab:class'].facts).toMatchObject({ withStrategyName: 'Box breathing', withStrategyHardK: 1, withStrategyN: 2 });
    expect(byKey['strategyEffect:c-box']).toMatchObject({ k: 4, n: 5, confidence: 2 });
    expect(patterns[0].key).toBe('strategyBeforeTask:m-walk-3:writing');
  });

  it('keeps Ebb check-ins off Oct 30 – Nov 4 so the win card picks Thursday\'s lab outline', () => {
    const data = buildDemoData();
    const ebbDays = new Set(data.checkins.filter((c) => c.quadrant === 'ebb').map((c) => toISODate(c.ts)));
    expect(ebbDays.has('2026-10-29')).toBe(true);
    for (const day of ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']) expect(ebbDays.has(day)).toBe(false);
    const latestEbbWin = data.wins.filter((w) => ebbDays.has(toISODate(w.ts))).sort((a, b) => b.ts - a.ts)[0];
    expect(latestEbbWin.text).toBe('Finished: Lab outline');
    expect(data.checkins.some((c) => toISODate(c.ts) === '2026-11-05')).toBe(false);
  });

  it('roughly follows the spec mix of states and leaves most texts empty', () => {
    const { checkins } = buildDemoData();
    const share = (q: string) => checkins.filter((c) => c.quadrant === q).length / checkins.length;
    expect(share('ebb')).toBeGreaterThan(0.15);
    expect(share('swell')).toBeLessThan(0.3);
    expect(checkins.filter((c) => c.text).length / checkins.length).toBeLessThan(0.4);
  });

  it('sets up the persona, and the bridge to Calculus at the jump time', async () => {
    await loadDemoData();
    const settings = await getSettings();
    expect(settings).toMatchObject({ demoMode: true, name: 'Maya', communicationMode: 'gentle', onboarded: true });
    expect(settings.trustedContacts[0].name).toBe('Sofi (roommate)');
    const [events, transitions, tasks] = await Promise.all([db.events.toArray(), db.transitions.toArray(), db.tasks.toArray()]);
    const bridge = getUpcomingTransition(DEMO_JUMP_TIME, events, transitions, tasks)!;
    expect(bridge.to.title).toBe('Calculus');
    expect(bridge.fromEvent?.title).toBe('Chemistry lab');
    expect(bridge.fromTask?.title).toBe('Chemistry lab report');
    expect(bridge.minutesUntil).toBe(9);
  });
});
