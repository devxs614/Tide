// Where each item lies on the sand (v2 spec 13.5). The sand is a grid of
// 8 columns × 6 rows (48 spots). Items are placed oldest first, each at a
// spot chosen from a hash of its id (the next free one if taken), with a
// little jitter, tilt and size from more hashes. So the same items always
// make the same beach, and a new item never moves the ones already there.
import { hash } from '@/data/shoreItems';

export const COLS = 8;
export const ROWS = 6;
export const SLOTS = COLS * ROWS;

// In the scene's 390 × 560 viewBox: sand from y ≈ 291 down. Columns 44px
// and rows 42px apart, with ±7px / ±6px of jitter (not the spec's ±10px
// sideways), so two neighbors are always at least 30px apart (D96).
const X0 = 41;
const DX = 44;
const Y0 = 322;
const DY = 42;
const JX = 7;
const JY = 6;

export interface Placeable {
  id: string;
  ts: number;
}

export interface Placed<T extends Placeable> {
  item: T;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

const spread = (h: number, range: number) => ((h % 1000) / 999) * 2 * range - range;

export function placeItems<T extends Placeable>(items: T[]): { placed: Placed<T>[]; overflow: number } {
  const sorted = [...items].sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
  // More than fit: show the most recent 48; the rest are in the Collection.
  const shown = sorted.slice(-SLOTS);
  const taken = new Set<number>();
  const placed = shown.map((item) => {
    let slot = hash(item.id) % SLOTS;
    while (taken.has(slot)) slot = (slot + 1) % SLOTS;
    taken.add(slot);
    const col = slot % COLS;
    const row = Math.floor(slot / COLS);
    return {
      item,
      x: X0 + col * DX + spread(hash(`${item.id}j`), JX),
      y: Y0 + row * DY + spread(hash(`${item.id}k`), JY),
      rotate: spread(hash(`${item.id}r`), 25),
      scale: 1 + spread(hash(`${item.id}s`), 0.12),
    };
  });
  return { placed, overflow: sorted.length - shown.length };
}
