// Shelby the hermit crab: a big spiral shell, with the crab peeking out in
// front on two eye stalks, one larger claw and one smaller. Shy and careful.
// Hermit crabs change shells as they grow, which is literally a transition:
// "new shells feel strange at first, then they fit." Signature idle: peeking
// out and back in. Bridge: stepping into a new shell. Original for Tide.
import { COMPANIONS } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';
import { Accessory } from '../parts/Accessory';
import { Face, type FaceGeometry } from '../parts/Face';
import type { SpeciesArtProps } from './types';

const FACE: FaceGeometry = {
  left: [54, 84], right: [80, 82], r: 5.5, mouth: [67, 146], mouthW: 14,
  cheeks: [[50, 140], [84, 140]], cheekR: [6, 3.6],
};
const AT = COMPANIONS.hermit_crab.attach;

export function HermitCrabArt({ colors: c, expression, eyesClosed, accessory }: SpeciesArtProps) {
  const focused = expression === 'focused';
  return (
    <>
      <Accessory id={accessory} attach={AT} slots={['back']} layer="back" />
      <g data-part="shell" className="crab-shell" style={{ transformOrigin: '116px 112px' }}>
        <circle cx={116} cy={110} r={60} fill={c.main} />
        <path d="M116 110 m-38 0 a38 38 0 1 0 38 -38 a26 26 0 1 1 -26 26 a14 14 0 1 0 14 -14" fill="none" stroke={c.shade} strokeWidth={6} strokeLinecap="round" />
        <path d="M70 70 Q80 60 92 58 M150 64 Q162 74 168 88 M164 140 Q158 158 142 166" fill="none" stroke={c.light} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      </g>
      <g data-part="body" className="crab-peek" style={{ transformOrigin: '90px 150px' }}>
        <g stroke={PALETTE.crabShade} strokeWidth={4} strokeLinecap="round">
          <path d="M52 160 L40 178 M62 164 L56 182 M76 164 L80 182 M86 160 L96 178" />
        </g>
        <ellipse cx={66} cy={146} rx={32} ry={22} fill={PALETTE.crabBody} />
        <g stroke={PALETTE.crabBody} strokeWidth={5} strokeLinecap="round">
          <path d="M58 128 L54 92" />
          <path d="M74 128 L80 90" />
        </g>
        <circle cx={54} cy={86} r={8.5} fill="white" />
        <circle cx={80} cy={84} r={8.5} fill="white" />
        <g data-part="head" className="cmp-head" style={{ transformOrigin: '66px 140px' }}>
          <Face geometry={FACE} expression={expression} blush={c.blush} eyesClosed={eyesClosed} />
          <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
        </g>
        <g data-part="limbs">
          <path d="M40 150 C22 144 18 126 30 120 C38 116 46 124 42 132 C48 132 50 142 44 150 Z" fill={PALETTE.crabShade} />
          <g className="cmp-wave-limb" style={{ transformOrigin: '92px 150px' }}>
            <path d="M92 150 C104 148 108 136 102 132 C96 128 90 134 92 140 Z" fill={PALETTE.crabShade} />
          </g>
        </g>
        {focused && (
          <path className="crab-polish" style={{ transformOrigin: '100px 140px' }} d="M96 128 Q108 122 116 130 Q108 140 96 136 Z" fill={c.light} />
        )}
        <Accessory id={accessory} attach={AT} slots={['neck']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['back']} />
    </>
  );
}
