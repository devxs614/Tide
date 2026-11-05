// Pacing and overlap after the demo fix pack (D-3): the reading time, a
// caption shown (and its hold started) only once the target has stopped
// moving, never two spotlights, a spotlight that ends where its target
// ends, the bar's place fixed for the step, its space reserved, no caption
// over a celebration, companion bubbles kept to companion steps, and motion
// Off: no pointer, and holds still in full.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { useSyncExternalStore } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { clearCelebration, showCelebration, type CelebrationView } from '@/lib/celebrate/store';
import { realNow } from '@/lib/clock';
import { director, type DirectorDeps } from '../director/engine';
import { DirectorHUD } from '../director/DirectorHUD';
import { Spotlight } from '../director/Spotlight';
import { MAX_CPS, msPerChar, readingTime, stepHold } from '../director/pacing';
import type { Script, Step } from '../director/types';

function deps(): DirectorDeps {
  return { navigate: () => {}, speak: async () => 'done', custom: async () => {}, setClock: async () => {}, setSpeed: async () => {} };
}

function Stage() {
  const state = useSyncExternalStore(director.subscribe, director.getState, director.getState);
  return (
    <>
      <Spotlight target={state.target} />
      <DirectorHUD state={state} />
    </>
  );
}

// A target whose box moves until `until` (fake ms), then stays.
function movingButton(id: string, until: number, end = { left: 40, top: 300 }) {
  const el = document.createElement('button');
  el.dataset.demoId = id;
  document.body.appendChild(el);
  const start = realNow();
  el.getBoundingClientRect = () => {
    const t = Math.min(realNow() - start, until);
    const left = end.left - (until - t) * 0.2;
    return { left, top: end.top, right: left + 100, bottom: end.top + 48, width: 100, height: 48, x: left, y: end.top, toJSON: () => ({}) } as DOMRect;
  };
  return el;
}

const script = (steps: Step[]): Script => ({ id: 'full', chapters: [{ id: 'a', title: 'A' }], steps });

afterEach(() => {
  director.exit();
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
  document.documentElement.style.removeProperty('--demo-hud-clear');
  document.body.innerHTML = '';
});

describe('reading time', () => {
  it('is 1.8 s plus 55 ms a character, between 2.5 and 9 s', () => {
    expect(readingTime('Hi.')).toBe(2500);
    expect(readingTime('Maya checks in in her own words.')).toBe(1800 + 55 * 32);
    expect(readingTime('x'.repeat(300))).toBe(9000);
  });

  it('shortens looking time with speed, reading only up to 1.25×, with a floor for silent steps', () => {
    const caption = 'Stuck is information, not failure.';
    expect(stepHold({ id: 's', chapter: 'a', action: { kind: 'say' }, caption, holdMs: 900 }, 1)).toBe(readingTime(caption));
    expect(stepHold({ id: 's', chapter: 'a', action: { kind: 'say' }, caption, holdMs: 900 }, 2)).toBe(readingTime(caption) / 1.25);
    expect(stepHold({ id: 's', chapter: 'a', action: { kind: 'say' }, caption: 'Hi.', holdMs: 5000 }, 2)).toBe(2500);
    expect(stepHold({ id: 's', chapter: 'a', action: { kind: 'say' }, holdMs: 400 }, 1)).toBe(600);
    expect(stepHold({ id: 's', chapter: 'a', action: { kind: 'say' }, holdMs: 5000 }, 2)).toBe(2500);
    expect(msPerChar(35, 1)).toBe(1000 / MAX_CPS);
    expect(msPerChar(10, 2)).toBe(50);
  });
});

describe('one thing at a time', () => {
  it('shows the caption, and starts its hold, only once the target has stopped moving', async () => {
    vi.useFakeTimers();
    movingButton('go', 600);
    let shownAt = 0;
    const off = director.subscribe(() => {
      if (!shownAt && director.getState().caption) shownAt = realNow();
    });
    const startedAt = realNow();
    director.start(script([{ id: 'go', chapter: 'a', target: 'go', action: { kind: 'waitFor' }, caption: 'Over time, Tide learns.' }, { id: 'next', chapter: 'a', action: { kind: 'say' } }]), 'full', deps());
    await vi.advanceTimersByTimeAsync(400);
    expect(director.getState().caption).toBe('');
    expect(director.getState().target).toBeNull();
    await vi.advanceTimersByTimeAsync(400);
    expect(director.getState().caption).toBe('Over time, Tide learns.');
    expect(shownAt - startedAt).toBeGreaterThanOrEqual(600);
    while (director.getState().index === 0) await vi.advanceTimersByTimeAsync(20);
    off();
    expect(realNow() - shownAt).toBeGreaterThanOrEqual(readingTime('Over time, Tide learns.'));
  });

  it('never shows two spotlights, and clears the last one before the next step', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<button data-demo-id="one">One</button><button data-demo-id="two">Two</button>';
    render(<Stage />);
    director.start(
      script([
        { id: 'one', chapter: 'a', target: 'one', action: { kind: 'waitFor' }, holdMs: 300 },
        { id: 'two', chapter: 'a', target: 'two', action: { kind: 'waitFor' }, holdMs: 300 },
      ]),
      'full',
      deps(),
    );
    let most = 0;
    let gap = false;
    while (director.getState().status !== 'finished') {
      await act(() => vi.advanceTimersByTimeAsync(16));
      const count = document.querySelectorAll('[data-demo-spotlight]').length;
      most = Math.max(most, count);
      if (director.getState().index === 1 && count === 0) gap = true;
    }
    expect(most).toBe(1);
    expect(gap).toBe(true);
  });

  it('ends where its target ends', async () => {
    vi.useFakeTimers();
    const el = movingButton('go', 500, { left: 60, top: 420 });
    render(<Spotlight target={el} />);
    await act(() => vi.advanceTimersByTimeAsync(800));
    const spot = document.querySelector<HTMLElement>('[data-demo-spotlight]')!;
    expect(spot.style.left).toBe('52px');
    expect(spot.style.top).toBe('412px');
    expect(spot.style.width).toBe('116px');
  });

  it('keeps the bar where it was put for the whole step', async () => {
    vi.useFakeTimers();
    const el = document.createElement('button');
    el.dataset.demoId = 'go';
    document.body.appendChild(el);
    let top = 100;
    el.getBoundingClientRect = () => ({ left: 0, top, right: 100, bottom: top + 48, width: 100, height: 48, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
    director.start(script([{ id: 'go', chapter: 'a', target: 'go', action: { kind: 'waitFor' }, caption: 'One.', holdMs: 3000 }]), 'full', deps());
    await vi.advanceTimersByTimeAsync(500);
    expect(director.getState().hudTop).toBe(false);
    top = window.innerHeight - 60;
    await vi.advanceTimersByTimeAsync(1500);
    expect(director.getState().hudTop).toBe(false);
  });

  it('reserves the bar\'s space while it sits at the bottom', async () => {
    director.start(script([{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One.', holdMs: 60_000 }]), 'full', deps());
    render(<Stage />);
    expect(document.documentElement.style.getPropertyValue('--demo-hud-clear')).toMatch(/px$/);
    const css = readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
    expect(css).toContain("html[data-demo-running] [data-sonner-toast][data-front='false']");
    expect(css).toContain('--offset-bottom: max(168px, var(--demo-hud-clear, 0px)) !important');
  });

  it('shows no caption while a celebration is on screen', async () => {
    director.start(script([{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'Celebrations match how she feels.', holdMs: 60_000 }]), 'full', deps());
    render(<Stage />);
    expect(await screen.findByText('Celebrations match how she feels.')).toBeInTheDocument();
    act(() => showCelebration({ decision: { overlay: null } as unknown as CelebrationView['decision'], anchor: null, title: 'Done', message: '', announce: '' }));
    expect(screen.queryByText('Celebrations match how she feels.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Pause demo' })).toBeInTheDocument();
    // The store doesn't say which id it gave; clear whichever it was.
    act(() => {
      for (let id = 1; id < 50; id++) clearCelebration(id);
    });
    expect(screen.getByText('Celebrations match how she feels.')).toBeInTheDocument();
  });

  it('lets companion bubbles show only in steps about the companion', async () => {
    vi.useFakeTimers();
    director.start(
      script([
        { id: 'plain', chapter: 'a', action: { kind: 'say' }, caption: 'Tasks can be edited.', holdMs: 100 },
        { id: 'lolo', chapter: 'a', companion: true, action: { kind: 'say' }, caption: 'Lolo stays close.', holdMs: 100 },
      ]),
      'full',
      deps(),
    );
    await vi.advanceTimersByTimeAsync(200);
    expect(director.getState()).toMatchObject({ index: 0, companionQuiet: true });
    while (director.getState().index === 0) await vi.advanceTimersByTimeAsync(50);
    await vi.advanceTimersByTimeAsync(200);
    expect(director.getState()).toMatchObject({ index: 1, companionQuiet: false });
  });
});

describe('motion Off', () => {
  it('shows no pointer, and every hold still applies', async () => {
    vi.useFakeTimers();
    document.documentElement.dataset.motion = 'off';
    document.body.innerHTML = '<button data-demo-id="go">Go</button>';
    const cursors: unknown[] = [];
    const off = director.subscribe(() => director.getState().cursor && cursors.push(director.getState().cursor));
    director.start(script([{ id: 'go', chapter: 'a', target: 'go', action: { kind: 'click' }, caption: 'Her plan shrinks to fit her energy.' }]), 'full', deps());
    const started = realNow();
    while (director.getState().status !== 'finished') await vi.advanceTimersByTimeAsync(20);
    off();
    expect(cursors).toEqual([]);
    expect(realNow() - started).toBeGreaterThanOrEqual(readingTime('Her plan shrinks to fit her energy.'));
  });
});
