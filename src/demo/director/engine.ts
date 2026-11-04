// The demo director's engine (v2 spec 16.4): plays a script's steps in
// order, with captions, a spotlight target, and holds long enough to see
// each result. It can pause, go to the next step or back to the start of
// the previous chapter, change speed, and stop. A step that fails (an
// element that never appeared) is noted and skipped; the tour never crashes.
//
// Since the demo fix pack (D-5) the tour is a small state machine:
// idle → starting → running ⇄ paused → finished, plus exiting. Only the
// functions below change the state, and only a person (the play button,
// Space/K/P, a media key, Next or Previous) ever takes it out of paused.
// Each step runs with its own AbortController: pausing aborts it on the
// spot, the step's progress is kept (how much was typed, how much hold is
// left, whether its tap already happened), and play picks it up from there.
// Before, pause was a flag read between steps, and the end of every step
// set it back to false, so a paused tour carried on by itself.
import { demoSpeed, realNow, setDemoSpeed } from '@/lib/clock';
import { pauseAmbience, resumeAmbience } from '@/lib/sound/ambiencePlayer';
import { getAmbienceState } from '@/lib/sound/ambienceState';
import type { Script } from './types';
import { freshProgress, runStep, type StepProgress } from './runStep';
import { setFieldValue } from './actions';

export type DirectorMode = 'full' | 'pitch' | 'presenter';
export type DirectorStatus = 'idle' | 'starting' | 'running' | 'paused' | 'finished' | 'exiting';
export type ToggleSource = 'click' | 'key' | 'media' | 'next' | 'previous' | 'start';

// What the tour's controls show. The shape is v2's, so anything that
// renders the bar from a snapshot (the accessibility test) still can.
export interface DirectorState {
  script: Script | null;
  mode: DirectorMode;
  presenter: boolean;
  // A tour is on screen, it's paused, it reached the end. Since D-5 these
  // follow `status` and are never set on their own.
  running: boolean;
  paused: boolean;
  done: boolean;
  index: number;
  speed: number;
  captions: boolean;
  narration: boolean;
  caption: string;
  chapterTitle: string;
  target: HTMLElement | null;
  log: Array<{ id: string; ok: boolean }>;
}

// The engine's own state: the above plus where it is in the state machine
// and what each step decided.
export interface EngineState extends DirectorState {
  status: DirectorStatus;
  // Where the bar sits for this step, decided once when the step starts.
  hudTop: boolean;
}

export interface DirectorDeps {
  navigate: (path: string) => void;
  speak: (text: string, signal?: AbortSignal) => Promise<unknown>;
  custom: (name: string, args?: Record<string, unknown>, signal?: AbortSignal) => Promise<void>;
  setClock: (ts: number) => Promise<void>;
  setSpeed: (multiplier: number) => Promise<void>;
}

const INITIAL: EngineState = {
  status: 'idle', script: null, mode: 'full', presenter: false, running: false, paused: false, done: false, index: 0,
  speed: 1, captions: true, narration: false, caption: '', chapterTitle: '', target: null, hudTop: false, log: [],
};

// Which way the state may move. Anything else is ignored (and noted in the
// debug log), so a stray callback can never put the tour somewhere odd.
const MOVES: Record<DirectorStatus, DirectorStatus[]> = {
  idle: ['starting'],
  starting: ['running', 'exiting'],
  running: ['paused', 'finished', 'starting', 'exiting'],
  paused: ['running', 'finished', 'starting', 'exiting'],
  finished: ['starting', 'exiting'],
  exiting: ['idle'],
};

export function canMove(from: DirectorStatus, to: DirectorStatus): boolean {
  return MOVES[from].includes(to);
}

let state: EngineState = INITIAL;
let deps: DirectorDeps | null = null;
let run = 0;
let step: { controller: AbortController; progress: StepProgress } | null = null;
// Progress of a step that was paused partway, kept until it resumes.
let parked: StepProgress | null = null;
// Next while paused plays one step and stops again (presenter mode plays to
// its next key moment, which it does anyway).
let stopAfterStep = false;
// The demo clock's speed before a pause froze it.
let frozenSpeed: number | null = null;
let ambiencePaused = false;
let lastToggle = -Infinity;
const listeners = new Set<() => void>();
const notes: Array<(note: string) => void> = [];

export const TOGGLE_GUARD_MS = 300;

export function set(patch: Partial<EngineState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function note(message: string): void {
  notes.forEach((n) => n(message));
}

function move(to: DirectorStatus, why: string): boolean {
  if (!canMove(state.status, to)) {
    note(`ignored ${state.status} → ${to} (${why})`);
    return false;
  }
  note(`${state.status} → ${to} (${why})`);
  set({ status: to, running: to !== 'idle' && to !== 'exiting', paused: to === 'paused', done: to === 'finished' });
  return true;
}

function freezeClock() {
  if (frozenSpeed !== null) return;
  frozenSpeed = demoSpeed();
  setDemoSpeed(0);
  // Background sound the step started stops with the tour and comes back
  // with it. Sounds already playing out (a chime) may finish; that's fine.
  const ambience = getAmbienceState();
  if (ambience.sound && !ambience.paused) {
    pauseAmbience();
    ambiencePaused = true;
  }
}

function thawClock() {
  if (frozenSpeed === null) return;
  setDemoSpeed(frozenSpeed);
  frozenSpeed = null;
  if (ambiencePaused) resumeAmbience();
  ambiencePaused = false;
}

// Stops the running step where it is and keeps its progress for later.
function interrupt(keep: boolean) {
  if (!step) return;
  const current = step;
  step = null;
  current.controller.abort();
  parked = keep ? current.progress : null;
}

// Waits until the state moves, or a newer run replaces this one.
function stateChange(mine: number): Promise<void> {
  const from = state.status;
  return new Promise((resolve) => {
    const check = () => {
      if (state.status !== from || mine !== run) {
        listeners.delete(check);
        resolve();
      }
    };
    listeners.add(check);
  });
}

async function loop(mine: number) {
  while (mine === run) {
    if (state.status === 'starting' || state.status === 'paused') {
      await stateChange(mine);
      continue;
    }
    if (state.status !== 'running') return;
    const script = state.script!;
    if (state.index >= script.steps.length) {
      move('finished', 'last step');
      set({ target: null, caption: '' });
      return;
    }
    const index = state.index;
    const current = script.steps[index];
    const progress = parked?.index === index ? parked : freshProgress(index);
    parked = null;
    const controller = new AbortController();
    step = { controller, progress };
    let ok = true;
    try {
      await runStep(current, progress, controller.signal, { deps: deps!, get: () => state, set, note });
    } catch {
      if (controller.signal.aborted || mine !== run) continue;
      ok = false;
      set({ caption: '…' });
    }
    if (controller.signal.aborted || mine !== run) continue;
    step = null;
    const stop = stopAfterStep || (state.presenter && !!current.presenterPause);
    stopAfterStep = false;
    set({ log: [...state.log, { id: current.id, ok }], index: index + 1 });
    note(`step ${current.id} ${ok ? 'done' : 'skipped'}`);
    if (stop && index + 1 < script.steps.length) {
      move('paused', current.presenterPause && state.presenter ? 'presenter stop' : 'one step');
      freezeClock();
    }
  }
}

function play(source: ToggleSource) {
  if (state.status !== 'paused' && state.status !== 'starting') return;
  thawClock();
  move('running', source);
}

function pause(source: ToggleSource | 'hidden') {
  if (state.status !== 'running') return;
  interrupt(true);
  move('paused', source);
  freezeClock();
}

// Leaves the current step for another one. A step paused partway through
// typing gets the rest of its text at once, so the steps after it see what
// they expect.
function jump(index: number, source: ToggleSource) {
  const leaving = step?.progress ?? parked;
  if (leaving?.typing && leaving.typed < [...leaving.typing.text].length) setFieldValue(leaving.typing.field, leaving.typing.text);
  interrupt(false);
  parked = null;
  set({ index, done: false });
  if (state.status === 'finished') move('running', source);
  else if (state.status === 'paused') {
    stopAfterStep = !state.presenter;
    play(source);
  }
}

export const director = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getState: () => state,
  // A debug listener for every state change and step event.
  onNote(fn: (note: string) => void) {
    notes.push(fn);
    return () => {
      notes.splice(notes.indexOf(fn), 1);
    };
  },
  start(script: Script, mode: DirectorMode, d: DirectorDeps, opts: { captions?: boolean; narration?: boolean; speed?: number } = {}) {
    interrupt(false);
    thawClock();
    deps = d;
    run += 1;
    parked = null;
    stopAfterStep = false;
    lastToggle = -Infinity;
    // A new tour over a running or finished one leaves that one first.
    if (state.status !== 'idle') move('exiting', 'restart');
    state = { ...INITIAL };
    move('starting', 'start');
    set({ script, mode, presenter: mode === 'presenter', captions: opts.captions ?? true, narration: opts.narration ?? false, speed: opts.speed ?? 1 });
    move('running', 'start');
    void loop(run);
  },
  play: (source: ToggleSource = 'click') => play(source),
  pause: (source: ToggleSource | 'hidden' = 'click') => pause(source),
  // One press, one change: a second toggle within 300 ms (a key and a
  // click from the same press, a double tap) is ignored.
  toggle(source: ToggleSource = 'click') {
    const at = realNow();
    const since = at - lastToggle;
    if (since >= 0 && since < TOGGLE_GUARD_MS) {
      note(`ignored toggle (${source}) within ${TOGGLE_GUARD_MS} ms`);
      return;
    }
    lastToggle = at;
    if (state.status === 'running') pause(source);
    else play(source);
  },
  next() {
    const script = state.script;
    if (!script || state.status === 'finished' || state.status === 'idle') return;
    // Paused between steps, "next" is the step already waiting.
    const between = state.status === 'paused' && !parked;
    jump(between ? state.index : Math.min(state.index + 1, script.steps.length), 'next');
  },
  // Back to the start of the previous chapter, whose setup puts the app in
  // the right state again.
  prev() {
    const script = state.script;
    if (!script || state.status === 'idle') return;
    const current = script.steps[Math.min(state.index, script.steps.length - 1)].chapter;
    const order = script.chapters.map((c) => c.id);
    const target = order[Math.max(0, order.indexOf(current) - 1)];
    jump(Math.max(0, script.steps.findIndex((s) => s.chapter === target)), 'previous');
  },
  setSpeed(speed: number) {
    set({ speed });
  },
  toggleCaptions() {
    set({ captions: !state.captions });
  },
  toggleNarration() {
    set({ narration: !state.narration });
  },
  exit() {
    interrupt(false);
    run += 1;
    parked = null;
    thawClock();
    // A tour left during the focus fast-forward mustn't leave the demo
    // clock racing for whoever explores next.
    setDemoSpeed(1);
    if (state.status !== 'idle') move('exiting', 'exit');
    state = { ...INITIAL };
    listeners.forEach((l) => l());
  },
  // How far the running (or paused) step got, for tests and the debug log.
  progress: (): StepProgress | null => step?.progress ?? parked,
};
