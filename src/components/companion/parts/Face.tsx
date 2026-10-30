// One face, shared by every companion, so every species can show every
// expression (v2 spec 8.4). A species only says where its eyes and mouth
// are; this decides their shapes: happy arcs, soft "smiling" eyes, closed
// eyes on the in-breath, a little "o" when curious. Eyes are always near-
// black with a white highlight. The face never shows sadness: the softest it
// gets is "soft", gentle eyes and a small closed smile.
import type { Expression } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';

export interface FaceGeometry {
  left: [number, number];
  right: [number, number];
  r: number;
  mouth: [number, number];
  mouthW: number;
  cheeks: [[number, number], [number, number]];
  cheekR: [number, number];
}

type EyeShape = 'open' | 'arcs' | 'wide' | 'up' | 'down' | 'gentle' | 'half' | 'closed';
type MouthShape = 'small' | 'open' | 'o' | 'soft' | 'flat' | 'big' | 'neutral' | 'determined' | 'tiny';

const EYES: Record<Expression, EyeShape> = {
  idle: 'open', happy: 'arcs', curious: 'wide', listening: 'open', thinking: 'up', soft: 'gentle', calm: 'half',
  proud: 'arcs', focused: 'down', breathing: 'gentle', packing: 'open', sleepy: 'half', sleeping: 'closed', waving: 'arcs',
};
const MOUTH: Record<Expression, MouthShape> = {
  idle: 'small', happy: 'open', curious: 'o', listening: 'soft', thinking: 'flat', soft: 'soft', calm: 'soft',
  proud: 'big', focused: 'neutral', breathing: 'neutral', packing: 'determined', sleepy: 'tiny', sleeping: 'soft', waving: 'open',
};
const BLUSH: Partial<Record<Expression, number>> = { happy: 0.85, proud: 0.85, waving: 0.8, soft: 0.5, sleeping: 0.4, calm: 0.55 };

function Eye({ x, y, r, shape }: { x: number; y: number; r: number; shape: EyeShape }) {
  const ink = PALETTE.eye;
  const stroke = { fill: 'none', stroke: ink, strokeWidth: r * 0.55, strokeLinecap: 'round' as const };
  switch (shape) {
    case 'arcs':
      return <path d={`M${x - r} ${y + r * 0.35} Q${x} ${y - r * 0.95} ${x + r} ${y + r * 0.35}`} {...stroke} />;
    case 'closed':
      return <path d={`M${x - r} ${y} Q${x} ${y + r * 0.8} ${x + r} ${y}`} {...stroke} />;
    case 'gentle':
      // Lower lids raised: the top half of the eye, like a soft smile.
      return (
        <g>
          <path d={`M${x - r} ${y + r * 0.15} A${r} ${r} 0 0 1 ${x + r} ${y + r * 0.15} Z`} fill={ink} />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill={PALETTE.highlight} />
        </g>
      );
    case 'half':
      // Relaxed, half-closed: the lower half of the eye under a lid that
      // curves gently (a flat lid reads as unimpressed, which a companion
      // must never look).
      return (
        <g>
          <path d={`M${x - r * 0.95} ${y} Q${x} ${y + r * 0.35} ${x + r * 0.95} ${y} A${r * 0.95} ${r * 0.95} 0 0 1 ${x - r * 0.95} ${y} Z`} fill={ink} />
          <path d={`M${x - r * 1.15} ${y - r * 0.1} Q${x} ${y + r * 0.3} ${x + r * 1.15} ${y - r * 0.1}`} {...stroke} strokeWidth={r * 0.32} />
        </g>
      );
    default: {
      const big = shape === 'wide' ? 1.15 : 1;
      const dx = shape === 'wide' ? -r * 0.12 : 0;
      const dy = shape === 'up' ? -r * 0.35 : shape === 'down' ? r * 0.3 : shape === 'wide' ? -r * 0.12 : 0;
      return (
        <g>
          <circle cx={x + dx} cy={y + dy} r={r * big} fill={ink} />
          <circle cx={x + dx - r * 0.32} cy={y + dy - r * 0.34} r={r * 0.34 * big} fill={PALETTE.highlight} />
        </g>
      );
    }
  }
}

function Mouth({ x, y, w, r, shape }: { x: number; y: number; w: number; r: number; shape: MouthShape }) {
  const ink = PALETTE.eye;
  const stroke = { fill: 'none', stroke: ink, strokeWidth: Math.max(2.2, r * 0.42), strokeLinecap: 'round' as const };
  switch (shape) {
    case 'open':
    case 'big': {
      const k = shape === 'big' ? 1.15 : 1;
      const half = (w / 2) * k;
      return (
        <g>
          <path d={`M${x - half} ${y} Q${x} ${y + w * 0.85 * k} ${x + half} ${y} Z`} fill={ink} />
          <ellipse cx={x} cy={y + w * 0.38 * k} rx={half * 0.45} ry={w * 0.13 * k} fill={PALETTE.tongue} />
        </g>
      );
    }
    case 'o':
      return <ellipse cx={x} cy={y + 2} rx={w * 0.16} ry={w * 0.2} fill={ink} />;
    case 'tiny':
      return <ellipse cx={x} cy={y + 1} rx={w * 0.1} ry={w * 0.12} fill={ink} />;
    case 'flat':
      return <path d={`M${x - w * 0.25} ${y + 2} L${x + w * 0.25} ${y + 2}`} {...stroke} />;
    case 'neutral':
      return <path d={`M${x - w * 0.18} ${y + 2} Q${x} ${y + 4} ${x + w * 0.18} ${y + 2}`} {...stroke} />;
    case 'soft':
      return <path d={`M${x - w * 0.32} ${y} Q${x} ${y + w * 0.32} ${x + w * 0.32} ${y}`} {...stroke} />;
    case 'determined':
      return <path d={`M${x - w * 0.35} ${y + 1} Q${x - w * 0.05} ${y + w * 0.38} ${x + w * 0.4} ${y - 1}`} {...stroke} />;
    default:
      return <path d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.45} ${x + w / 2} ${y}`} {...stroke} />;
  }
}

export function Face({
  geometry: g,
  expression,
  blush,
  eyesClosed = false,
}: {
  geometry: FaceGeometry;
  expression: Expression;
  blush: string;
  // Breath sync (spec 8.4): eyes close on the in-breath and its hold, and
  // open softly on the out-breath, so the face itself shows the rhythm.
  eyesClosed?: boolean;
}) {
  const eyes = eyesClosed ? 'closed' : EYES[expression];
  return (
    <g data-part="face">
      <g data-part="cheeks" opacity={BLUSH[expression] ?? 0.6}>
        {g.cheeks.map(([cx, cy]) => (
          <ellipse key={cx} cx={cx} cy={cy} rx={g.cheekR[0]} ry={g.cheekR[1]} fill={blush} />
        ))}
      </g>
      {/* Keyed by shape so a new expression fades in (120ms) instead of snapping. */}
      <g data-part="eyes" className="cmp-eyes" key={`e-${eyes}`}>
        <g className="cmp-swap">
          <Eye x={g.left[0]} y={g.left[1]} r={g.r} shape={eyes} />
          <Eye x={g.right[0]} y={g.right[1]} r={g.r} shape={eyes} />
        </g>
      </g>
      <g data-part="mouth" key={`m-${MOUTH[expression]}`} className="cmp-swap">
        <Mouth x={g.mouth[0]} y={g.mouth[1]} w={g.mouthW} r={g.r} shape={MOUTH[expression]} />
      </g>
    </g>
  );
}
