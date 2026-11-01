// Getting a browser page into a known state for the layout audit: the demo
// workspace (Maya's seeded data) or an empty one, with the text size, font,
// theme and motion we want. Settings are written straight into the app's
// IndexedDB and the page reloads, so the audit runs against the real
// production build with no test-only hooks in the app.
import type { Page } from '@playwright/test';

export type Workspace = 'demo' | 'empty';

export interface Prefs {
  textScale: number;
  font: 'playful' | 'hyperlegible' | 'lexend';
  theme: string;
  bold: boolean;
  spacing: boolean;
}

export const DEFAULT_PREFS: Prefs = { textScale: 1, font: 'playful', theme: 'lagoon', bold: false, spacing: false };

const dbName = (ws: Workspace) => (ws === 'demo' ? 'tide-demo' : 'tide');

// Wait until the app itself has created its database: opening one that
// doesn't exist yet would create an empty one that Dexie can't upgrade.
async function waitForDb(page: Page, name: string, needKey?: string) {
  await page.waitForFunction(
    async ({ name, needKey }) => {
      const list = await indexedDB.databases();
      if (!list.some((d) => d.name === name)) return false;
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(name);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      try {
        if (!db.objectStoreNames.contains('settings')) return false;
        if (!needKey) return true;
        const row = await new Promise<unknown>((res) => {
          const req = db.transaction('settings').objectStore('settings').get(needKey);
          req.onsuccess = () => res(req.result);
          req.onerror = () => res(undefined);
        });
        return !!row;
      } finally {
        db.close();
      }
    },
    { name, needKey },
    { timeout: 20_000, polling: 250 },
  );
}

export async function writeSettings(page: Page, ws: Workspace, values: Record<string, unknown>) {
  await page.evaluate(
    async ({ name, values }) => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(name);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      for (const [key, value] of Object.entries(values)) store.put({ key, value });
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    },
    { name: dbName(ws), values },
  );
}

export function prefValues(p: Prefs): Record<string, unknown> {
  return {
    textScale: p.textScale,
    'motion.level': 'off',
    reduceMotion: false,
    'appearance.theme': p.theme,
    'appearance.followSystem': false,
    'appearance.font': p.font,
    'appearance.boldText': p.bold,
    extraSpacing: p.spacing,
  };
}

// Opens a workspace in this page (and its browser context): the demo one is
// seeded by the app itself through /?demo=explore; the empty one is marked
// as set up, with a companion so its bubble can be audited.
export async function openWorkspace(page: Page, base: string, ws: Workspace) {
  await page.addInitScript((demo: boolean) => {
    if (demo) window.localStorage.setItem('tide.workspace', 'demo');
    else window.localStorage.removeItem('tide.workspace');
    // The companion greets once per part of the day; the audit wants to see
    // that bubble on every visit.
    for (const key of Object.keys(window.localStorage)) if (key.startsWith('tide-greeted-')) window.localStorage.removeItem(key);
  }, ws === 'demo');
  if (ws === 'demo') {
    await page.goto(`${base}/?demo=explore`);
    await waitForDb(page, 'tide-demo', 'onboarded');
  } else {
    await page.goto(`${base}/onboarding`);
    await waitForDb(page, 'tide');
    await writeSettings(page, 'empty', {
      onboarded: true,
      // Marks a v2 person, so the v1 look migration leaves the theme alone.
      schemaVersion: 2,
      'whatsNew.seen': true,
      'companion.species': 'axolotl',
      'today.companionCardDismissed': true,
      name: 'Alex',
    });
  }
}

export async function applyPrefs(page: Page, ws: Workspace, prefs: Prefs) {
  await writeSettings(page, ws, prefValues(prefs));
}

// Fonts and the lazily loaded pieces of a screen settle before measuring.
export async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(350);
}
