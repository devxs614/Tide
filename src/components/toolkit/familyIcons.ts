// One icon per strategy family, always shown next to the family's name.
import { Brain, Footprints, Leaf, Palette, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StrategyFamily } from '@/lib/types';

export const FAMILY_ICONS: Record<StrategyFamily, LucideIcon> = {
  move: Footprints,
  calm: Leaf,
  connect: Users,
  create: Palette,
  think: Brain,
};
