// Tiny vibrations for touch feedback (v2 spec 6.3), where the phone supports
// them. Off by default. iOS Safari has no Vibration API, so there Settings
// says "Not supported on this device" instead of offering a switch that
// would do nothing.
export type HapticKind = 'light' | 'medium' | 'success';

const PATTERNS: Record<HapticKind, number | number[]> = { light: 10, medium: 20, success: [12, 40, 18] };

export function hapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function haptic(kind: HapticKind, enabled: boolean): void {
  if (!enabled || !hapticsSupported()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    // Some browsers throw when vibration isn't allowed right now; it's only feedback.
  }
}
