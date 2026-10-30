'use client';

// The companion as most screens use it: Maya's own companion (or the calm
// wave if she chose none), at a given size and expression. The drawing loads
// on first use, and a same-size placeholder holds its place meanwhile, so
// nothing on the page jumps when it arrives.
import dynamic from 'next/dynamic';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useCompanion } from '@/lib/companion/useCompanion';
import { COMPANIONS, type CompanionSpecies, type Expression, type Reaction, type AccessoryId } from '@/lib/companion/registry';
import { useSettings } from '@/lib/settings';
import type { BreathPhase } from './CompanionFigure';
import { NoneCompanion } from './NoneCompanion';

const CompanionFigure = dynamic(() => import('./CompanionFigure'), {
  ssr: false,
  loading: () => null,
});

export interface CompanionProps {
  size?: number;
  expression?: Expression;
  reaction?: Reaction | null;
  reactionKey?: number;
  breathPhase?: BreathPhase | null;
  breathPhaseMs?: number;
  walking?: boolean;
  holdIdle?: boolean;
  decorative?: boolean;
  onClick?: () => void;
  glowColor?: string;
  // Show a particular companion (Studio previews, onboarding, the gallery)
  // instead of Maya's own.
  override?: { species: CompanionSpecies; variant?: string; accessory?: AccessoryId; name?: string; faceStyle?: 'dots' | 'none' };
}

export function Companion({ size, expression = 'idle', override, ...rest }: CompanionProps) {
  const profile = useCompanion();
  const { settings } = useSettings();
  const level = useMotionLevel();
  const px = size ?? profile.size;
  const species = override?.species ?? profile.species;
  if (!species) return <NoneCompanion size={px} />;
  return (
    <span className="inline-flex shrink-0" style={{ width: px, height: px }}>
      <CompanionFigure
        species={species}
        name={override?.name ?? (override ? COMPANIONS[species].defaultName : profile.name)}
        variant={override?.variant ?? (override ? '' : profile.variant)}
        accessory={override?.accessory ?? (override ? 'none' : profile.accessory)}
        faceStyle={override?.faceStyle ?? profile.faceStyle}
        expression={expression}
        size={px}
        level={level}
        idleEnabled={settings['motion.companionIdle']}
        {...rest}
      />
    </span>
  );
}
