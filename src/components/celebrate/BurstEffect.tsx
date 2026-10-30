'use client';

// The small celebrations (v2 spec 10.3): a check that pops, a soft glow, a
// burst or ring of sparkles, or one slow ripple, drawn where the win
// happened (or just above the toasts). Pure CSS on transform and opacity,
// decorative only: the words go to screen readers through the host.
import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import type { CelebrationView } from '@/lib/celebrate/store';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';

const SPARKS = 8;

function Spark({ i, ring }: { i: number; ring: boolean }) {
  const angle = (i / SPARKS) * Math.PI * 2;
  const style = {
    '--dx': `${Math.cos(angle) * (ring ? 0 : 46)}px`,
    '--dy': `${Math.sin(angle) * (ring ? 0 : 46)}px`,
    left: ring ? `calc(50% + ${Math.cos(angle) * 40}px)` : '50%',
    top: ring ? `calc(50% + ${Math.sin(angle) * 40}px)` : '50%',
    animationDelay: ring ? `${i * 60}ms` : '0ms',
  } as CSSProperties;
  return (
    <svg viewBox="-10 -10 20 20" className="cel-spark absolute size-4 -translate-x-1/2 -translate-y-1/2" style={style}>
      <path d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" fill={i % 2 ? 'var(--accent)' : 'var(--primary)'} />
    </svg>
  );
}

export function BurstEffect({ view }: { view: CelebrationView }) {
  const { effect, tier } = view.decision;
  const level = useMotionLevel();
  // At Calm a burst becomes a ring that twinkles in place: no flying out.
  const ring = effect === 'sparkleRing' || (effect === 'sparkleBurst' && level !== 'lively');
  // 112px box (size-28) centered on the win, or above the toast area.
  const at = view.anchor ? { left: view.anchor.x - 56, top: view.anchor.y - 56 } : { left: 'calc(50% - 56px)', bottom: 200 };
  return (
    <div
      aria-hidden
      data-celebration={tier}
      data-effect={effect}
      className="pointer-events-none fixed z-[60] size-28"
      style={at}
    >
      {effect === 'pop' && (
        <span className="cel-pop absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="size-6 stroke-[3]" />
        </span>
      )}
      {effect === 'glow' && <span className="cel-glow absolute inset-0 rounded-full" />}
      {effect === 'ripple' && <span className="cel-ripple absolute inset-2 rounded-full border-4 border-primary" />}
      {(effect === 'sparkleBurst' || effect === 'sparkleRing') &&
        Array.from({ length: SPARKS }, (_, i) => <Spark key={i} i={i} ring={ring} />)}
    </div>
  );
}
