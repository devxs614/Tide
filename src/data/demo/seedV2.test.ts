// The demo workspace seed (v2 spec 16.10): v1's three patterns plus exactly
// one wrap pattern, Maya's companion and theme, twelve closed days, and the
// bottle that surfaces on the demo afternoon. The v1 seed test still checks
// the v1 seed on its own.
import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_START, setDemoClock } from '@/lib/clock';
import { computePatterns } from '@/lib/patterns/engine';
import { loadPatternInput } from '@/lib/patterns/data';
import { seedDemoWorkspace } from '@/lib/repo/demo';
import { getSettings } from '@/lib/repo/settings';
import { db } from '@/lib/db';
import { resetApp } from '@/test/utils';

beforeEach(async () => {
  await resetApp();
  await db.dayWraps.clear();
  setDemoClock(null);
});

describe('demo workspace seed', () => {
  it('adds exactly one wrap pattern to the v1 three', async () => {
    await seedDemoWorkspace();
    const patterns = computePatterns(await loadPatternInput(DEMO_START, 28));
    expect(patterns.map((p) => p.key).sort()).toEqual([
      'hardTransition:lab:class',
      'strategyBeforeTask:m-walk-3:writing',
      'strategyEffect:c-box',
      'wrapHelped:c-box',
    ]);
    const wrapHelped = patterns.find((p) => p.key === 'wrapHelped:c-box')!;
    expect(wrapHelped.facts).toMatchObject({ kA: 4, kB: 1, nB: 6 });
    expect(Number(wrapHelped.facts.nA)).toBeGreaterThanOrEqual(5);
  });

  it('sets up Lolo, the look, twelve closed days and the bottle, once', async () => {
    await seedDemoWorkspace();
    const s = await getSettings();
    expect(s).toMatchObject({ demoMode: true, name: 'Maya', 'companion.species': 'axolotl', 'companion.accessory': 'scarf', 'appearance.theme': 'lagoon' });
    expect(await db.dayWraps.count()).toBeGreaterThanOrEqual(11);
    expect((await db.bottles.toArray())[0].text).toMatch(/hard weeks before/);
    const tasks = await db.tasks.count();
    await seedDemoWorkspace();
    expect(await db.tasks.count()).toBe(tasks);
  });
});
