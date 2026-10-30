// Zip the gecko: a friendly leopard-gecko-like lizard with a big round head,
// large round eyes (never slit-eyed), soft spots, round toe pads and a thick
// banded tail that curls. Upbeat and practical: one small, sticky step.
// Signature idle: tail curl, a quick blink, a little climb. Focus: writing
// with a tiny pencil. Bridge: a little suitcase. Original for Tide.
import { COMPANIONS } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';
import { Accessory } from '../parts/Accessory';
import { Face, type FaceGeometry } from '../parts/Face';
import type { SpeciesArtProps } from './types';

const FACE: FaceGeometry = {
  left: [80, 70], right: [120, 70], r: 10, mouth: [100, 94], mouthW: 30,
  cheeks: [[66, 88], [134, 88]], cheekR: [8, 5],
};
const AT = COMPANIONS.gecko.attach;

function Toe({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g fill={fill}>
      <circle cx={x - 6} cy={y} r={3.4} />
      <circle cx={x} cy={y + 2} r={3.4} />
      <circle cx={x + 6} cy={y} r={3.4} />
    </g>
  );
}

export function GeckoArt({ colors: c, expression, eyesClosed, accessory }: SpeciesArtProps) {
  const focused = expression === 'focused';
  const packing = expression === 'packing';
  return (
    <>
      <Accessory id={accessory} attach={AT} slots={['back']} layer="back" />
      {packing && (
        <g data-part="prop">
          <rect x={54} y={170} width={92} height={22} rx={6} fill={PALETTE.suitcase} />
          <rect x={90} y={164} width={20} height={8} rx={3} fill="none" stroke={PALETTE.suitcase} strokeWidth={3} />
        </g>
      )}
      <g data-part="tail" className="cmp-tail gecko-tail" style={{ transformOrigin: '124px 168px' }}>
        <path d="M122 168 C156 176 176 156 166 138 C158 126 140 132 144 146" fill="none" stroke={c.main} strokeWidth={18} strokeLinecap="round" />
        <path d="M150 170 L156 158 M164 156 L172 150 M160 138 L168 132" stroke={c.accent} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      </g>
      <g data-part="body" className="gecko-climb">
        <path d="M100 104 C134 104 146 150 128 172 C116 186 84 186 72 172 C54 150 66 104 100 104 Z" fill={c.main} />
        <ellipse cx={100} cy={150} rx={20} ry={22} fill={c.light} />
        <g fill={c.accent} opacity={0.75}>
          <circle cx={78} cy={130} r={4} />
          <circle cx={122} cy={128} r={4.5} />
          <circle cx={116} cy={164} r={3.5} />
          <circle cx={82} cy={164} r={3} />
        </g>
        <Toe x={70} y={184} fill={c.shade} />
        <Toe x={130} y={184} fill={c.shade} />
      </g>
      {focused && (
        <g data-part="prop" className="gecko-write">
          <rect x={76} y={152} width={48} height={30} rx={3} fill={PALETTE.page} />
          <path d="M82 162 L114 162 M82 170 L106 170" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" />
          <rect className="gecko-pencil" style={{ transformOrigin: '118px 168px' }} x={112} y={140} width={6} height={30} rx={2} fill={PALETTE.pencil} transform="rotate(20 115 155)" />
        </g>
      )}
      <g data-part="limbs">
        <ellipse cx={74} cy={136} rx={8} ry={12} fill={c.shade} transform="rotate(20 74 136)" />
        <g className="cmp-wave-limb" style={{ transformOrigin: '122px 124px' }}>
          <ellipse cx={126} cy={136} rx={8} ry={12} fill={c.shade} transform="rotate(-20 126 136)" />
          <Toe x={130} y={148} fill={c.shade} />
        </g>
      </g>
      <g data-part="head" className="cmp-head" style={{ transformOrigin: '100px 110px' }}>
        <circle cx={100} cy={74} r={44} fill={c.main} />
        <g fill={c.accent} opacity={0.7}>
          <circle cx={74} cy={46} r={4} />
          <circle cx={126} cy={44} r={3.5} />
          <circle cx={100} cy={36} r={3} />
        </g>
        <Face geometry={FACE} expression={expression} blush={c.blush} eyesClosed={eyesClosed} />
        <path className="gecko-lick" d="M100 98 Q112 100 118 84" fill="none" stroke={PALETTE.tongue} strokeWidth={4} strokeLinecap="round" opacity={0} />
        <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['neck', 'back']} />
    </>
  );
}
