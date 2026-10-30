// Messages in a bottle (v2 spec 13.7): a kind note Maya writes to herself
// for a hard day. A bottle surfaces once it's a day old, only when today's
// latest check-in is Ebb or Surge, and only one a day (the oldest). Opening
// it, she keeps it on her shore (a bottle win) or lets it drift; it's never
// deleted.
import { db } from '../db';
import { now } from '../clock';
import { DAY, toISODate } from '../time';
import type { Bottle } from '../types';
import { addWin } from './wins';

export async function writeBottle(text: string, fromWrapDate?: string): Promise<Bottle> {
  const bottle: Bottle = { id: crypto.randomUUID(), ts: now(), text: text.trim().slice(0, 280), ...(fromWrapDate && { fromWrapDate }) };
  await db.bottles.add(bottle);
  return bottle;
}

export async function getEligibleBottle(nowTs: number): Promise<Bottle | null> {
  const today = toISODate(nowTs);
  const all = await db.bottles.toArray();
  const sameDay = (ts?: number) => ts !== undefined && toISODate(ts) === today;
  // One a day: today's bottle stays until it's opened, and once one has been
  // opened today, no other surfaces.
  const surfaced = all.find((b) => sameDay(b.surfacedAt) && !b.openedAt);
  if (surfaced) return surfaced;
  if (all.some((b) => sameDay(b.openedAt) || sameDay(b.surfacedAt))) return null;
  const latest = await db.checkins.where('ts').belowOrEqual(nowTs).reverse().filter((c) => !c.safetyTriggered).first();
  if (!latest || toISODate(latest.ts) !== today || (latest.quadrant !== 'ebb' && latest.quadrant !== 'surge')) return null;
  return all.filter((b) => !b.openedAt && !b.releasedAt && b.ts <= nowTs - DAY).sort((a, b) => a.ts - b.ts)[0] ?? null;
}

export async function markSurfaced(id: string): Promise<void> {
  const bottle = await db.bottles.get(id);
  if (bottle && !bottle.surfacedAt) await db.bottles.update(id, { surfacedAt: now() });
}

export async function openBottle(id: string): Promise<void> {
  await db.bottles.update(id, { openedAt: now() });
}

// Kept: it rests on the sand, and the shore gains a bottle.
export async function keepBottle(id: string, winText: string): Promise<void> {
  await db.transaction('rw', db.bottles, db.wins, async () => {
    const bottle = await db.bottles.get(id);
    if (!bottle || bottle.kept) return;
    await db.bottles.update(id, { kept: true, openedAt: bottle.openedAt ?? now() });
    await addWin(winText, 'manual', id, 'bottle');
  });
}

// Let it drift: it floats away, and the note stays readable in the
// Collection under "Released notes".
export async function releaseBottle(id: string): Promise<void> {
  const bottle = await db.bottles.get(id);
  if (!bottle) return;
  await db.bottles.update(id, { releasedAt: now(), openedAt: bottle.openedAt ?? now() });
}
