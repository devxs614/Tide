// The theme step after the demo fix pack (D-4): black, white, then the
// demo's own theme, each a full second after its crossfade at every speed;
// its caption shown and read once for all three; and the colorful theme
// kept for the rest of the tour, until the comfort chapter's restore puts
// back exactly the same one. Settings writes are recorded, and "painted"
// the way the settings provider does it (the theme on <html>, a 250 ms
// crossfade veil).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { realNow } from '@/lib/clock';
import { director, type DirectorDeps } from '../director/engine';
import { DEMO_THEME_VISIBLE_MS, demoThemes, runCustom } from '../director/customActions';
import { readingTime } from '../director/pacing';
import { FULL } from '../director/scripts/full';
import type { Script } from '../director/types';

const h = vi.hoisted(() => ({
  writes: [] as Array<{ theme: string; at: number; step: string }>,
  clock: (() => 0) as () => number,
  step: (() => '') as () => string,
}));

vi.mock('@/lib/repo/settings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/repo/settings')>();
  return {
    ...actual,
    setSettings: vi.fn(async (values: Record<string, unknown>) => {
      const theme = values['appearance.theme'];
      if (typeof theme !== 'string') return;
      h.writes.push({ theme, at: h.clock(), step: h.step() });
      document.documentElement.dataset.theme = theme;
      const veil = document.createElement('div');
      veil.dataset.themeVeil = '';
      document.body.appendChild(veil);
      window.setTimeout(() => veil.remove(), 250);
    }),
  };
});

h.clock = realNow;
h.step = () => FULL.steps[director.getState().index]?.id ?? '';

function stage(script: Script) {
  const typed = new Set(script.steps.filter((s) => s.action.kind === 'type').map((s) => s.target));
  document.body.innerHTML = [...new Set(script.steps.map((s) => s.target).filter(Boolean))]
    .map((id) => (typed.has(id) ? `<textarea data-demo-id="${id}"></textarea>` : `<button data-demo-id="${id}">${id}</button>`))
    .join('');
}

function deps(over: Partial<DirectorDeps> = {}): DirectorDeps {
  return {
    navigate: () => {},
    speak: async () => 'done',
    // The real custom actions, except Stuck, which needs the task list.
    custom: (name, args, signal) => (name === 'stuckTask' ? Promise.resolve() : runCustom(name, args, () => {}, director.getState().speed, signal)),
    setClock: async () => {},
    setSpeed: async () => {},
    ...over,
  };
}

afterEach(() => {
  director.exit();
  vi.useRealTimers();
  h.writes.length = 0;
  delete document.documentElement.dataset.theme;
  document.body.innerHTML = '';
});

describe('the theme step', () => {
  it('is black, white, then the demo\'s own theme', () => {
    expect(demoThemes()).toEqual(['ink', 'pearl', 'lagoon']);
  });

  for (const speed of [1, 2]) {
    it(`keeps each theme a full second after its crossfade at ${speed}×`, async () => {
      vi.useFakeTimers();
      let finished = 0;
      void runCustom('cycleThemes', undefined, () => {}, speed).then(() => (finished = realNow()));
      await vi.advanceTimersByTimeAsync(10_000);
      expect(h.writes.map((w) => w.theme)).toEqual(['ink', 'pearl', 'lagoon']);
      const times = [...h.writes.map((w) => w.at), finished];
      for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(250 + DEMO_THEME_VISIBLE_MS);
    });
  }

  it('shows and reads its caption once, for all three themes', async () => {
    vi.useFakeTimers();
    const step = FULL.steps.find((s) => s.id === 'yours.cycle')!;
    document.body.innerHTML = '<div data-demo-id="theme-grid"></div>';
    const spoken: string[] = [];
    const captions = new Set<string>();
    const off = director.subscribe(() => captions.add(director.getState().caption));
    const started = realNow();
    director.start({ id: 'full', chapters: FULL.chapters, steps: [step] }, 'full', deps({ speak: async (text) => (spoken.push(text), 'done') }), { narration: true });
    while (director.getState().status !== 'finished') await vi.advanceTimersByTimeAsync(50);
    off();
    expect(spoken).toEqual([step.caption]);
    expect([...captions].filter(Boolean)).toEqual([step.caption]);
    expect(h.writes.map((w) => w.theme)).toEqual(['ink', 'pearl', 'lagoon']);
    expect(realNow() - started).toBeGreaterThanOrEqual(Math.max(3 * (250 + DEMO_THEME_VISIBLE_MS), readingTime(step.caption!)));
  });

  it('leaves the color theme on through the tour, and the comfort chapter puts back the same one', async () => {
    vi.useFakeTimers();
    stage(FULL);
    director.start(FULL, 'full', deps());
    while (director.getState().status !== 'finished') await vi.advanceTimersByTimeAsync(200);
    expect(h.writes.slice(0, 3)).toMatchObject([
      { theme: 'ink', step: 'yours.cycle' },
      { theme: 'pearl', step: 'yours.cycle' },
      { theme: 'lagoon', step: 'yours.cycle' },
    ]);
    // Nothing else touches the theme until the comfort chapter's restore.
    expect(h.writes.slice(3)).toMatchObject([{ theme: 'lagoon', step: 'comfort.restore' }]);
  }, 30_000);
});
