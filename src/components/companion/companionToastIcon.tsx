'use client';

// The companion's head on a toast ("Checked in · Ebb" with a soft lean).
// Returns undefined, not an empty element, when there's no companion to
// show, because the toast library makes room for any icon it's given; this
// way v1-style toasts stay exactly as they were.
import type { ReactNode } from 'react';
import type { CompanionProfile } from '@/lib/companion/useCompanion';
import type { Expression, Reaction } from '@/lib/companion/registry';
import { LazyCompanion as Companion } from './LazyCompanion';

const TOAST_SIZE = 36;

export function companionToastIcon(profile: CompanionProfile, expression: Expression, reaction?: Reaction): ReactNode | undefined {
  if (!profile.species || !profile.placements.toasts) return undefined;
  return (
    <span className="cmp-toast -my-2 -ml-1 inline-flex">
      <Companion size={TOAST_SIZE} expression={expression} reaction={reaction ?? null} reactionKey={1} decorative />
    </span>
  );
}
