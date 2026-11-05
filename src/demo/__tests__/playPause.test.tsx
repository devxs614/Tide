// Play and pause after the demo fix pack (D-5): the state machine's moves,
// thirty pauses at random moments of the full tour with nothing moving for
// a minute after each (step, caption, typed text, demo clock), resuming
// where it stopped, one toggle per press however it arrives, a button that
// survives redraws, nothing but a person resuming a tour, the hidden-tab
// pause, and the demo clock frozen while paused.
import { useSyncExternalStore } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_START, demoClockAt, demoSpeed, now, setDemoClock, setDemoSpeed } from '@/lib/clock';
import { canMove, director, type DirectorDeps, type DirectorStatus } from '../director/engine';
import { DirectorHUD } from '../director/DirectorHUD';
import { useAutoPause } from '../director/useAutoPause';
import { FULL } from '../director/scripts/full';
import type { Script } from '../director/types';
import { mulberry32 } from '@/data/demo/seed';

function deps(over: Partial<DirectorDeps> = {}): DirectorDeps {
  return {
    navigate: () => {},
    speak: async () => {},
    custom: async () => {},
    setClock: async () => {},
    setSpeed: async (m) => setDemoSpeed(m),
    ...over,
  };
}

// Every element the full tour points at, so each step finds its target.
function stage(script: Script) {
  const typed = new Set(script.steps.filter((s) => s.action.kind === 'type').map((s) => s.target));
  document.body.innerHTML = [...new Set(script.steps.map((s) => s.target).filter(Boolean))]
    .map((id) => (typed.has(id) ? `<textarea data-demo-id="${id}"></textarea>` : `<button data-demo-id="${id}">${id}</button>`))
    .join('');
}

function Harness() {
  const state = useSyncExternalStore(director.subscribe, director.getState, director.getState);
  return <DirectorHUD state={state} />;
}

const status = () => director.getState().status;

beforeEach(() => setDemoClock(null));

afterEach(() => {
  director.exit();
  vi.useRealTimers();
  setDemoClock(null);
  setDemoSpeed(1);
  document.body.innerHTML = '';
});

describe('the state machine', () => {
  it('allows exactly these moves', () => {
    const all: DirectorStatus[] = ['idle', 'starting', 'running', 'paused', 'finished', 'exiting'];
    const allowed = new Set([
      'idle>starting',
      'starting>running', 'starting>exiting',
      'running>paused', 'running>finished', 'running>starting', 'running>exiting',
      'paused>running', 'paused>finished', 'paused>starting', 'paused>exiting',
      'finished>starting', 'finished>exiting',
      'exiting>idle',
    ]);
    for (const from of all) for (const to of all) expect(canMove(from, to), `${from} → ${to}`).toBe(allowed.has(`${from}>${to}`));
  });

  it('moves through the tour and ignores what makes no sense', async () => {
    vi.useFakeTimers();
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, holdMs: 1000 }] };
    expect(status()).toBe('idle');
    director.play();
    expect(status()).toBe('idle');
    director.start(script, 'full', deps());
    expect(status()).toBe('running');
    director.play();
    expect(status()).toBe('running');
    director.pause();
    expect(status()).toBe('paused');
    director.pause();
    expect(status()).toBe('paused');
    director.play();
    await vi.advanceTimersByTimeAsync(2000);
    expect(status()).toBe('finished');
    director.pause();
    expect(status()).toBe('finished');
    director.exit();
    expect(status()).toBe('idle');
  });
});

describe('pausing the full tour', () => {
  it('stops everything at 30 random moments and resumes where it was', async () => {
    vi.useFakeTimers();
    setDemoClock(demoClockAt(DEMO_START));
    stage(FULL);
    const random = mulberry32(7);
    director.start(FULL, 'full', deps());
    for (let i = 0; i < 30 && status() !== 'finished'; i++) {
      await vi.advanceTimersByTimeAsync(400 + Math.floor(random() * 4000));
      if (status() === 'finished') break;
      director.pause();
      const field = director.progress()?.typing?.field;
      const before = { index: director.getState().index, caption: director.getState().caption, log: director.getState().log.length, typed: field?.value.length, clock: now() };
      await vi.advanceTimersByTimeAsync(60_000);
      const after = { index: director.getState().index, caption: director.getState().caption, log: director.getState().log.length, typed: field?.value.length, clock: now() };
      expect(after, `pause ${i}`).toEqual(before);
      expect(status()).toBe('paused');
      expect(demoSpeed()).toBe(0);
      vi.advanceTimersByTime(TOGGLE);
      director.toggle();
      expect(status()).toBe('running');
    }
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(status()).toBe('finished');
    const log = director.getState().log;
    expect(log.map((l) => l.id)).toEqual(FULL.steps.map((s) => s.id));
    expect(log.every((l) => l.ok)).toBe(true);
  }, 60_000);

  it('goes on typing from the character it reached', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<textarea data-demo-id="field"></textarea>';
    const text = 'Lab report due tomorrow.';
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'type', chapter: 'a', target: 'field', action: { kind: 'type', text, cps: 10 } }] };
    director.start(script, 'full', deps());
    await vi.advanceTimersByTimeAsync(1000);
    director.pause();
    const field = document.querySelector('textarea')!;
    const typed = field.value.length;
    expect(typed).toBeGreaterThan(3);
    expect(typed).toBeLessThan(text.length);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(field.value.length).toBe(typed);
    director.play();
    // The target settles again, then typing goes on from the next character.
    for (let t = 0; t < 2000 && field.value.length === typed; t += 10) await vi.advanceTimersByTimeAsync(10);
    expect(field.value.length).toBe(typed + 1);
    expect(text.startsWith(field.value)).toBe(true);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(field.value).toBe(text);
  });

  it('keeps only the rest of a hold after a pause', async () => {
    vi.useFakeTimers();
    const script: Script = {
      id: 'full',
      chapters: [{ id: 'a', title: 'A' }],
      steps: [
        { id: 'one', chapter: 'a', action: { kind: 'say' }, holdMs: 1000 },
        { id: 'two', chapter: 'a', action: { kind: 'say' }, holdMs: 1000 },
      ],
    };
    director.start(script, 'full', deps());
    await vi.advanceTimersByTimeAsync(400);
    director.pause();
    await vi.advanceTimersByTimeAsync(5000);
    director.play();
    await vi.advanceTimersByTimeAsync(550);
    expect(director.getState().index).toBe(0);
    await vi.advanceTimersByTimeAsync(100);
    expect(director.getState().index).toBe(1);
  });

  it('never repeats a tap when it resumes', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<button data-demo-id="go">Go</button>';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'tap', chapter: 'a', target: 'go', action: { kind: 'click' }, holdMs: 3000 }] };
    director.start(script, 'full', deps());
    await vi.advanceTimersByTimeAsync(1000);
    expect(clicked).toHaveBeenCalledOnce();
    director.pause();
    director.play();
    await vi.advanceTimersByTimeAsync(5000);
    expect(clicked).toHaveBeenCalledOnce();
    expect(status()).toBe('finished');
  });

  it('freezes the demo clock while paused, even at the fast-forward, and restores its speed', async () => {
    vi.useFakeTimers();
    setDemoClock(demoClockAt(DEMO_START));
    const script: Script = {
      id: 'full',
      chapters: [{ id: 'a', title: 'A' }],
      steps: [
        { id: 'fast', chapter: 'a', action: { kind: 'setSpeed', multiplier: 60 }, holdMs: 5000 },
        { id: 'normal', chapter: 'a', action: { kind: 'setSpeed', multiplier: 1 } },
      ],
    };
    director.start(script, 'full', deps());
    await vi.advanceTimersByTimeAsync(1000);
    expect(demoSpeed()).toBe(60);
    director.pause();
    expect(demoSpeed()).toBe(0);
    const frozen = now();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(now()).toBe(frozen);
    director.play();
    expect(demoSpeed()).toBe(60);
    await vi.advanceTimersByTimeAsync(1000);
    expect(now()).toBe(frozen + 60_000);
  });
});

const TOGGLE = 301;

describe('the play/pause button', () => {
  const longScript: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One', holdMs: 60_000 }] };

  it('Space on the focused button toggles once', async () => {
    director.start(longScript, 'full', deps());
    const user = userEvent.setup();
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Pause demo' });
    button.focus();
    await user.keyboard(' ');
    expect(status()).toBe('paused');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('two presses within 300 ms count once', () => {
    director.start(longScript, 'full', deps());
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Pause demo' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(status()).toBe('paused');
  });

  it('a press survives the bar redrawing in the middle of it', () => {
    director.start(longScript, 'full', deps());
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Pause demo' });
    fireEvent.pointerDown(button);
    act(() => {
      director.toggleCaptions();
      director.setSpeed(2);
    });
    expect(screen.getByRole('button', { name: 'Pause demo' })).toBe(button);
    fireEvent.pointerUp(button);
    fireEvent.click(button);
    expect(status()).toBe('paused');
  });

  it('is always shown, at least 48 px, even with the extra controls folded', () => {
    director.start(longScript, 'full', deps());
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Pause demo' });
    expect(button.className).toContain('size-12');
    for (let el: HTMLElement | null = button; el; el = el.parentElement) expect(el.className.split(' ')).not.toContain('big-text:hidden');
  });
});

describe('nothing resumes a paused tour but a person', () => {
  it('a voice that finishes during the pause leaves it paused', async () => {
    vi.useFakeTimers();
    let finish: () => void = () => {};
    const spoken: string[] = [];
    const speak = vi.fn((text: string) => {
      spoken.push(text);
      return new Promise<void>((r) => (finish = r));
    });
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One', narrate: true }, { id: 'two', chapter: 'a', action: { kind: 'say' } }] };
    director.start(script, 'full', deps({ speak }), { narration: true });
    await vi.advanceTimersByTimeAsync(100);
    expect(speak).toHaveBeenCalledOnce();
    director.pause();
    finish();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(status()).toBe('paused');
    expect(director.getState().index).toBe(0);
    // Back on, the caption is read again from the start.
    director.play();
    await vi.advanceTimersByTimeAsync(100);
    expect(speak).toHaveBeenCalledTimes(2);
    expect(spoken).toEqual(['One', 'One']);
  });

  it('a hidden tab pauses, and coming back stays paused', () => {
    director.start({ id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, holdMs: 60_000 }] }, 'full', deps());
    renderHook(() => useAutoPause(true));
    const hidden = vi.spyOn(document, 'hidden', 'get');
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(status()).toBe('paused');
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
    expect(status()).toBe('paused');
  });

  it('Next and Previous while paused play one step and stay paused', async () => {
    vi.useFakeTimers();
    const say = (id: string, chapter = 'a') => ({ id, chapter, action: { kind: 'say' as const }, holdMs: 1000 });
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }], steps: [say('one'), say('two'), say('three', 'b'), say('four', 'b')] };
    director.start(script, 'full', deps());
    await vi.advanceTimersByTimeAsync(300);
    director.pause();
    director.next();
    expect(director.getState().index).toBe(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(status()).toBe('paused');
    expect(director.getState().index).toBe(2);
    director.prev();
    await vi.advanceTimersByTimeAsync(5000);
    expect(status()).toBe('paused');
    expect(director.getState().log.map((l) => l.id)).toEqual(['two', 'one']);
  });
});
