'use client';

// The companion in the corner of a toolkit exercise (v2 spec 9): curious
// through grounding, thinking over the sudoku, waving by a message template,
// and walking along the top during a walk (at Lively; at Calm it stands).
// Box breathing has its own companion in the middle of the square.
import type { ToolId } from '@/data/strategies';
import { SIZES, type Expression } from '@/lib/companion/registry';
import { useCompanionShown } from '@/lib/companion/useCompanion';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { CompanionHost } from '@/components/companion/CompanionHost';
import { cn } from '@/lib/utils';

const BASE: Partial<Record<ToolId, Expression>> = {
  grounding_54321: 'curious',
  sudoku_4x4: 'thinking',
  message_template: 'waving',
  walk_timer: 'idle',
};

export function ToolCompanion({ tool }: { tool: ToolId }) {
  const shown = useCompanionShown('toolkit');
  const level = useMotionLevel();
  const base = BASE[tool];
  if (!shown || !base) return null;
  const walking = tool === 'walk_timer' && level === 'lively';
  return (
    <div className={cn('flex', walking ? 'walk-across' : 'justify-end')}>
      <CompanionHost placement="toolkit" size={SIZES.sm} base={base} listens={['nudge']} walking={walking} bubble="none" decorative />
    </div>
  );
}
