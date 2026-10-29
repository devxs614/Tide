'use client';

// A countdown for the toolkit's timers (walk, steps, soft timers). Like the
// focus timer, it measures from timestamps through now(), so a phone that
// locks during a 3-minute walk still shows the right time when it wakes.
// Reaching zero never moves Maya on by itself; it only reports `finished`.
import { useEffect, useState } from 'react';
import { now } from './clock';

interface State {
  startedAt: number | null;
  pausedAt: number | null;
  pausedTotal: number;
}

export function useCountdown(totalMs: number, opts: { autoStart?: boolean } = {}) {
  const [state, setState] = useState<State>(() => ({
    startedAt: opts.autoStart ? now() : null,
    pausedAt: null,
    pausedTotal: 0,
  }));
  const [, redraw] = useState(0);

  const at = now();
  const elapsed = state.startedAt ? at - state.startedAt - state.pausedTotal - (state.pausedAt ? at - state.pausedAt : 0) : 0;
  const remaining = Math.max(0, totalMs - elapsed);
  const running = state.startedAt !== null && state.pausedAt === null && remaining > 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => redraw((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  return {
    remaining,
    elapsed,
    started: state.startedAt !== null,
    running,
    paused: state.pausedAt !== null,
    finished: state.startedAt !== null && remaining <= 0,
    start: () => setState({ startedAt: now(), pausedAt: null, pausedTotal: 0 }),
    pause: () => setState((s) => (s.startedAt && !s.pausedAt ? { ...s, pausedAt: now() } : s)),
    resume: () => setState((s) => (s.pausedAt ? { ...s, pausedAt: null, pausedTotal: s.pausedTotal + (now() - s.pausedAt) } : s)),
  };
}
