'use client';

// The things that wash up on the shore (v2 spec 13.4), each a small flat
// drawing around (0, 0), about 36px across, so the scene can place, tilt and
// scale it. Fills come from lib/shore/palette.ts; the outline follows the
// theme (dark on light sand, light on dark sand), so items always stand out.
import type { ItemVariant, ShoreItemType } from '@/data/shoreItems';
import { ITEM_COLORS as C, ITEM_OUTLINE } from '@/lib/shore/palette';
import { useThemeScheme } from '@/lib/theme/useThemeScheme';

const SHELL_SHADE: Record<string, string> = C.shell;

function shade(variant: ItemVariant): string {
  return SHELL_SHADE[variant] ?? C.shell.medium;
}

export function ItemArt({ type, variant }: { type: ShoreItemType; variant: ItemVariant }) {
  const OUTLINE = useThemeScheme() === 'dark' ? ITEM_OUTLINE.onDark : ITEM_OUTLINE.onLight;
  const line = { stroke: OUTLINE, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  switch (type) {
    case 'spiral':
    case 'welcome': {
      const fill = type === 'welcome' ? 'var(--accent)' : shade(variant);
      return (
        <g>
          <path d="M-14 10 Q-18 -10 0 -16 Q16 -16 16 0 Q16 12 2 12 Q-8 12 -8 2 Q-8 -6 0 -6 Q6 -6 6 0" fill={fill} {...line} />
          {type === 'welcome' && <circle cx={11} cy={-11} r={3} fill={C.pearl} />}
        </g>
      );
    }
    case 'scallop':
      return (
        <g>
          <path d="M0 14 L-16 -4 Q0 -22 16 -4 Z" fill={shade(variant)} {...line} />
          {[-9, -3, 3, 9].map((x) => (
            <path key={x} d={`M0 13 L${x} -12`} fill="none" {...line} strokeWidth={1.5} />
          ))}
        </g>
      );
    case 'cowrie':
      return (
        <g>
          <ellipse rx={15} ry={10} fill={shade(variant)} {...line} />
          <path d="M-10 0 Q0 3 10 0" fill="none" {...line} />
          {[-6, -2, 2, 6].map((x) => (
            <path key={x} d={`M${x} -2 L${x} 2`} {...line} strokeWidth={1.2} />
          ))}
        </g>
      );
    case 'conch':
      return (
        <g>
          <path d="M-16 6 L4 -14 Q16 -10 14 4 Q8 14 -6 12 Z" fill={shade(variant)} {...line} />
          <path d="M4 -14 L8 -18 M10 -9 L15 -12" fill="none" {...line} />
          <path d="M-4 8 Q4 2 6 -6" fill="none" {...line} strokeWidth={1.5} />
        </g>
      );
    case 'clam':
      return (
        <g>
          <path d="M-16 4 Q0 -18 16 4 Q0 12 -16 4 Z" fill={shade(variant)} {...line} />
          <path d="M-12 2 Q0 -10 12 2 M-7 3 Q0 -4 7 3" fill="none" {...line} strokeWidth={1.4} />
        </g>
      );
    case 'moonSnail':
      return (
        <g>
          <circle r={13} fill={shade(variant)} {...line} />
          <path d="M0 -13 Q10 -6 6 4 Q0 10 -5 3 Q-6 -3 0 -3" fill="none" {...line} />
        </g>
      );
    case 'pebble':
      return <ellipse rx={15} ry={10} fill={(C.pebble as Record<string, string>)[variant] ?? C.pebble.grey} stroke={OUTLINE} strokeWidth={2} />;
    case 'seaGlass':
      return (
        <path
          d="M-13 -6 L-2 -12 L12 -7 L14 5 L2 12 L-12 7 Z"
          fill={(C.seaGlass as Record<string, string>)[variant] ?? C.seaGlass.blue}
          fillOpacity={0.9}
          stroke={OUTLINE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case 'starfish':
      return (
        <path
          d="M0 -16 L4 -5 L16 -5 L6 2 L10 14 L0 7 L-10 14 L-6 2 L-16 -5 L-4 -5 Z"
          fill={(C.starfish as Record<string, string>)[variant] ?? C.starfish.calm}
          stroke={OUTLINE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case 'sandDollar':
      return (
        <g>
          <circle r={14} fill={C.sandDollar} {...line} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-6} rx={1.8} ry={4} fill="none" {...line} strokeWidth={1.3} transform={`rotate(${a})`} />
          ))}
        </g>
      );
    case 'driftwood':
      return (
        <g>
          <path d="M-18 4 Q-6 -6 18 -2 L17 4 Q-4 2 -17 9 Z" fill={C.wood} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
          <path d="M-4 0 Q4 -2 10 0" fill="none" stroke={OUTLINE} strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
    case 'bottle':
      return (
        <g transform="rotate(-70)">
          <rect x={-7} y={-8} width={14} height={22} rx={5} fill={(C.bottle as Record<string, string>)[variant] ?? C.bottle.green} fillOpacity={0.85} stroke={OUTLINE} strokeWidth={2} />
          <rect x={-3.5} y={-16} width={7} height={9} rx={2} fill={(C.bottle as Record<string, string>)[variant] ?? C.bottle.green} stroke={OUTLINE} strokeWidth={2} />
          <rect x={-3} y={-19} width={6} height={4} rx={1.5} fill={C.cork} />
          <rect x={-4} y={-2} width={8} height={10} rx={1} fill={C.paper} />
        </g>
      );
    case 'pearl':
      return (
        <g>
          <circle r={8} fill={C.pearl} stroke={OUTLINE} strokeWidth={1.5} />
          <circle cx={-2.5} cy={-2.5} r={3} fill={C.pearlShine} />
        </g>
      );
    default:
      return null;
  }
}
