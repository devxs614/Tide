// Capi the capybara: a rounded body, a flat-topped head with a long gentle
// muzzle, small round ears, and half-closed calm eyes as the resting look.
// The calm companion for overwhelming days. Signature idle: an ear twitch, a
// slow yawn, sometimes a little citrus balanced on its head. Focus: sipping
// tea. Optional warm-water base for Today and the Shore. Original for Tide.
import { COMPANIONS, type Expression } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';
import { Accessory } from '../parts/Accessory';
import { Face, type FaceGeometry } from '../parts/Face';
import type { SpeciesArtProps } from './types';

const FACE: FaceGeometry = {
  left: [79, 70], right: [121, 70], r: 6, mouth: [100, 112], mouthW: 16,
  cheeks: [[70, 92], [130, 92]], cheekR: [8, 5],
};
const AT = COMPANIONS.capybara.attach;

// Capi's resting face is relaxed, half-closed eyes (v2 spec 8.1).
function capiExpression(e: Expression): Expression {
  return e === 'idle' ? 'calm' : e;
}

export function CapybaraArt({ colors: c, expression, eyesClosed, accessory }: SpeciesArtProps) {
  const focused = expression === 'focused';
  return (
    <>
      <Accessory id={accessory} attach={AT} slots={['back']} layer="back" />
      <g data-part="body" className="capy-body" style={{ transformOrigin: '100px 180px' }}>
        <rect x={44} y={108} width={112} height={72} rx={36} fill={c.main} />
        <rect x={56} y={170} width={20} height={16} rx={8} fill={c.shade} />
        <rect x={124} y={170} width={20} height={16} rx={8} fill={c.shade} />
      </g>
      {focused && (
        <g data-part="prop">
          <path d="M84 146 L116 146 L112 172 Q100 178 88 172 Z" fill={PALETTE.cup} stroke={c.shade} strokeWidth={2} />
          <ellipse cx={100} cy={147} rx={16} ry={4} fill={PALETTE.tea} />
          <path className="capy-steam" d="M94 138 Q90 130 96 124 M106 138 Q102 128 108 122" fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
        </g>
      )}
      <g data-part="limbs">
        <rect x={50} y={128} width={18} height={24} rx={9} fill={c.shade} />
        <g className="cmp-wave-limb" style={{ transformOrigin: '138px 130px' }}>
          <rect x={132} y={128} width={18} height={24} rx={9} fill={c.shade} />
        </g>
      </g>
      <g data-part="head" className="cmp-head" style={{ transformOrigin: '100px 120px' }}>
        <circle className="capy-ear" style={{ transformOrigin: '64px 46px' }} cx={64} cy={42} r={9} fill={c.shade} />
        <circle cx={136} cy={42} r={9} fill={c.shade} />
        <rect x={52} y={36} width={96} height={86} rx={36} fill={c.main} />
        <rect x={64} y={86} width={72} height={40} rx={20} fill={c.light} />
        <ellipse cx={100} cy={96} rx={17} ry={8} fill={c.shade} />
        <circle cx={93} cy={96} r={2.4} fill={PALETTE.eye} />
        <circle cx={107} cy={96} r={2.4} fill={PALETTE.eye} />
        <circle className="capy-citrus" cx={100} cy={30} r={9} fill={PALETTE.citrus} />
        <Face geometry={FACE} expression={capiExpression(expression)} blush={c.blush} eyesClosed={eyesClosed} />
        <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['neck', 'back']} />
    </>
  );
}
