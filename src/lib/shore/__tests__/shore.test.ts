// The Shore's rules (v2 spec 13, 21.2): every kind of win maps to the right
// item, placement is deterministic, never overlaps, never moves old items
// when a new one arrives, and overflows gracefully; the sky follows the time
// of day; item colors stand out on every theme's sand.
import { describe, expect, it } from 'vitest';
import { itemForWin } from '@/data/shoreItems';
import { contrastRatio } from '@/lib/theme/contrast';
import { THEMES, THEME_IDS } from '@/lib/theme/themes';
import type { Win } from '@/lib/types';
import { ITEM_OUTLINE } from '../palette';
import { placeItems, SLOTS } from '../placement';
import { skyColors, skyPhase } from '../sky';

const win = (over: Partial<Win>): Win => ({ id: 'w', ts: 1, text: 't', source: 'task', ...over });
const items = (n: number, offset = 0) => Array.from({ length: n }, (_, i) => ({ id: `item-${i + offset}`, ts: 1000 + i + offset }));
const at = (h: number, m = 0) => new Date(2026, 9, 29, h, m).getTime();

describe('item mapping', () => {
  it('maps every kind of win to its item', () => {
    const shells = { writing: 'spiral', studying: 'scallop', admin: 'cowrie', social: 'conch', chores: 'clam', other: 'moonSnail' } as const;
    for (const [taskType, type] of Object.entries(shells)) {
      expect(itemForWin(win({ kind: 'task_done', meta: { taskType: taskType as never, energyCost: 3 } }))).toEqual({ type, variant: 'deep' });
    }
    expect(itemForWin(win({ kind: 'unstuck' })).type).toBe('pebble');
    expect(itemForWin(win({ kind: 'transition', meta: { rating: 'easy' } }))).toEqual({ type: 'seaGlass', variant: 'blue' });
    expect(itemForWin(win({ kind: 'transition', meta: { rating: 'okay' } }))).toEqual({ type: 'seaGlass', variant: 'green' });
    expect(itemForWin(win({ kind: 'strategy_better', meta: { family: 'move' } }))).toEqual({ type: 'starfish', variant: 'move' });
    expect(itemForWin(win({ kind: 'manual' })).type).toBe('sandDollar');
    expect(itemForWin(win({ kind: 'wrap' })).type).toBe('driftwood');
    expect(itemForWin(win({ kind: 'bottle' })).type).toBe('bottle');
    expect(itemForWin(win({ kind: 'welcome' })).type).toBe('welcome');
  });

  it('is the same for the same win, every time', () => {
    const w = win({ id: 'abc', kind: 'unstuck' });
    expect(itemForWin(w)).toEqual(itemForWin({ ...w }));
  });
});

describe('placement', () => {
  it('is deterministic', () => {
    expect(placeItems(items(20))).toEqual(placeItems(items(20)));
  });

  it('keeps items at least 30px apart, even with all 48 spots used', () => {
    const { placed } = placeItems(items(SLOTS));
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const d = Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y);
        expect(d, `${placed[i].item.id} / ${placed[j].item.id}`).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it('never moves existing items when a new one arrives', () => {
    const before = placeItems(items(12)).placed;
    const after = placeItems(items(13)).placed;
    for (const p of before) expect(after.find((q) => q.item.id === p.item.id)).toEqual(p);
  });

  it('shows the most recent 48 and counts the rest', () => {
    const { placed, overflow } = placeItems(items(60));
    expect(placed).toHaveLength(48);
    expect(overflow).toBe(12);
    expect(placed.map((p) => p.item.ts).sort()[0]).toBe(1012);
  });
});

describe('sky', () => {
  it('follows the time of day', () => {
    expect(skyPhase(at(7), '07:00')).toBe('dawn');
    expect(skyPhase(at(12), '07:00')).toBe('day');
    expect(skyPhase(at(17, 30), '07:00')).toBe('golden');
    expect(skyPhase(at(18, 40), '07:00')).toBe('dusk');
    expect(skyPhase(at(22), '07:00')).toBe('night');
    expect(skyPhase(at(3), '07:00')).toBe('night');
  });

  it('only changes with "time"; night darkens light themes', () => {
    expect(skyColors('theme', 'dusk', false)).toMatchObject({ top: 'var(--sky-top)' });
    expect(skyColors('static', 'night', false).stars).toBe(false);
    expect(skyColors('time', 'night', false).top).toContain('color-mix');
    expect(skyColors('time', 'night', true)).toMatchObject({ top: 'var(--sky-top)', stars: true });
  });
});

describe('item colors', () => {
  it('outlines stand out at least 3:1 on every theme’s sand', () => {
    for (const id of THEME_IDS) {
      const theme = THEMES[id];
      const outline = theme.scheme === 'dark' ? ITEM_OUTLINE.onDark : ITEM_OUTLINE.onLight;
      expect(contrastRatio(outline, theme.tokens.sand), id).toBeGreaterThanOrEqual(3);
    }
  });

});
