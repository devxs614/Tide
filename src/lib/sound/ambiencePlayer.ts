// The ambience player (v2.1 F-09): one background sound at a time, faded
// in and out over 1.5 seconds and crossfaded when switching, behind a
// limiter and a soft maximum so it's never loud. Playing one is an
// explicit choice, so it doesn't wait for "sound on"; the crisis and
// support screens' quiet stops it at once. It replaces v2's ambience in
// engine.ts, and v2's waves, rain and brown sound the same.
import { realNow } from '../clock';
import { isQuiet, onQuiet } from './useSound';
import { makeAmbienceBuffer, type BufferKind } from './ambience';
import { getAmbienceState, setAmbienceState } from './ambienceState';
import { isBinaural, type AmbienceId } from './names';

export const FADE_S = 1.5;
// "Play for 30 minutes" lets go over 5 seconds.
const END_FADE_S = 5;
// The player's 100% is half of full scale.
const SOFT_MAX = 0.5;
const LEVELS: Record<BufferKind, number> = { white: 0.25, pink: 0.3, brown: 0.4, rain: 0.25, waves: 0.3, fan: 0.35, stream: 0.3 };
const BINAURAL = {
  binaural_focus: { left: 200, right: 214, bed: 'pink' as const, bedLevel: 0.08 },
  binaural_calm: { left: 180, right: 186, bed: 'brown' as const, bedLevel: 0.1 },
};

interface Playing {
  id: AmbienceId;
  nodes: AudioScheduledSourceNode[];
  gain: GainNode;
}

let ctx: AudioContext | null = null;
let volumeNode: GainNode | null = null;
let current: Playing | null = null;
let endTimer: number | null = null;
let last: { id: AmbienceId; volume: number; title: string } | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    volumeNode = ctx.createGain();
    volumeNode.connect(limiter).connect(ctx.destination);
    // The crisis screen: fade out right away, whatever is playing.
    onQuiet(() => stopAmbience(0.2));
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export const capVolume = (v: number) => Math.min(1, Math.max(0, v)) * SOFT_MAX;

function loop(c: AudioContext, kind: BufferKind, level: number, out: AudioNode): AudioBufferSourceNode {
  const source = c.createBufferSource();
  source.buffer = makeAmbienceBuffer(c, kind);
  source.loop = true;
  const gain = c.createGain();
  gain.gain.value = level;
  source.connect(gain).connect(out);
  source.start();
  return source;
}

// The nodes for one sound. Binaural: two steady tones panned hard left and
// right (the "beat" is their difference), over a quiet noise bed.
export function buildAmbience(c: AudioContext, id: AmbienceId, out: AudioNode): AudioScheduledSourceNode[] {
  if (!isBinaural(id)) return [loop(c, id as BufferKind, LEVELS[id as BufferKind], out)];
  const recipe = BINAURAL[id as keyof typeof BINAURAL];
  const tones = ([
    [recipe.left, -1],
    [recipe.right, 1],
  ] as const).map(([freq, pan]) => {
    const osc = c.createOscillator();
    osc.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.value = 0.08;
    const panner = c.createStereoPanner();
    panner.pan.value = pan;
    osc.connect(gain).connect(panner).connect(out);
    osc.start();
    return osc;
  });
  return [...tones, loop(c, recipe.bed, recipe.bedLevel, out)];
}

function fadeOut(playing: Playing, seconds: number) {
  const t = ctx!.currentTime;
  playing.gain.gain.cancelScheduledValues(t);
  playing.gain.gain.setValueAtTime(playing.gain.gain.value, t);
  playing.gain.gain.linearRampToValueAtTime(0.0001, t + seconds);
  for (const node of playing.nodes) node.stop(t + seconds + 0.05);
}

function clearEndTimer() {
  if (endTimer !== null) window.clearTimeout(endTimer);
  endTimer = null;
}

function mediaSession(title: string | null) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = title ? new MediaMetadata({ title, artist: 'Tide' }) : null;
    navigator.mediaSession.setActionHandler('play', title ? resumeAmbience : null);
    navigator.mediaSession.setActionHandler('pause', title ? pauseAmbience : null);
    navigator.mediaSession.setActionHandler('stop', title ? () => stopAmbience() : null);
  } catch {
    // Some browsers have the object but not every action.
  }
}

export interface PlayOptions {
  volume: number;
  // The sound's name, for the lock screen and headphone controls.
  title: string;
  minutes?: number;
  untilFocusEnds?: boolean;
  auto?: boolean;
}

export function playAmbience(id: AmbienceId, opts: PlayOptions): void {
  if (isQuiet()) return;
  const c = context();
  if (!c || !volumeNode) return;
  clearEndTimer();
  if (current) fadeOut(current, FADE_S);
  const t = c.currentTime;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(1, t + FADE_S);
  gain.connect(volumeNode);
  volumeNode.gain.value = capVolume(opts.volume);
  current = { id, nodes: buildAmbience(c, id, gain), gain };
  last = { id, volume: opts.volume, title: opts.title };
  let endsAt: number | null = null;
  if (opts.minutes) {
    // The fade is on the audio clock, so a slow background tab can't stretch
    // it; the timer only tidies up afterwards.
    const end = t + opts.minutes * 60;
    gain.gain.setValueAtTime(1, end - END_FADE_S);
    gain.gain.linearRampToValueAtTime(0.0001, end);
    for (const node of current.nodes) node.stop(end + 0.05);
    endsAt = realNow() + opts.minutes * 60_000;
    endTimer = window.setTimeout(() => {
      current = null;
      setAmbienceState(null);
      mediaSession(null);
    }, opts.minutes * 60_000);
  }
  setAmbienceState({ sound: id, paused: false, auto: !!opts.auto, untilFocusEnds: !!opts.untilFocusEnds, endsAt });
  mediaSession(opts.title);
}

export function stopAmbience(seconds = FADE_S): void {
  clearEndTimer();
  if (current && ctx) fadeOut(current, seconds);
  current = null;
  setAmbienceState(null);
  mediaSession(null);
}

export function pauseAmbience(): void {
  clearEndTimer();
  if (current && ctx) fadeOut(current, 0.3);
  current = null;
  setAmbienceState({ paused: true, endsAt: null });
}

export function resumeAmbience(): void {
  const state = getAmbienceState();
  if (!last || !state.paused) return;
  playAmbience(last.id, { volume: last.volume, title: last.title, untilFocusEnds: state.untilFocusEnds, auto: state.auto });
}

export function setAmbienceVolume(volume: number): void {
  if (last) last.volume = volume;
  if (ctx && volumeNode) volumeNode.gain.setTargetAtTime(capVolume(volume), ctx.currentTime, 0.05);
}

// "Until focus ends": silent half a second before the block ends, so the
// end alert is heard clearly. Pause and resume call these again.
export function scheduleAmbienceEnd(inSeconds: number): void {
  if (!current || !ctx) return;
  const t = ctx.currentTime;
  const end = t + Math.max(0.6, inSeconds) - 0.5;
  current.gain.gain.cancelScheduledValues(t);
  current.gain.gain.setValueAtTime(1, Math.max(t, end - 3));
  current.gain.gain.linearRampToValueAtTime(0.0001, end);
}

export function cancelAmbienceEnd(): void {
  if (!current || !ctx) return;
  current.gain.gain.cancelScheduledValues(ctx.currentTime);
  current.gain.gain.setValueAtTime(1, ctx.currentTime);
}

export function resetAmbiencePlayerForTests(): void {
  ctx = null;
  volumeNode = null;
  current = null;
  last = null;
  clearEndTimer();
  setAmbienceState(null);
}
