'use client';

// A companion on screen: the species drawing (loaded on demand, one species
// at a time) inside an SVG that the CSS in companion.css animates. This file
// decides the moment-to-moment life: when to blink and do a signature idle
// (more often at Lively, never while Maya types or breathes), reactions,
// breath sync, walking, and pausing when off screen or hidden. It never
// shows sadness; "soft" is as low as it goes.
import './companion.css';
import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { COMPANION_COPY } from '@/copy/companions';
import { fill } from '@/copy/en';
import { COMPANIONS, variantFor, type AccessoryId, type CompanionSpecies, type Expression, type Reaction } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';
import { useLoopPermission } from '@/lib/companion/loopPermission';
import type { MotionLevel } from '@/lib/motion/tokens';
import type { SpeciesArtProps } from './species/types';

const ART: Record<CompanionSpecies, ComponentType<SpeciesArtProps>> = {
  otter: dynamic(() => import('./species/Otter').then((m) => m.OtterArt)),
  axolotl: dynamic(() => import('./species/Axolotl').then((m) => m.AxolotlArt)),
  capybara: dynamic(() => import('./species/Capybara').then((m) => m.CapybaraArt)),
  gecko: dynamic(() => import('./species/Gecko').then((m) => m.GeckoArt)),
  jellyfish: dynamic(() => import('./species/Jellyfish').then((m) => m.JellyfishArt)),
  hermit_crab: dynamic(() => import('./species/HermitCrab').then((m) => m.HermitCrabArt)),
};

export type BreathPhase = 'in' | 'hold-in' | 'out' | 'hold-out';

export interface CompanionFigureProps {
  species: CompanionSpecies;
  name: string;
  variant: string;
  accessory: AccessoryId;
  expression: Expression;
  size: number;
  level: MotionLevel;
  // Changing reactionKey replays the reaction.
  reaction?: Reaction | null;
  reactionKey?: number;
  breathPhase?: BreathPhase | null;
  breathPhaseMs?: number;
  walking?: boolean;
  // Typing or breathing: no surprise idles now.
  holdIdle?: boolean;
  idleEnabled?: boolean;
  faceStyle?: 'dots' | 'none';
  glowColor?: string;
  decorative?: boolean;
  onClick?: () => void;
}

// Seconds between signature idles: 12–20 at Lively, 30–45 at Calm.
function nextIdleDelay(level: MotionLevel): number {
  const [min, max] = level === 'lively' ? [12, 20] : [30, 45];
  return (min + Math.random() * (max - min)) * 1000;
}

const GLOW: Partial<Record<Expression, { strength: number; speed: string }>> = {
  happy: { strength: 1, speed: '2.4s' },
  proud: { strength: 1, speed: '2.4s' },
  soft: { strength: 0.55, speed: '5s' },
  thinking: { strength: 0.8, speed: '3s' },
  sleeping: { strength: 0.25, speed: '7s' },
  sleepy: { strength: 0.4, speed: '6s' },
};

export default function CompanionFigure(props: CompanionFigureProps) {
  const {
    species, name, variant, accessory, expression, size, level, reaction, reactionKey = 0,
    breathPhase, breathPhaseMs = 4000, walking, holdIdle, idleEnabled = true, faceStyle = 'dots',
    glowColor, decorative, onClick,
  } = props;
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [special, setSpecial] = useState(false);
  const [visible, setVisible] = useState(true);
  const [blink] = useState(() => `${(3 + Math.random() * 3).toFixed(2)}s`);
  const loops = level !== 'off' && idleEnabled;
  const mayLoop = useLoopPermission(id, size, loops);

  // Pause when off screen or when the tab is hidden (v2 spec 5.6).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && document.visibilityState === 'visible'));
      io.observe(el);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, []);

  // Signature idle now and then, never while typing or breathing.
  useEffect(() => {
    if (!loops || holdIdle || !visible || !mayLoop) return;
    let off: number;
    const on = window.setTimeout(() => {
      setSpecial(true);
      off = window.setTimeout(() => setSpecial(false), 2400);
    }, nextIdleDelay(level));
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [loops, holdIdle, visible, mayLoop, level, special]);

  // A "special" reaction (a tap in the Studio, the Bridge opening) plays the
  // species' signature idle right away instead of waiting for its turn.
  useEffect(() => {
    if (reaction !== 'special' || level === 'off') return;
    const on = window.setTimeout(() => setSpecial(true), 0);
    const off = window.setTimeout(() => setSpecial(false), 2400);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [reaction, reactionKey, level]);

  const colors = variantFor(species, variant);
  const Art = ART[species];
  const eyesClosed = expression === 'breathing' ? breathPhase === 'in' || breathPhase === 'hold-in' || !breathPhase : false;
  const glow = GLOW[expression] ?? { strength: 0.75, speed: '4s' };
  const head = COMPANIONS[species].attach.head;
  const label = fill(COMPANION_COPY.alt, {
    name,
    kind: COMPANION_COPY.species[species].kind.toLowerCase(),
    expression: COMPANION_COPY.expressionWords[expression],
  });

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="cmp overflow-visible"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      data-companion={species}
      data-expression={expression}
      data-level={level}
      data-reaction={level !== 'off' && reaction ? reaction : undefined}
      data-special={special || undefined}
      data-breath={breathPhase ?? undefined}
      data-walking={walking || undefined}
      data-paused={!visible || !mayLoop || undefined}
      onClick={onClick}
      style={{ ['--blink' as string]: blink, ['--glow-speed' as string]: glow.speed, ['--breath-phase-ms' as string]: `${breathPhaseMs}ms`, cursor: onClick ? 'pointer' : undefined }}
    >
      <g className="cmp-bob">
        {/* A new key remounts this group, which replays the reaction's animation. */}
        <g className="cmp-react" key={reactionKey}>
          <g className="cmp-pose">
            <g className="cmp-fig">
              <Art
                colors={colors}
                expression={expression}
                eyesClosed={eyesClosed}
                accessory={accessory}
                faceStyle={faceStyle}
                glow={{ color: glowColor ?? colors.accent, strength: glow.strength }}
              />
            </g>
          </g>
        </g>
      </g>
      {expression === 'thinking' && (
        <g data-part="thinking">
          {[0, 1, 2].map((i) => (
            <circle key={i} className="cmp-think-dot" cx={head.x + 26 + i * 12} cy={head.y - 14 - i * 6} r={4 + i} fill="var(--ink-soft)" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </g>
      )}
      {expression === 'proud' && (
        <g data-part="sparkles" fill="var(--accent)">
          {[
            [34, 54],
            [168, 46],
            [176, 120],
          ].map(([x, y], i) => (
            <path key={x} className="cmp-sparkle" style={{ animationDelay: `${i * 300}ms` }} d={`M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3} Z`} />
          ))}
        </g>
      )}
      {(expression === 'sleeping' || expression === 'sleepy') && (
        <g data-part="sleep">
          {expression === 'sleeping' && (
            <g transform={`translate(${head.x} ${head.y + 4}) scale(${head.scale})`}>
              <path d="M-40 6 Q-30 -44 22 -40 Q50 -36 56 -8 L40 -2 Q30 -24 0 -22 Q-26 -20 -28 8 Z" fill={PALETTE.nightcap} />
              <circle cx={58} cy={-8} r={8} fill="white" />
            </g>
          )}
          <text className="cmp-zzz" x={head.x + 44} y={head.y - 6} fontSize={18} fontWeight={800} fill="var(--ink-soft)">
            z
          </text>
        </g>
      )}
    </svg>
  );
}
