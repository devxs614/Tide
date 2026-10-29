// "Export my data" and "Delete everything" from Settings, plus the reset the
// demo seed uses. Export leaves out trusted contacts unless Maya ticks
// "Include contacts", because those are other people's details.
import { db, dataTables } from '../db';
import { realNow } from '../clock';
import { settingsFromRows } from './settings';

export interface ExportFile {
  app: 'Tide';
  exportedAt: string;
  version: 1;
  tables: Record<string, unknown[]>;
}

export async function exportData(includeContacts: boolean): Promise<ExportFile> {
  const tables: Record<string, unknown[]> = {};
  for (const table of dataTables()) {
    tables[table.name] = await table.toArray();
  }
  const settings = settingsFromRows(await db.settings.toArray());
  tables.settings = Object.entries({
    ...settings,
    trustedContacts: includeContacts ? settings.trustedContacts : [],
  }).map(([key, value]) => ({ key, value }));
  return { app: 'Tide', exportedAt: new Date(realNow()).toISOString(), version: 1, tables };
}

// Clears every table except settings, so preferences like text size survive.
export async function clearData(): Promise<void> {
  await db.transaction('rw', dataTables(), async () => {
    await Promise.all(dataTables().map((t) => t.clear()));
  });
}

// Removes the whole database. The caller reloads the page afterwards so
// Dexie opens a fresh, empty one.
export async function deleteEverything(): Promise<void> {
  db.close();
  await db.delete();
}
