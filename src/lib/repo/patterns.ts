// "Not true for me": the patterns Maya has dismissed. The pattern engine
// skips any key stored here, so a dismissed pattern stays gone across reloads
// until she clears her data.
import { db } from '../db';
import { now } from '../clock';

export async function dismissPattern(key: string, reason?: string): Promise<void> {
  await db.dismissedPatterns.put({ key, ts: now(), reason });
}

export async function dismissedKeys(): Promise<Set<string>> {
  const rows = await db.dismissedPatterns.toArray();
  return new Set(rows.map((r) => r.key));
}
