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

export async function listWins(): Promise<Win[]> {
  return db.wins.orderBy('ts').reverse().toArray();
}
