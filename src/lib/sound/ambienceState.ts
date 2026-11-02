// What the ambience player is doing (v2.1 F-09), as a tiny store any screen
// can read without loading the audio code: the mini player in the shell
// only needs to know a sound is on to load itself.
import { useSyncExternalStore } from 'react';
import type { AmbienceId } from './names';

export interface AmbienceState {
  sound: AmbienceId | null;
  paused: boolean;
  // Started by v2's "ambience during focus" rather than picked in the
  // player; it stops when the focus block does.
  auto: boolean;
  untilFocusEnds: boolean;
  // When a "Play for 30 minutes" ends, for the label.
  endsAt: number | null;
}

const IDLE: AmbienceState = { sound: null, paused: false, auto: false, untilFocusEnds: false, endsAt: null };
let state = IDLE;
const listeners = new Set<() => void>();

export function setAmbienceState(next: Partial<AmbienceState> | null): void {
  state = next === null ? IDLE : { ...state, ...next };
  listeners.forEach((l) => l());
}

export const getAmbienceState = () => state;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAmbienceState(): AmbienceState {
  return useSyncExternalStore(subscribe, getAmbienceState, () => IDLE);
}
