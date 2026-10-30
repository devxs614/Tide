// Importing a backup, and exporting or importing just the settings (v2
// spec 15.5). A backup is checked table by table before anything changes,
// Maya sees a summary and chooses Replace or Cancel, and the replace runs in
// one transaction with a copy of the current data kept in memory: if
// anything goes wrong, her data is exactly as it was.
import { z } from 'zod';
import { db, dataTables } from '../db';
import { realNow } from '../clock';
import { validateSettings } from '../settings/schema';
import type { Settings } from '../types';
import { setSettings } from './settings';

// Lenient about extra fields (a newer version may add some), strict about
// what each table needs to be found again: its key.
const rowWithId = z.object({ id: z.string() }).passthrough();
const KEY_FOR: Record<string, z.ZodType> = {
  dayPlans: z.object({ date: z.string() }).passthrough(),
  dayWraps: z.object({ date: z.string() }).passthrough(),
  dismissedPatterns: z.object({ key: z.string() }).passthrough(),
};

const BackupZ = z.object({
  app: z.literal('Tide'),
  tables: z.record(z.string(), z.array(z.unknown())),
});

export interface ParsedBackup {
  tables: Record<string, unknown[]>;
  settings: Partial<Settings>;
  counts: Record<string, number>;
}

export function parseBackup(json: unknown): ParsedBackup | null {
  const file = BackupZ.safeParse(json);
  if (!file.success) return null;
  const tables: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const table of dataTables()) {
    const rows = file.data.tables[table.name] ?? [];
    const rowZ = z.array(KEY_FOR[table.name] ?? rowWithId);
    const parsed = rowZ.safeParse(rows);
    if (!parsed.success) return null;
    tables[table.name] = parsed.data;
    counts[table.name] = parsed.data.length;
  }
  const settingRows = z.array(z.object({ key: z.string(), value: z.unknown() })).safeParse(file.data.tables.settings ?? []);
  const settings = settingRows.success ? validateSettings(Object.fromEntries(settingRows.data.map((r) => [r.key, r.value]))).values : {};
  return { tables, settings, counts };
}

// Replace everything with the backup, or nothing at all.
export async function restoreBackup(backup: ParsedBackup): Promise<boolean> {
  const tables = dataTables();
  const snapshot = await Promise.all(tables.map((t) => t.toArray()));
  try {
    await db.transaction('rw', tables, async () => {
      for (const table of tables) {
        await table.clear();
        await (table as unknown as { bulkAdd: (rows: unknown[]) => Promise<unknown> }).bulkAdd(backup.tables[table.name] ?? []);
      }
    });
    await setSettings(backup.settings);
    return true;
  } catch {
    // The transaction rolls back by itself; the snapshot is the belt to its
    // braces, in case a table was replaced before the failure.
    await db.transaction('rw', tables, async () => {
      for (const [i, table] of tables.entries()) {
        await table.clear();
        await (table as unknown as { bulkAdd: (rows: unknown[]) => Promise<unknown> }).bulkAdd(snapshot[i]);
      }
    });
    return false;
  }
}

export function exportSettingsFile(settings: Settings) {
  return { app: 'tide', kind: 'settings', version: 2, exportedAt: new Date(realNow()).toISOString(), settings };
}

export function parseSettingsFile(json: unknown): { values: Partial<Settings>; invalid: string[] } | null {
  const file = z.object({ kind: z.literal('settings'), settings: z.unknown() }).safeParse(json);
  return file.success ? validateSettings(file.data.settings) : null;
}
