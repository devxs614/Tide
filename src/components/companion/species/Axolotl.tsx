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

// A gill's shape, drawn at its place and angle. v2.1 F-14: the points are
// placed here rather than with a `transform` attribute. On the Shore the
// companion sits in a foreignObject, where Chrome resolved that transform
// against the wrong viewport and the gills ended up outside the clip, so
// Lolo had none there.
type Cmd = [string, ...number[]];
function placed(cmds: Cmd[], x: number, y: number, angle: number): string {
  const a = (angle * Math.PI) / 180;
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  return cmds
    .map(([op, ...n]) => {
      const pts: string[] = [];
      for (let i = 0; i < n.length; i += 2) pts.push(`${(n[i] * cos - n[i + 1] * sin + x).toFixed(2)} ${(n[i] * sin + n[i + 1] * cos + y).toFixed(2)}`);
      return `${op}${pts.join(' ')}`;
    })
    .join(' ');
}

const GILL: Cmd[] = [['M', 0, 0], ['C', -6, -10, -6, -26, 0, -32], ['C', 6, -26, 6, -10, 0, 0], ['Z']];
const TIP: Cmd[] = [['M', 0, -20], ['C', -4, -24, -4, -30, 0, -32], ['C', 4, -30, 4, -24, 0, -20], ['Z']];
const FRONDS: Cmd[][] = [
  [['M', 0, -6], ['Q', -3, -9, -4, -13]],
  [['M', 0, -11], ['Q', 3, -14, 4, -18]],
  [['M', 0, -16], ['Q', -3, -19, -3, -22]],
];

// One feathery gill: a rounded teardrop with a darker tip. At 64px and up,
// thin frond lines show its feathery texture, and on the Shore a darker
// outline keeps it clear against the sand (companion.css turns that
// outline on there; elsewhere it has no width).
function Gill({ x, y, angle, main, tip, fronds }: { x: number; y: number; angle: number; main: string; tip: string; fronds: boolean }) {
  return (
    <g>
      <path data-gill-outline d={placed(GILL, x, y, angle)} fill={main} stroke={tip} strokeWidth={0} />
      <path d={placed(TIP, x, y, angle)} fill={tip} />
      {fronds && (
        <g fill="none" stroke={tip} strokeWidth={1.4} strokeLinecap="round" opacity={0.75}>
          {FRONDS.map((f, i) => (
            <path key={i} d={placed(f, x, y, angle)} />
          ))}
        </g>
      )}
    </g>
  );
}

// A few soft speckles on the head and body, at 64px and up.
const SPECKLES = [
  [78, 60, 2.2],
  [122, 58, 2],
  [92, 48, 1.6],
  [140, 74, 1.8],
  [86, 140, 2],
  [116, 136, 1.8],
];

export function AxolotlArt({ colors: c, expression, eyesClosed, accessory, size = 96 }: SpeciesArtProps) {
  const detail = size >= 64;
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
        {detail && SPECKLES.slice(4).map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c.shade} opacity={0.35} />)}
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
          <Gill x={40} y={70} angle={-55} main={c.accent} tip={c.shade} fronds={detail} />
          <Gill x={34} y={88} angle={-85} main={c.accent} tip={c.shade} fronds={detail} />
          <Gill x={40} y={106} angle={-115} main={c.accent} tip={c.shade} fronds={detail} />
        </g>
        <g className="axo-gills-right" style={{ transformOrigin: '158px 88px' }}>
          <Gill x={160} y={70} angle={55} main={c.accent} tip={c.shade} fronds={detail} />
          <Gill x={166} y={88} angle={85} main={c.accent} tip={c.shade} fronds={detail} />
          <Gill x={160} y={106} angle={115} main={c.accent} tip={c.shade} fronds={detail} />
        </g>
        <ellipse cx={100} cy={86} rx={68} ry={48} fill={c.main} />
        <ellipse cx={100} cy={98} rx={44} ry={26} fill={c.light} opacity={0.55} />
        {detail && SPECKLES.slice(0, 4).map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c.shade} opacity={0.35} />)}
        <Face geometry={FACE} expression={expression} blush={c.blush} eyesClosed={eyesClosed} />
        <Accessory id={accessory} attach={AT} slots={['head', 'face']} />
      </g>
      <Accessory id={accessory} attach={AT} slots={['neck', 'back']} />
    </>
  );
}
