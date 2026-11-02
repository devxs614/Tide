// Plays the focus alert reliably (v2.1 F-06, spec 10.3). Browsers slow down
// timers in background tabs, sometimes by a minute, but the audio clock
// keeps time. So the end sound is scheduled on the audio clock when the
// block starts or resumes, cancelled on pause, and, if the context was
// suspended and it never sounded, played the moment the page notices the
// end. This is an alarm the person asked for by starting a timer, so it
// doesn't wait for "sound on"; it does respect the crisis screen's quiet.
import { TONES, type AlertTone, type EndTone } from './alertTones';
import { repeatOffsets, type AlertRepeat } from './alertPlan';

export interface EndAlertOptions {
  tone: EndTone;
  volume: number;
  repeat: AlertRepeat;
}

let ctx: AudioContext | null = null;
let input: GainNode | null = null;
let end: { nodes: AudioScheduledSourceNode[]; at: number } | null = null;
let warn: AudioScheduledSourceNode[] = [];

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    // Appendix C's limiter, so no recipe can come out loud.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    input = ctx.createGain();
    input.connect(limiter).connect(ctx.destination);
  }
  return ctx;
}

const clampVolume = (v: number) => Math.min(1, Math.max(0.1, v));

function silence(nodes: AudioScheduledSourceNode[]) {
  for (const node of nodes) {
    try {
      node.stop();
    } catch {
      // Already stopped.
    }
    node.disconnect();
  }
}

// Called from the Start and Resume buttons: a tap is what lets a page make
// sound later, so the context is created or woken up right there.
export function unlockAlertAudio(): void {
  const c = context();
  if (c?.state === 'suspended') void c.resume();
}

export function scheduleEndAlert(inSeconds: number, opts: EndAlertOptions): void {
  cancelEndAlert();
  const c = context();
  if (!c || !input) return;
  input.gain.value = clampVolume(opts.volume);
  const at = c.currentTime + Math.max(0.05, inSeconds);
  end = { at, nodes: repeatOffsets(opts.repeat).flatMap((offset) => TONES[opts.tone](c, input!, at + offset)) };
}

export function cancelEndAlert(): void {
  if (end) silence(end.nodes);
  end = null;
}

// The page noticed the end. If the audio clock already played it, leave
// it (and any repeats) alone; otherwise the context was asleep, so wake it
// and play now.
export function settleEndAlert(opts: EndAlertOptions): void {
  const c = context();
  if (end && c?.state === 'running' && c.currentTime >= end.at - 0.25) return;
  if (c?.state === 'suspended') void c.resume();
  scheduleEndAlert(0.05, opts);
}

export function scheduleWarning(inSeconds: number, volume: number): void {
  cancelWarning();
  const c = context();
  if (!c || !input) return;
  input.gain.value = clampVolume(volume);
  warn = TONES.warning(c, input, c.currentTime + Math.max(0.05, inSeconds));
}

export function cancelWarning(): void {
  silence(warn);
  warn = [];
}

// "Test sound" in Settings, and the refocus nudge (F-07).
export function playTone(tone: AlertTone, volume: number): void {
  const c = context();
  if (!c || !input) return;
  if (c.state === 'suspended') void c.resume();
  input.gain.value = clampVolume(volume);
  TONES[tone](c, input, c.currentTime + 0.05);
}

export function resetAlertEngineForTests(): void {
  ctx = null;
  input = null;
  end = null;
  warn = [];
}
