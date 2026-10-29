'use client';

// The current motion level for a component: off, calm or lively. Every
// animated thing in Tide asks this before it moves (v2 spec 5.2).
import { useSettings } from '@/lib/settings';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { resolveMotionLevel } from './resolve';
import type { MotionLevel } from './tokens';

export { resolveMotionLevel };

export function useMotionLevel(): MotionLevel {
  const { settings } = useSettings();
  const os = usePrefersReducedMotion();
  return resolveMotionLevel(settings, os);
}
