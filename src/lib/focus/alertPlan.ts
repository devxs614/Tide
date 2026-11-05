// The plain rules behind the focus alert (v2.1 F-06), kept apart from Web
// Audio and React so they're easy to read and test: which alert level is
// in effect, how often it repeats, when the warning comes, and what the
// browser tab says.
import { formatCountdown, MINUTE } from '../time';
import type { Settings } from '../types';

export type AlertLevel = Settings['focus.endAlert'];
export type AlertRepeat = Settings['focus.alertRepeat'];

// v2's "Sound when a block ends" switch (`focus.endSound`) was the only way
// to silence the end. Someone who turned it off keeps a silent end until
// they choose in "When the timer ends", which sets that switch too.
export function alertLevel(s: Pick<Settings, 'focus.endAlert' | 'focus.endSound'>): AlertLevel {
  return s['focus.endAlert'] === 'sound_visual' && s['focus.endSound'] === false ? 'visual' : s['focus.endAlert'];
}

// "Up to 3 times until I respond": 20 seconds apart, never more than three.
export const REPEAT_GAP_S = 20;
export function repeatOffsets(repeat: AlertRepeat): number[] {
  return repeat === 'gentle_repeat' ? [0, REPEAT_GAP_S, 2 * REPEAT_GAP_S] : [0];
}

export function warnLeadMs(setting: Settings['focus.warnBeforeEnd']): number {
  return setting === 'off' ? 0 : Number(setting) * MINUTE;
}

// Seconds from now until a moment, for scheduling on the audio clock.
export const secondsUntil = (ts: number, nowTs: number) => Math.max(0, (ts - nowTs) / 1000);

export function countdownTitle(remainingMs: number, task: string): string {
  return `${formatCountdown(remainingMs)} · ${task} · Tide`;
}
