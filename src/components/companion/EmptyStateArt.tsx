'use client';

// The picture at the top of an empty state, an error page or the 404 (v2
// spec 9 and 17.5): the companion, waving or soft, when Maya has one and
// allows it in empty screens; otherwise the calm wave Tide has always used.
// It's only a picture (no lines, no voice), so it uses the lazily loaded
// Companion rather than a host: the error page wraps every screen, and
// anything it imports would weigh down every first load.
import { SIZES, type Expression } from '@/lib/companion/registry';
import { useCompanionShown } from '@/lib/companion/useCompanion';
import { WaveMark } from '@/components/ui/wave-mark';
import { LazyCompanion as Companion } from './LazyCompanion';

export function EmptyStateArt({ expression = 'waving' }: { expression?: Expression }) {
  const shown = useCompanionShown('empty');
  if (!shown) return <WaveMark className="h-20 w-32" />;
  return <Companion size={SIZES.md} expression={expression} decorative />;
}
