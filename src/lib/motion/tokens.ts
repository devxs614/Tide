// Every animation timing in Tide comes from here (v2 spec 5.3), so motion
// feels like one app instead of twenty. Components never hardcode a
// duration: they ask motionFor() with the current level, and at level Off
// they get no movement at all.

export type MotionLevel = 'off' | 'calm' | 'lively';

export const duration = { instant: 0.08, fast: 0.15, base: 0.25, slow: 0.4, slower: 0.6, scenic: 1.2 }; // seconds
export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  in: [0.55, 0, 1, 0.45] as const,
};

export interface SpringPreset {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass: number;
}

export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 }, // buttons, toggles, chips
  bouncy: { type: 'spring', stiffness: 380, damping: 18, mass: 0.9 }, // badges, celebrations (lively)
  gentle: { type: 'spring', stiffness: 220, damping: 30, mass: 1 }, // sheets, cards, page enter
  floaty: { type: 'spring', stiffness: 90, damping: 14, mass: 1.2 }, // companion hops, shore items
} satisfies Record<string, SpringPreset>;

// Never stagger a list for longer than 0.3s in total: past that, the last
// items feel like they're being held back.
export const stagger = { list: 0.035, grid: 0.025, max: 0.3 };

export type SpringName = keyof typeof spring;
export type Transition = SpringPreset | { duration: number; ease?: readonly number[] };

// The transition for a preset at the current level. Calm swaps bounce for
// the gentle spring; Off returns no movement at all.
export function motionFor(level: MotionLevel, preset: SpringName): Transition {
  if (level === 'off') return { duration: 0 };
  if (level === 'calm' && preset === 'bouncy') return spring.gentle;
  return spring[preset];
}

// Distances shrink at Calm ("translate ≤ 12px") and vanish at Off.
export function distanceFor(level: MotionLevel, px: number): number {
  if (level === 'off') return 0;
  return level === 'calm' ? Math.min(px / 2, 12) : px;
}

export function staggerFor(level: MotionLevel, count: number, step = stagger.list): number {
  if (level === 'off') return 0;
  const each = level === 'calm' ? Math.min(step, 0.02) : step;
  return Math.min(each, stagger.max / Math.max(count, 1));
}
