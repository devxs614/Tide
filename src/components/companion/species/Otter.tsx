// Pebble the otter: a round, sitting otter holding a smooth grey pebble out
// in front, like a small gift. Warm and social. Signature idle: turning the
// pebble in its paws. Focus: sorting a little pile of pebbles. Bridge:
// tucking the pebble into a pouch. An original drawing for Tide.
import { COMPANIONS } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';
import { Accessory } from '../parts/Accessory';
import { Face, type FaceGeometry } from '../parts/Face';
import type { SpeciesArtProps } from './types';

const FACE: FaceGeometry = {
  left: [82, 74], right: [118, 74], r: 6.5, mouth: [100, 99], mouthW: 16,
  cheeks: [[69, 90], [131, 90]], cheekR: [8, 5],
};
const AT = COMPANIONS.otter.attach;

export function OtterArt({ colors: c, expression, eyesClosed, accessory }: SpeciesArtProps) {
  const focused = expression === 'focused';
  const packing = expression === 'packing';
  return (
    <>
      <Accessory id={accessory} attach={AT} slots={['back']} layer="back" />
      <path data-part="tail" className="cmp-tail" style={{ transformOrigin: '138px 160px' }}
        d="M136 170 C168 172 184 152 178 136 C174 126 162 128 163 138 C164 150 154 158 136 156 Z" fill={c.shade} />
      <g data-part="body">
        <ellipse cx={100} cy={146} rx={47} ry={42} fill={c.main} />
        <ellipse cx={100} cy={154} rx={31} ry={30} fill={c.light} />
        <ellipse cx={76} cy={184} rx={15} ry={8} fill={c.shade} />
        <ellipse cx={124} cy={184} rx={15} ry={8} fill={c.shade} />
      </g>
      {packing && (
        <g data-part="prop">
          <path d="M80 150 Q100 176 120 150 Z" fill={c.shade} />
          <ellipse cx={100} cy={152} rx={12} ry={8} fill={PALETTE.pebble} />
        </g>
      )}
      {focused && (
        <g data-part="prop" className="otter-sort">
          <ellipse cx={150} cy={184} rx={10} ry={6} fill={PALETTE.pebbleShade} />
          <ellipse cx={166} cy={186} rx={8} ry={5} fill={PALETTE.pebble} />
          <ellipse cx={158} cy={177} rx={8} ry={5} fill={PALETTE.pebble} />
        </g>
      )}
      <g data-part="limbs">
        <circle cx={80} cy={132} r={9} fill={c.shade} />
        <g className="cmp-wave-limb" style={{ transformOrigin: '124px 124px' }}>
          <circle cx={120} cy={132} r={9} fill={c.shade} />
        </g>
        {/* The pebble sits in front, held out like a small gift. */}
        {!packing && (
          <g className="otter-pebble" style={{ transformOrigin: '100px 131px' }}>
            <ellipse cx={100} cy={131} rx={17} ry={12} fill={PALETTE.pebble} />
            <ellipse cx={95} cy={127} rx={6} ry={3} fill="white" opacity={0.45} />
          </g>
        )}
      </g>
      <g data-part="head" className="cmp-head" style={{ transformOrigin: '100px 110px' }}>
        <circle cx={63} cy={44} r={11} fill={c.shade} />
        <circle cx={137} cy={44} r={11} fill={c.shade} />
        <circle cx={63} cy={44} r={5} fill={c.light} />
        <circle cx={137} cy={44} r={5} fill={c.light} />
        <circle cx={100} cy={78} r={46} fill={c.main} />
        <ellipse cx={100} cy={95} rx={26} ry={18} fill={c.light} />
        <path d="M93 86 Q100 82 107 86 Q104 92 100 93 Q96 92 93 86 Z" fill={PALETTE.eye} />
        <g stroke={c.shade} strokeWidth={1.6} strokeLinecap="round">
          <path d="M76 94 L58 90 M76 98 L57 99 M77 102 L60 107" />
          <path d="M124 94 L142 90 M124 98 L143 99 M123 102 L140 107" />
        </g>
        <Face geometry={FACE} expression={expression} blush={c.blush} eyesClosed={eyesClosed} />
        <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['neck', 'back']} />
    </>
  );
}
