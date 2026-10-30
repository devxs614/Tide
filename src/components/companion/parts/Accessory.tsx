// The 12 accessories (v2 spec 8.7), each drawn once around (0, 0) at the
// size of a companion's head, then moved, scaled and tilted onto each
// species' attachment point. Most follow the theme's accent color, so a
// scarf looks right in every theme; the rain hat, flowers and star keep their
// own colors. All of them are unlocked from day one: there's nothing to earn.
import { ACCESSORY_SLOT, type AccessoryId, type Attachment } from '@/lib/companion/registry';
import { PALETTE } from '@/lib/companion/palette';

const A = 'var(--accent)';
const AS = 'var(--accent-shadow)';

function Shape({ id, layer }: { id: Exclude<AccessoryId, 'none'>; layer: 'back' | 'front' }) {
  if (id === 'backpack') {
    // The pack peeks out behind the shoulders; the straps sit in front.
    return layer === 'back' ? (
      <g>
        <rect x={-46} y={-44} width={92} height={70} rx={22} fill={A} />
        <rect x={-26} y={-30} width={52} height={22} rx={10} fill={AS} />
      </g>
    ) : (
      <g fill="none" stroke={AS} strokeWidth={7} strokeLinecap="round">
        <path d="M-26 -20 Q-30 8 -24 28" />
        <path d="M26 -20 Q30 8 24 28" />
      </g>
    );
  }
  if (layer === 'back') return null;
  switch (id) {
    case 'scarf':
      return (
        <g>
          <rect x={-46} y={-10} width={92} height={20} rx={10} fill={A} />
          <rect x={14} y={2} width={18} height={36} rx={8} fill={AS} transform="rotate(14 23 20)" />
          <path d="M-30 -6 L-30 6 M-12 -6 L-12 6 M6 -6 L6 6" stroke={AS} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M-44 6 Q-44 -48 0 -48 Q44 -48 44 6 Z" fill={A} />
          <rect x={-47} y={-4} width={94} height={16} rx={8} fill={AS} />
          <circle cx={0} cy={-50} r={10} fill={PALETTE.highlight} />
        </g>
      );
    case 'glasses':
      return (
        <g fill="none" stroke={PALETTE.eye} strokeWidth={4}>
          <circle cx={-26} cy={0} r={16} fill={PALETTE.highlight} fillOpacity={0.18} />
          <circle cx={26} cy={0} r={16} fill={PALETTE.highlight} fillOpacity={0.18} />
          <path d="M-10 -2 Q0 -8 10 -2" strokeLinecap="round" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M-48 18 Q-50 -44 0 -44 Q50 -44 48 18" fill="none" stroke={AS} strokeWidth={8} strokeLinecap="round" />
          <rect x={-60} y={2} width={16} height={32} rx={8} fill={A} />
          <rect x={44} y={2} width={16} height={32} rx={8} fill={A} />
        </g>
      );
    case 'flowerCrown':
      return (
        <g>
          <path d="M-46 4 Q0 -22 46 4" fill="none" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" />
          {[-40, -20, 0, 20, 40].map((x, i) => {
            const y = 4 - 20 * (1 - (x / 46) ** 2) * 0.9;
            return (
              <g key={x} transform={`translate(${x} ${y})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={0} cy={-6} rx={4} ry={6} fill={PALETTE.flowers[i % 3]} transform={`rotate(${a})`} />
                ))}
                <circle r={3.2} fill={PALETTE.star} />
              </g>
            );
          })}
        </g>
      );
    case 'bowTie':
      return (
        <g fill={A}>
          <path d="M0 0 L-24 -13 Q-28 0 -24 13 Z" />
          <path d="M0 0 L24 -13 Q28 0 24 13 Z" />
          <rect x={-6} y={-7} width={12} height={14} rx={5} fill={AS} />
        </g>
      );
    case 'starClip':
      return (
        <path
          transform="translate(32 -4) scale(0.9)"
          d="M0 -14 L4 -4 L15 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-15 -4 L-4 -4 Z"
          fill={PALETTE.star}
          stroke={AS}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    case 'rainHat':
      return (
        <g>
          <ellipse cx={0} cy={6} rx={60} ry={13} fill={PALETTE.rainHatShade} />
          <path d="M-38 6 Q-38 -42 0 -44 Q38 -42 38 6 Z" fill={PALETTE.rainHat} />
          <path d="M-36 -4 Q0 -14 36 -4" fill="none" stroke={PALETTE.rainHatShade} strokeWidth={3} />
        </g>
      );
    case 'bandana':
      return (
        <g>
          <path d="M-40 -6 L40 -6 L0 28 Z" fill={A} />
          <path d="M-40 -6 L40 -6" stroke={AS} strokeWidth={6} strokeLinecap="round" />
          <circle cx={0} cy={6} r={2.5} fill={PALETTE.highlight} />
          <circle cx={-12} cy={0} r={2} fill={PALETTE.highlight} />
          <circle cx={12} cy={0} r={2} fill={PALETTE.highlight} />
        </g>
      );
    case 'sunHat':
      return (
        <g transform="scale(0.8)">
          <ellipse cx={0} cy={4} rx={64} ry={14} fill="var(--sand)" stroke="var(--sand-shadow)" strokeWidth={2} />
          <path d="M-30 4 Q-30 -36 0 -38 Q30 -36 30 4 Z" fill="var(--sand)" stroke="var(--sand-shadow)" strokeWidth={2} />
          <rect x={-31} y={-8} width={62} height={10} rx={4} fill={A} />
        </g>
      );
    default:
      return null;
  }
}

type Slot = 'head' | 'face' | 'neck' | 'back';

// Draws the accessory only if it belongs to one of these slots, so each
// species places one call inside its head (hats move with a head tilt), one
// at the neck, and one behind the body for the backpack.
export function Accessory({
  id,
  attach,
  slots,
  layer = 'front',
}: {
  id: AccessoryId;
  attach: Record<Slot, Attachment>;
  slots: Slot[];
  layer?: 'back' | 'front';
}) {
  if (id === 'none') return null;
  const slot = ACCESSORY_SLOT[id];
  if (!slots.includes(slot)) return null;
  const at = attach[slot];
  return (
    <g data-part={`accessory-${id}`} transform={`translate(${at.x} ${at.y}) rotate(${at.rotate ?? 0}) scale(${at.scale})`}>
      <Shape id={id} layer={layer} />
    </g>
  );
}
