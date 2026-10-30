// Writing wins to the proof log. Other repo functions call addWin when
// something good happens; the Proof log screen calls it for wins Maya types
// herself. There is deliberately no function to delete a single win.
import { db } from '../db';
import { now } from '../clock';
import type { Win } from '../types';

export async function addWin(text: string, source: Win['source'], refId?: string): Promise<Win> {
  const win: Win = { id: crypto.randomUUID(), ts: now(), text: text.trim(), source, refId };
  await db.wins.add(win);
  return win;
}

// The first thing on a new shore (v2 spec 11.2): a shell that washes up when
// onboarding ends. Only one, however many times onboarding is finished.
export async function createWelcomeWin(text: string): Promise<Win | null> {
  if ((await db.wins.filter((w) => w.kind === 'welcome').count()) > 0) return null;
  const win: Win = { id: crypto.randomUUID(), ts: now(), text: text.trim(), source: 'manual', kind: 'welcome' };
  await db.wins.add(win);
  return win;
}
