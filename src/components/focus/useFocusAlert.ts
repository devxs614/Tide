'use client';

// The end of a focus block, signalled (v2.1 F-06). It schedules the end
// sound on the audio clock while the block runs (and the optional heads-up
// before it), cancels it on pause or an early end, plays it if it never
// sounded, and adds vibration, the browser tab's "Time's up", and the
// opt-in notification. Any key or tap afterwards stops a repeating alert.
import { useEffect, useMemo, useState } from 'react';
import { fill } from '@/copy/en';
import { focusAlertCopy as t } from '@/copy/focusAlertCopy';
import { now } from '@/lib/clock';
import { alertLevel, countdownTitle, secondsUntil, warnLeadMs } from '@/lib/focus/alertPlan';
import { notifyTimesUp } from '@/lib/focus/notify';
import { revertTab, showTimesUpInTab } from '@/lib/focus/tabSignals';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useSettings } from '@/lib/settings';
import { isQuiet } from '@/lib/sound/useSound';
import { MINUTE } from '@/lib/time';
import type { TimerPhase } from './useFocusTimer';

type Engine = typeof import('@/lib/focus/alertEngine');

interface Args {
  phase: TimerPhase;
  endsAt: number | null;
  remaining: number;
  completed: boolean;
  taskTitle: string;
}

export function useFocusAlert({ phase, endsAt, remaining, completed, taskTitle }: Args) {
  const { settings } = useSettings();
  const motion = useMotionLevel();
  const [engine, setEngine] = useState<Engine | null>(null);
  const [baseTitle] = useState(() => (typeof document === 'undefined' ? 'Tide' : document.title));
  const level = alertLevel(settings);
  const sound = level === 'sound_visual';
  const lead = warnLeadMs(settings['focus.warnBeforeEnd']);
  const opts = useMemo(
    () => ({ tone: settings['focus.endTone'], volume: settings['focus.alertVolume'], repeat: settings['focus.alertRepeat'] }),
    [settings],
  );
  const timesUp = phase === 'finished' && completed && level !== 'off';

  // Loaded with the Focus screen, so Start can wake the audio in its tap.
  useEffect(() => {
    let live = true;
    void import('@/lib/focus/alertEngine').then((m) => live && setEngine(m));
    return () => {
      live = false;
    };
  }, []);
  useEffect(
    () => () => {
      engine?.cancelEndAlert();
      engine?.cancelWarning();
    },
    [engine],
  );

  // While running: the end (and the heads-up) on the audio clock. Starting
  // or resuming moves endsAt, which schedules again.
  useEffect(() => {
    if (!engine || phase !== 'running' || !endsAt || !sound || isQuiet()) return;
    const at = now();
    engine.scheduleEndAlert(secondsUntil(endsAt, at), opts);
    if (lead && endsAt - at > lead) engine.scheduleWarning(secondsUntil(endsAt - lead, at), opts.volume);
    return () => engine.cancelWarning();
  }, [engine, phase, endsAt, sound, lead, opts]);

  // A pause or "I'm done early" never ends with an alarm.
  useEffect(() => {
    if (phase === 'paused' || (phase === 'finished' && !completed)) engine?.cancelEndAlert();
  }, [engine, phase, completed]);

  // The end itself, once.
  useEffect(() => {
    if (!timesUp || isQuiet()) return;
    if (sound) engine?.settleEndAlert(opts);
    if (settings['focus.vibrateAtEnd'] && typeof navigator !== 'undefined') navigator.vibrate?.([200, 100, 200]);
    if (document.hidden) {
      showTimesUpInTab(t.timesUpTitle, taskTitle, motion !== 'off');
      if (settings['focus.notifyAtEnd']) void notifyTimesUp(t.timesUp, fill(t.notifyBody, { title: taskTitle }));
    }
    // Only the moment the block ends matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesUp]);

  // Any key or tap is a "got it": a repeating alert stops.
  useEffect(() => {
    if (!timesUp || !engine) return;
    const ack = () => engine.cancelEndAlert();
    window.addEventListener('keydown', ack, { once: true });
    window.addEventListener('pointerdown', ack, { once: true });
    return () => {
      window.removeEventListener('keydown', ack);
      window.removeEventListener('pointerdown', ack);
    };
  }, [timesUp, engine]);

  // The tab goes back to normal as soon as Tide is in front again.
  useEffect(() => {
    const onVisible = () => !document.hidden && revertTab();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      revertTab();
    };
  }, []);

  // "9:41 · Lab report · Tide" in the tab while the block runs.
  const secondsLeft = Math.ceil(remaining / 1000);
  const countdown = settings['focus.titleCountdown'] && phase === 'running';
  useEffect(() => {
    if (countdown) document.title = countdownTitle(secondsLeft * 1000, taskTitle);
  }, [countdown, secondsLeft, taskTitle]);
  useEffect(() => {
    if (!countdown) return;
    return () => {
      document.title = baseTitle;
    };
  }, [countdown, baseTitle]);

  const warning =
    lead && level !== 'off' && phase === 'running' && remaining > 0 && remaining <= lead ? (lead === MINUTE ? t.oneMinuteLeft : t.twoMinutesLeft) : null;

  return {
    // Call from the Start and Resume taps.
    prime: () => engine?.unlockAlertAudio(),
    timesUp,
    warning,
  };
}
