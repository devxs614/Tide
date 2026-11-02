'use client';

// Refocus nudges during a focus block (v2.1 F-07). Off by default. When on,
// a small card asks "Earth to {name}! Still on {task}?" every few minutes,
// and "Welcome back" after Tide was hidden for a while; with sound, a soft
// two-note nudge plays once if Tide stays hidden. The rules about when
// (edges, spacing, caps) live in lib/focus/nudgePlan.ts. Nothing here is
// ever counted back to the person; the counts are saved with the block
// for patterns later.
import { useEffect, useRef, useState } from 'react';
import { fill } from '@/copy/en';
import { nudgeCopy as t } from '@/copy/nudgeCopy';
import { now } from '@/lib/clock';
import { emitCompanion } from '@/lib/companion/bus';
import { EMPTY_LOG, hiddenDelayMs, intervalStep, mayNudge, recordNudge, RETURN_AFTER_MS, type NudgeLog } from '@/lib/focus/nudgePlan';
import { notify } from '@/lib/focus/notify';
import { useSettings } from '@/lib/settings';
import { isQuiet } from '@/lib/sound/useSound';
import { MINUTE } from '@/lib/time';
import type { TimerPhase } from './useFocusTimer';

type Engine = typeof import('@/lib/focus/alertEngine');
export type NudgeKind = 'interval' | 'return';

interface Args {
  phase: TimerPhase;
  endsAt: number | null;
  totalMs: number;
  // The outcome sheet (or another sheet) is open.
  blocked: boolean;
  taskTitle: string;
  pause: () => void;
  resume: () => void;
}

export const BREAK_MS = 2 * MINUTE;

export function useNudges({ phase, endsAt, totalMs, blocked, taskTitle, pause, resume }: Args) {
  const { settings } = useSettings();
  const level = settings['focus.refocusNudge'];
  const [engine, setEngine] = useState<Engine | null>(null);
  const [log, setLog] = useState<NudgeLog>(EMPTY_LOG);
  const [card, setCard] = useState<NudgeKind | null>(null);
  const [breakUntil, setBreakUntil] = useState<number | null>(null);
  const [hidden, setHidden] = useState<{ at: number; elapsed: number } | null>(null);
  const [hiddenNudged, setHiddenNudged] = useState(false);
  const [counts, setCounts] = useState({ nudgesShown: 0, driftsReported: 0, hiddenMs: 0, breaks: 0 });
  const notifyTimer = useRef<number | null>(null);
  const running = phase === 'running' && endsAt !== null;
  const elapsedAt = (at: number) => (endsAt === null ? 0 : totalMs - (endsAt - at));
  // A break only holds nudges back while it's actually on (Resume on the
  // Focus screen ends it too).
  const busy = blocked || card !== null || (breakUntil !== null && phase === 'paused');

  useEffect(() => {
    if (level === 'off') return;
    let live = true;
    void import('@/lib/focus/alertEngine').then((m) => live && setEngine(m));
    return () => {
      live = false;
    };
  }, [level]);

  const show = (kind: NudgeKind, nextLog: NudgeLog) => {
    setLog(nextLog);
    setCard(kind);
    setCounts((c) => ({ ...c, nudgesShown: c.nudgesShown + 1 }));
    if (kind === 'interval' && level === 'visual_sound' && !isQuiet()) engine?.playTone('nudge', settings['focus.alertVolume']);
  };

  // The interval check-in, looked at once a second while the block runs.
  useEffect(() => {
    if (level === 'off' || !running) return;
    const id = window.setInterval(() => {
      const step = intervalStep(elapsedAt(now()), totalMs, settings['focus.nudgeEvery'] * MINUTE, log, busy);
      if (step.show) show('interval', step.log);
      else if (step.log !== log) setLog(step.log);
    }, 1000);
    return () => window.clearInterval(id);
    // elapsedAt and show read this render's values; the deps restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, running, endsAt, totalMs, log, busy, settings, engine]);

  // Leaving Tide: maybe one soft nudge (and a notification) after a while.
  // Coming back: maybe "Welcome back".
  useEffect(() => {
    if (level === 'off') return;
    const onChange = () => {
      const at = now();
      if (document.hidden) {
        if (!running) return;
        setHidden({ at, elapsed: elapsedAt(at) });
        const delay = hiddenDelayMs(settings['focus.nudgeHiddenAfter']);
        if (delay === null || hiddenNudged || log.stopped) return;
        if (level === 'visual_sound' && !isQuiet()) engine?.scheduleNudgeSound(delay / 1000, settings['focus.alertVolume']);
        if (settings['focus.notifyAtEnd']) {
          const name = settings.name.trim();
          const body = name ? fill(t.notify, { name, task: taskTitle }) : fill(t.notifyNoName, { task: taskTitle });
          notifyTimer.current = window.setTimeout(() => document.hidden && void notify(taskTitle, body), delay);
        }
        return;
      }
      if (!hidden) return;
      engine?.cancelNudgeSound();
      if (notifyTimer.current !== null) window.clearTimeout(notifyTimer.current);
      const away = at - hidden.at;
      setHidden(null);
      setCounts((c) => ({ ...c, hiddenMs: c.hiddenMs + away }));
      let nextLog = log;
      const delay = hiddenDelayMs(settings['focus.nudgeHiddenAfter']);
      if (delay !== null && !hiddenNudged && !log.stopped && away >= delay) {
        setHiddenNudged(true);
        nextLog = recordNudge(log, hidden.elapsed + delay);
        setCounts((c) => ({ ...c, nudgesShown: c.nudgesShown + 1 }));
      }
      if (running && settings['focus.nudgeOnReturn'] && away >= RETURN_AFTER_MS && mayNudge(elapsedAt(at), totalMs, nextLog, busy)) {
        show('return', recordNudge(nextLog, elapsedAt(at)));
      } else if (nextLog !== log) {
        setLog(nextLog);
      }
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, running, endsAt, hidden, hiddenNudged, log, busy, settings, engine, taskTitle]);

  useEffect(
    () => () => {
      engine?.cancelNudgeSound();
      if (notifyTimer.current !== null) window.clearTimeout(notifyTimer.current);
    },
    [engine],
  );

  return {
    card,
    breakUntil,
    counts,
    yes: () => {
      setCard(null);
      emitCompanion({ type: 'nudge', expression: 'happy', reaction: 'hop' });
    },
    drifted: () => setCounts((c) => ({ ...c, driftsReported: c.driftsReported + 1 })),
    pickUp: () => setCard(null),
    takeBreak: () => {
      setCard(null);
      setCounts((c) => ({ ...c, breaks: c.breaks + 1 }));
      pause();
      setBreakUntil(now() + BREAK_MS);
    },
    backToIt: () => {
      setBreakUntil(null);
      resume();
    },
    stop: () => {
      setCard(null);
      setLog((l) => ({ ...l, stopped: true }));
    },
  };
}
