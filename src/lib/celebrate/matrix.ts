// How a win is celebrated (v2 spec 10.3): the tier (micro, small, big)
// crossed with how Maya said she feels. Confetti for someone who just said
// they feel drained is tone-deaf, so Ebb gets a soft glow and "That counted."
// and Surge a single slow ripple, while Swell gets the full party. This file
// is pure: it only decides; useCelebrate plays it.
import type { Expression, Reaction } from '@/lib/companion/registry';
import type { MotionLevel } from '@/lib/motion/tokens';
import type { SoundName } from '@/lib/sound/names';
import type { Quadrant, Settings } from '@/lib/types';
import { copy } from '@/copy/en';

export type CelebrationEvent =
  | 'checkinSaved'
  | 'taskStarted'
  | 'taskDone'
  | 'unstuck'
  | 'focusDone'
  | 'bridgeDone'
  | 'transitionRated'
  | 'recheckBetter'
  | 'wrapDone'
  | 'firstTime'
  | 'bottleOpened';

export type Tier = 'micro' | 'small' | 'big';
export type Column = Quadrant | 'neutral';
export type Effect = 'none' | 'pop' | 'glow' | 'sparkleBurst' | 'sparkleRing' | 'ripple';
export type Particles = 'none' | 'confetti' | 'sparkles' | 'bubbles';

// Spec 10.2. taskDone becomes big when the task was hard (see useCelebrate).
export const BASE_TIER: Record<CelebrationEvent, Tier> = {
  checkinSaved: 'micro',
  taskStarted: 'micro',
  taskDone: 'small',
  unstuck: 'big',
  focusDone: 'small',
  bridgeDone: 'small',
  transitionRated: 'small',
  recheckBetter: 'small',
  wrapDone: 'big',
  firstTime: 'small',
  bottleOpened: 'micro',
};

export interface Decision {
  event: CelebrationEvent;
  tier: Tier;
  column: Column;
  effect: Effect;
  // A full-screen moment; `plain` is the still dialog used at motion Off.
  overlay: { particles: Particles; plain: boolean } | null;
  sound: { name: SoundName; volume: number } | null;
  companion: { expression: Expression; reaction?: Reaction };
  // Words that go in a toast (the hard-day wording, or the text that
  // replaces movement at motion Off).
  toast: string | null;
}

export interface DecideInput {
  event: CelebrationEvent;
  tier: Tier;
  quadrant: Quadrant | null;
  level: MotionLevel;
  setting: Settings['motion.celebrations'];
  confetti: boolean;
}

const PLEASANT: Column[] = ['swell', 'still', 'neutral'];

export function decide({ event, tier: requested, quadrant, level, setting, confetti }: DecideInput): Decision {
  const column: Column = quadrant ?? 'neutral';
  // "Gentle" celebrations: big becomes small. "Off": micro only, but a big
  // moment still gets its words in a toast (spec 10.3, settings).
  const tier: Tier = setting === 'off' ? 'micro' : setting === 'gentle' && requested === 'big' ? 'small' : requested;
  const base = MATRIX[tier][column];
  let effect = base.effect;
  let overlay = base.overlay ? { particles: base.overlay, plain: false } : null;
  let toast = base.toast;

  if (overlay && (overlay.particles === 'confetti' && (level !== 'lively' || !confetti || setting === 'gentle'))) {
    overlay = { ...overlay, particles: 'sparkles' };
  }
  if (level === 'off') {
    effect = 'none';
    // Off: pleasant big moments become a still dialog; everything else that
    // would have moved becomes words, so nobody misses that it worked.
    overlay = overlay ? { particles: 'none', plain: true } : null;
    if (!toast && tier === 'small') toast = copy.celebrate.announce[event];
  }
  if (setting === 'off' && requested === 'big' && !toast) toast = copy.celebrate.announce[event];
  return { event, tier, column, effect, overlay, sound: base.sound, companion: base.companion, toast };
}

interface Cell {
  effect: Effect;
  overlay?: Particles;
  sound: Decision['sound'];
  companion: Decision['companion'];
  toast: string | null;
}

const s = (name: SoundName, volume = 1) => ({ name, volume });

const MATRIX: Record<Tier, Record<Column, Cell>> = {
  micro: {
    swell: { effect: 'pop', sound: s('select'), companion: { expression: 'happy' }, toast: null },
    still: { effect: 'pop', sound: null, companion: { expression: 'calm' }, toast: null },
    neutral: { effect: 'pop', sound: null, companion: { expression: 'happy' }, toast: null },
    surge: { effect: 'pop', sound: null, companion: { expression: 'calm' }, toast: null },
    ebb: { effect: 'glow', sound: null, companion: { expression: 'soft' }, toast: null },
  },
  small: {
    swell: { effect: 'sparkleBurst', sound: s('celebrate-small'), companion: { expression: 'happy', reaction: 'hop' }, toast: null },
    still: { effect: 'sparkleRing', sound: s('success'), companion: { expression: 'calm' }, toast: null },
    neutral: { effect: 'sparkleBurst', sound: s('success'), companion: { expression: 'happy' }, toast: null },
    surge: { effect: 'ripple', sound: s('success', 0.4), companion: { expression: 'calm', reaction: 'lean' }, toast: copy.celebrate.surgeSmall },
    ebb: { effect: 'glow', sound: null, companion: { expression: 'soft' }, toast: copy.celebrate.ebbSmall },
  },
  big: {
    swell: { effect: 'none', overlay: 'confetti', sound: s('celebrate-big'), companion: { expression: 'proud', reaction: 'wiggle' }, toast: null },
    still: { effect: 'none', overlay: 'bubbles', sound: s('success'), companion: { expression: 'happy' }, toast: null },
    neutral: { effect: 'none', overlay: 'confetti', sound: s('celebrate-small'), companion: { expression: 'happy', reaction: 'hop' }, toast: null },
    // No overlay on hard days: a quiet effect and kind words instead.
    surge: { effect: 'ripple', sound: s('success', 0.4), companion: { expression: 'calm', reaction: 'lean' }, toast: copy.celebrate.surgeBig },
    ebb: { effect: 'glow', sound: null, companion: { expression: 'soft' }, toast: copy.celebrate.ebbBig },
  },
};

export const isPleasant = (column: Column) => PLEASANT.includes(column);
