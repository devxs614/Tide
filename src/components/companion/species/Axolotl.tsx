// Lolo the axolotl: a wide, soft head with three feathery gills on each
// side, a gentle wide smile and tiny hands. Axolotls come from Xochimilco and
// regrow what they lose ("starting over is okay"). Signature idle: gills
// wiggle and a curious tilt. Focus: reading a tiny book. Bridge: a little
// backpack. An original drawing for Tide.
import { COMPANIONS } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';
import { Accessory } from '../parts/Accessory';
import { Face, type FaceGeometry } from '../parts/Face';
import type { SpeciesArtProps } from './types';

const FACE: FaceGeometry = {
  left: [68, 86], right: [132, 86], r: 6.5, mouth: [100, 103], mouthW: 30,
  cheeks: [[56, 101], [144, 101]], cheekR: [9, 5.5],
};
const AT = COMPANIONS.axolotl.attach;

// One feathery gill: a rounded teardrop with a darker tip.
function Gill({ x, y, angle, main, tip }: { x: number; y: number; angle: number; main: string; tip: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M0 0 C-6 -10 -6 -26 0 -32 C6 -26 6 -10 0 0 Z" fill={main} />
      <path d="M0 -20 C-4 -24 -4 -30 0 -32 C4 -30 4 -24 0 -20 Z" fill={tip} />
    </g>
  );
}

export function AxolotlArt({ colors: c, expression, eyesClosed, accessory }: SpeciesArtProps) {
  const focused = expression === 'focused';
  const packing = expression === 'packing';
  return (
    <>
      <Accessory id={accessory} attach={AT} slots={['back']} layer="back" />
      {packing && <rect x={66} y={122} width={68} height={52} rx={16} fill="var(--accent)" />}
      <path data-part="tail" className="cmp-tail" style={{ transformOrigin: '130px 156px' }}
        d="M126 162 C156 174 178 150 172 124 C162 138 150 148 130 146 Z" fill={c.light} />
      <g data-part="body">
        <ellipse cx={100} cy={152} rx={36} ry={30} fill={c.main} />
        <ellipse cx={100} cy={158} rx={22} ry={18} fill={c.light} />
        <ellipse cx={82} cy={180} rx={10} ry={6} fill={c.shade} />
        <ellipse cx={118} cy={180} rx={10} ry={6} fill={c.shade} />
      </g>
      {focused && (
        <g data-part="prop" className="axo-book">
          <path d="M72 146 L100 152 L100 176 L72 170 Z" fill={PALETTE.book} />
          <path d="M128 146 L100 152 L100 176 L128 170 Z" fill={PALETTE.book} />
          <path className="axo-page" style={{ transformOrigin: '100px 160px' }} d="M100 153 L124 148 L124 168 L100 173 Z" fill={PALETTE.page} />
        </g>
      )}
      <g data-part="limbs">
        <circle cx={76} cy={160} r={7} fill={c.shade} />
        <g className="cmp-wave-limb" style={{ transformOrigin: '118px 154px' }}>
          <circle cx={124} cy={160} r={7} fill={c.shade} />
        </g>
      </g>
      {packing && (
        <g data-part="prop" fill="none" stroke="var(--accent-shadow)" strokeWidth={5} strokeLinecap="round">
          <path d="M80 126 Q76 140 80 156" />
          <path d="M120 126 Q124 140 120 156" />
        </g>
      )}
      <g data-part="head" className="cmp-head" style={{ transformOrigin: '100px 128px' }}>
        <g className="axo-gills-left" style={{ transformOrigin: '42px 88px' }}>
          <Gill x={40} y={70} angle={-55} main={c.accent} tip={c.shade} />
          <Gill x={34} y={88} angle={-85} main={c.accent} tip={c.shade} />
          <Gill x={40} y={106} angle={-115} main={c.accent} tip={c.shade} />
        </g>
        <g className="axo-gills-right" style={{ transformOrigin: '158px 88px' }}>
          <Gill x={160} y={70} angle={55} main={c.accent} tip={c.shade} />
          <Gill x={166} y={88} angle={85} main={c.accent} tip={c.shade} />
          <Gill x={160} y={106} angle={115} main={c.accent} tip={c.shade} />
        </g>
        <ellipse cx={100} cy={86} rx={68} ry={48} fill={c.main} />
        <ellipse cx={100} cy={98} rx={44} ry={26} fill={c.light} opacity={0.55} />
        <Face geometry={FACE} expression={expression} blush={c.blush} eyesClosed={eyesClosed} />
        <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['neck', 'back']} />
    </>
  );
}
