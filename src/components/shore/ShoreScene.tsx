'use client';

// The shore itself (v2 spec 13.3): one SVG, back to front: sky (by time of
// day), sun or moon, stars at night, clouds, the far sea, three waves and
// their foam, the sand, a little dune grass, the things that washed up,
// bottles in the shallows, and the companion at home on the sand. Items are
// buttons: Tab and the arrow keys move between them, Enter opens one.
import './shore.css';
import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { copy, fill } from '@/copy/en';
import type { Placed } from '@/lib/shore/placement';
import type { ShoreItem } from '@/lib/shore/items';
import type { Bottle } from '@/lib/types';
import { SHORE_ITEMS } from '@/data/shoreItems';
import { formatLongDate } from '@/lib/time';
import { ItemArt } from './ItemArt';

export interface SceneSky {
  top: string;
  bottom: string;
  stars: boolean;
  sun: { up: boolean; t: number };
}

const STARS = Array.from({ length: 24 }, (_, i) => ({ x: (i * 137) % 380 + 5, y: (i * 61) % 180 + 10, r: i % 3 === 0 ? 1.6 : 1 }));
const WAVE = (y: number, amp: number) =>
  `M0 ${y} ${Array.from({ length: 8 }, (_, i) => `Q${i * 97.5 + 48.75} ${y - amp} ${(i + 1) * 97.5} ${y} `).join('')}V560 H0 Z`;

export function ShoreScene({
  placed,
  bottles,
  glowingBottleId,
  newIds,
  sky,
  companion,
  onSelect,
  onBottle,
  svgRef,
  showLabels = false,
}: {
  placed: Placed<ShoreItem>[];
  bottles: Bottle[];
  glowingBottleId?: string;
  newIds: string[];
  sky: SceneSky;
  companion?: ReactNode;
  onSelect: (item: ShoreItem) => void;
  onBottle: (bottle: Bottle) => void;
  svgRef?: React.Ref<SVGSVGElement>;
  // Settings → Shore: small names under each item.
  showLabels?: boolean;
}) {
  const itemRefs = useRef<Array<SVGGElement | null>>([]);
  // Reading order: top row first, left to right.
  const ordered = [...placed].sort((a, b) => Math.round(a.y / 40) - Math.round(b.y / 40) || a.x - b.x);
  const sunX = 30 + sky.sun.t * 330;
  const sunY = 230 - Math.sin(sky.sun.t * Math.PI) * 170;

  const onKey = (e: KeyboardEvent, i: number, item: ShoreItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
      return;
    }
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    itemRefs.current[(i + step + ordered.length) % ordered.length]?.focus();
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 390 560"
      preserveAspectRatio="xMidYMax slice"
      data-demo-id="shore-scene"
      role="group"
      aria-label={fill(copy.shore.sceneLabel, { n: placed.length })}
      className="shore block h-[min(62vh,560px)] w-full overflow-hidden rounded-card border-2 border-line"
    >
      <defs>
        <linearGradient id="shore-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: sky.top }} />
          <stop offset="1" style={{ stopColor: sky.bottom }} />
        </linearGradient>
      </defs>
      <rect width="390" height="560" fill="url(#shore-sky)" />
      {sky.stars &&
        STARS.map((s, i) => (
          <circle key={i} className="shore-star" cx={s.x} cy={s.y} r={s.r} fill="var(--foam)" style={{ '--twinkle': `${2 + (i % 4)}s` } as CSSProperties} />
        ))}
      <circle cx={sunX} cy={sunY} r={sky.sun.up ? 22 : 16} fill={sky.sun.up ? 'var(--accent)' : 'var(--foam)'} opacity={sky.sun.up ? 0.9 : 0.85} />
      {[
        { x: 70, y: 70, s: '110s' },
        { x: 260, y: 110, s: '140s' },
      ].map((c) => (
        <g key={c.x} className="shore-cloud" style={{ '--cloud-s': c.s } as CSSProperties} fill="var(--foam)" opacity={0.75}>
          <ellipse cx={c.x} cy={c.y} rx={34} ry={12} />
          <ellipse cx={c.x + 18} cy={c.y - 8} rx={20} ry={11} />
        </g>
      ))}
      <rect y="232" width="390" height="80" fill="var(--sea-deep)" />
      <path className="shore-wave-3" d={WAVE(246, 6)} fill="var(--sea)" opacity={0.5} />
      <path className="shore-wave-2" d={WAVE(258, 7)} fill="var(--sea)" opacity={0.7} />
      <path className="shore-wave-1" d={WAVE(272, 8)} fill="var(--sea)" opacity={0.9} />
      <path className="shore-foam" d="M0 288 Q48 282 97 288 T195 288 T292 288 T390 288" fill="none" stroke="var(--foam)" strokeWidth={4} strokeDasharray="14 6" strokeLinecap="round" />
      <path d="M0 291 Q60 283 120 290 T240 289 T390 287 V560 H0 Z" fill="var(--sand)" />
      <path d="M0 291 Q60 283 120 290 T240 289 T390 287 V302 Q200 296 0 304 Z" fill="var(--sand-shadow)" opacity={0.6} />
      {[
        [60, 360],
        [210, 420],
        [330, 500],
        [150, 520],
        [300, 340],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="var(--sand-shadow)" />
      ))}
      {[12, 372].map((x) => (
        <path key={x} className="shore-grass" d={`M${x} 312 q-2 -18 -6 -26 M${x + 4} 312 q0 -20 2 -30 M${x + 8} 312 q3 -14 8 -22`} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      ))}

      {bottles.map((b, i) => (
        <g key={b.id} transform={`translate(${250 + i * 34} ${264 + (i % 2) * 8})`}>
          <g
            className={`shore-bob ${b.id === glowingBottleId ? 'shore-glow' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={SHORE_ITEMS.bottle.name}
            onClick={() => onBottle(b)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onBottle(b))}
          >
            <ItemArt type="bottle" variant="green" />
          </g>
        </g>
      ))}

      {ordered.map((p, i) => {
        const arriving = newIds.indexOf(p.item.id);
        return (
          <g key={p.item.id} transform={`translate(${p.x} ${p.y})`}>
            <g className={arriving >= 0 ? 'shore-arrive' : undefined} style={arriving >= 0 ? ({ '--i': arriving } as CSSProperties) : undefined}>
              <g
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="shore-item"
                role="button"
                tabIndex={0}
                aria-label={fill(copy.shore.itemLabel, { name: SHORE_ITEMS[p.item.type].name, date: formatLongDate(p.item.ts) })}
                data-item-type={p.item.type}
                onClick={() => onSelect(p.item)}
                onKeyDown={(e) => onKey(e, i, p.item)}
                transform={`rotate(${p.rotate.toFixed(1)}) scale(${p.scale.toFixed(2)})`}
              >
                <circle r={20} fill="transparent" />
                <ItemArt type={p.item.type} variant={p.item.variant} />
              </g>
              {showLabels && (
                <text y={26} textAnchor="middle" fontSize={8} fontWeight={700} fill="var(--ink)" aria-hidden>
                  {SHORE_ITEMS[p.item.type].name}
                </text>
              )}
            </g>
          </g>
        );
      })}

      {companion && (
        <foreignObject x="4" y="226" width="96" height="96" data-export-skip>
          {companion}
        </foreignObject>
      )}
    </svg>
  );
}
