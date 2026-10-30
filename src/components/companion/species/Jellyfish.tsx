// Luma the jellyfish: a rounded bell with a lighter inner dome, wavy
// tentacles that sway, and a soft glow. Quiet, few words: the low-stimulation
// companion. Her face can be two dots or none at all, for people who find
// facial expressions confusing; then her mood shows in glow and pulse only.
// The glow is a pre-blurred radial gradient, not a live blur filter, which
// would be expensive (v2 spec 8.3). An original drawing for Tide.
import { useId } from 'react';
import { COMPANIONS } from '@/lib/companion/registry';
import { Accessory } from '../parts/Accessory';
import { Face, type FaceGeometry } from '../parts/Face';
import type { SpeciesArtProps } from './types';

const FACE: FaceGeometry = {
  left: [86, 78], right: [114, 78], r: 4.8, mouth: [100, 90], mouthW: 12,
  cheeks: [[76, 88], [124, 88]], cheekR: [6, 3.6],
};
const AT = COMPANIONS.jellyfish.attach;
const TENTACLES = [58, 74, 90, 110, 126, 142];

export function JellyfishArt({ colors: c, expression, eyesClosed, accessory, faceStyle, glow }: SpeciesArtProps) {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <defs>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" stopColor={glow.color} stopOpacity={0.75} />
          <stop offset="70%" stopColor={glow.color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={glow.color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle data-part="glow" className="jelly-glow" style={{ transformOrigin: '100px 84px' }} cx={100} cy={84} r={88} fill={`url(#glow-${id})`} opacity={glow.strength} />
      <Accessory id={accessory} attach={AT} slots={['back']} layer="back" />
      <g data-part="tail" fill="none" stroke={c.shade} strokeWidth={5} strokeLinecap="round">
        {TENTACLES.map((x, i) => (
          <path
            key={x}
            className="jelly-tentacle"
            style={{ transformOrigin: `${x}px 106px`, animationDelay: `${i * 180}ms` }}
            d={`M${x} 106 C${x - 8} 124 ${x + 8} 140 ${x} 158 C${x - 6} 168 ${x + 4} 176 ${x} ${178 - (i % 2) * 8}`}
          />
        ))}
      </g>
      <g data-part="body" className="jelly-bell" style={{ transformOrigin: '100px 104px' }}>
        <path
          d="M38 106 C38 54 70 28 100 28 C130 28 162 54 162 106 Q151 115 140 106 Q130 115 120 106 Q110 115 100 106 Q90 115 80 106 Q70 115 60 106 Q49 115 38 106 Z"
          fill={c.main}
          fillOpacity={0.92}
        />
        <path d="M58 98 C58 62 80 44 100 44 C120 44 142 62 142 98 Z" fill={c.light} opacity={0.7} />
        <ellipse cx={78} cy={52} rx={10} ry={6} fill="white" opacity={0.45} transform="rotate(-30 78 52)" />
      </g>
      <g data-part="head" className="cmp-head" style={{ transformOrigin: '100px 100px' }}>
        {faceStyle === 'dots' && <Face geometry={FACE} expression={expression} blush={c.blush} eyesClosed={eyesClosed} />}
        <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['neck', 'back']} />
    </>
  );
}
