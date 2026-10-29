'use client';

// The focus timer's clock. We compute remaining time from timestamps instead
// of counting ticks: phones throttle background tabs, so a tick counter
// drifts, while start time + paused time + now() stays right to the second.
// The interval only asks React to redraw; it never measures anything.
import { useCallback, useEffect, useState } from 'react';
import { now } from '@/lib/clock';
import { MINUTE } from '@/lib/time';

export type TimerPhase = 'ready' | 'running' | 'paused' | 'finished';

interface TimerState {
  phase: TimerPhase;
  startedAt: number | null;
  pausedAt: number | null;
  pausedTotal: number;
}

const READY: TimerState = { phase: 'ready', startedAt: null, pausedAt: null, pausedTotal: 0 };

export function useFocusTimer(minutes: number, onFinish: () => void) {
  const [state, setState] = useState<TimerState>(READY);
  const [, redraw] = useState(0);
  const total = minutes * MINUTE;

  const elapsed = (at: number) => {
    if (!state.startedAt) return 0;
    const pausedNow = state.pausedAt ? at - state.pausedAt : 0;
    return at - state.startedAt - state.pausedTotal - pausedNow;
  };
  const remaining = Math.max(0, total - elapsed(now()));

  useEffect(() => {
    if (state.phase !== 'running') return;
    const id = setInterval(() => {
      if (total - elapsed(now()) <= 0) {
        setState((s) => ({ ...s, phase: 'finished' }));
        onFinish();
      } else {
        redraw((n) => n + 1);
      }
    }, 250);
    return () => clearInterval(id);
    // elapsed() only reads state captured in this render; restarting the
    // interval whenever state changes keeps it current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, total, onFinish]);

  const start = useCallback(() => setState({ phase: 'running', startedAt: now(), pausedAt: null, pausedTotal: 0 }), []);
  const pause = useCallback(() => setState((s) => (s.phase === 'running' ? { ...s, phase: 'paused', pausedAt: now() } : s)), []);
  const resume = useCallback(
    () =>
      setState((s) =>
        s.phase === 'paused' && s.pausedAt ? { ...s, phase: 'running', pausedTotal: s.pausedTotal + (now() - s.pausedAt), pausedAt: null } : s,
      ),
    [],
  );
  const stop = useCallback(() => setState((s) => ({ ...s, phase: 'finished' })), []);

  return {
    phase: state.phase,
    startedAt: state.startedAt,
    remaining,
    progress: total ? 1 - remaining / total : 0,
    completed: remaining <= 0,
    start,
    pause,
    resume,
    stop,
  };
}
