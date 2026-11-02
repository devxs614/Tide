// Tide's sound engine (v2 spec 6.2). One AudioContext, created only after a
// real gesture, with a master volume and a volume per category (interface,
// celebrations, companion, ambience). Every sound is synthesized from the
// recipes in sounds/, at most three play at once, and each one's loudness
// is capped so nothing is loud even at 100%. It loads only when sound is on.
// Background sounds moved to ambiencePlayer.ts in v2.1 (F-09).
import { SOUNDS } from './sounds';
import { hasUserGesture } from './gesture';
import type { SoundCategory, SoundName } from './names';

export interface SoundSettings {
  volume: number;
  categories: Record<Exclude<SoundCategory, 'ambience'>, boolean>;
}

const MAX_AT_ONCE = 3;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const busses = new Map<SoundCategory, GainNode>();
let playing = 0;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !hasUserGesture()) return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    // Headroom: even at 100% volume the mix stays gentle.
    master.gain.value = 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function bus(context: AudioContext, category: SoundCategory): GainNode {
  let node = busses.get(category);
  if (!node) {
    node = context.createGain();
    node.connect(master!);
    busses.set(category, node);
  }
  return node;
}

export function playSound(name: SoundName, settings: SoundSettings): void {
  const sound = SOUNDS[name];
  if (!sound || !settings.categories[sound.category as keyof SoundSettings['categories']]) return;
  if (playing >= MAX_AT_ONCE) return;
  const context = audio();
  if (!context) return;
  const out = bus(context, sound.category);
  out.gain.value = Math.max(0, Math.min(1, settings.volume));
  playing += 1;
  sound.fn(context, out, context.currentTime + 0.01);
  window.setTimeout(() => {
    playing = Math.max(0, playing - 1);
  }, 1200);
}
