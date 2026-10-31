// The demo director's engine (v2 spec 16.4): plays a script's steps in
// order, with captions, a spotlight target, and holds long enough to see
// each result. It can pause, go to the next step or back to the start of
// the previous chapter, change speed, and stop. A step that fails (an
// element that never appeared) is noted and skipped; the tour never crashes.
import type { Script, Step } from './types';
import { click, findTarget, typeInto } from './actions';

export type DirectorMode = 'full' | 'pitch' | 'presenter';

export interface DirectorState {
  script: Script | null;
  mode: DirectorMode;
  presenter: boolean;
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

export interface DirectorDeps {
  navigate: (path: string) => void;
  speak: (text: string) => Promise<void>;
  custom: (name: string, args?: Record<string, unknown>) => Promise<void>;
  setClock: (ts: number) => Promise<void>;
  setSpeed: (multiplier: number) => Promise<void>;
}

const INITIAL: DirectorState = {
  script: null, mode: 'full', presenter: false, running: false, paused: false, done: false, index: 0,
  speed: 1, captions: true, narration: false, caption: '', chapterTitle: '', target: null, log: [],
};

let state: DirectorState = INITIAL;
let deps: DirectorDeps | null = null;
let token = 0;
const listeners = new Set<() => void>();

function set(patch: Partial<DirectorState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

async function waitWhilePaused(run: number) {
  while (state.paused && run === token) await sleep(100);
}

async function exec(step: Step) {
  const a = step.action;
  const target = step.target ? await findTarget(step.target, a.kind === 'waitFor' ? (a.timeoutMs ?? 4000) : 4000) : null;
  if (target) {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    set({ target });
    await sleep(250 / state.speed);
  } else if (a.kind === 'navigate' || a.kind === 'custom') set({ target: null });
  switch (a.kind) {
    case 'navigate':
      deps!.navigate(a.path);
      return sleep(500);
    case 'click':
      if (target) click(target);
      return sleep(300 / state.speed);
    case 'type':
      if (target) await typeInto(target, a.text, a.cps ?? 22, state.speed);
      return;
    case 'wait':
      return sleep(a.ms / state.speed);
    case 'setClock':
      return deps!.setClock(a.ts);
    case 'setSpeed':
      return deps!.setSpeed(a.multiplier);
    case 'custom':
      return deps!.custom(a.name, a.args);
    default:
      return;
  }
}

async function play(run: number) {
  const script = state.script!;
  while (run === token && state.index < script.steps.length) {
    await waitWhilePaused(run);
    if (run !== token) return;
    const step = script.steps[state.index];
    const chapter = script.chapters.find((c) => c.id === step.chapter);
    set({ chapterTitle: chapter?.title ?? '', caption: step.caption ?? state.caption });
    let ok = true;
    try {
      await exec(step);
    } catch {
      ok = false;
      set({ caption: '…' });
    }
    if (run !== token) return;
    set({ log: [...state.log, { id: step.id, ok }] });
    if (step.narrate && state.narration && step.caption) await Promise.race([deps!.speak(step.caption), sleep(9000)]);
    // A caption stays up long enough to be read in a room: about a second
    // plus 50 ms a character (3.5 s for a typical one). Before V12 the pitch
    // cut showed each for under a second.
    const readMs = step.caption ? 1000 + step.caption.length * 50 : 0;
    await sleep(Math.max(step.holdMs ?? 700, readMs) / state.speed);
    if (run !== token) return;
    set({ index: state.index + 1, paused: state.presenter && !!step.presenterPause });
  }
  if (run === token) set({ done: true, target: null, caption: '' });
}

export const director = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getState: () => state,
  start(script: Script, mode: DirectorMode, d: DirectorDeps, opts: { captions?: boolean; narration?: boolean; speed?: number } = {}) {
    deps = d;
    token += 1;
    set({ ...INITIAL, script, mode, presenter: mode === 'presenter', running: true, captions: opts.captions ?? true, narration: opts.narration ?? false, speed: opts.speed ?? 1 });
    void play(token);
  },
  toggle() {
    set({ paused: !state.paused });
  },
  next() {
    if (!state.script) return;
    token += 1;
    set({ index: Math.min(state.index + 1, state.script.steps.length), paused: false });
    void play(token);
  },
  // Back to the start of the previous chapter, whose setup puts the app in
  // the right state again.
  prev() {
    const script = state.script;
    if (!script) return;
    const current = script.steps[Math.min(state.index, script.steps.length - 1)].chapter;
    const order = script.chapters.map((c) => c.id);
    const target = order[Math.max(0, order.indexOf(current) - 1)];
    token += 1;
    set({ index: Math.max(0, script.steps.findIndex((s) => s.chapter === target)), paused: false, done: false });
    void play(token);
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
    token += 1;
    set({ ...INITIAL });
  },
};
