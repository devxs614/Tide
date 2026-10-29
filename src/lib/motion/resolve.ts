// How much things move, worked out from settings and the device (v2 spec
// 5.2). Maya's own choice wins; otherwise the device's reduced-motion setting
// means Off; otherwise Calm. v1's "Reduce motion" switch still counts as Off.
// No React here, so the settings provider and the hook can both use it.
import type { Settings } from '../types';
import type { MotionLevel } from './tokens';

export function resolveMotionLevel(settings: Pick<Settings, 'motion.level' | 'reduceMotion'>, osReduced: boolean): MotionLevel {
  const chosen = settings['motion.level'];
  if (chosen && chosen !== 'auto') return chosen;
  if (settings.reduceMotion || osReduced) return 'off';
  return 'calm';
}
