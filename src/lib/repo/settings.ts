// Preferences, stored as key/value rows in the settings table. Defaults live
// here so a brand-new device behaves sensibly before onboarding has run.
import { db } from '../db';
import type { Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  textScale: 1,
  extraSpacing: false,
  reduceMotion: false,
  vibration: false,
  communicationMode: 'gentle',
  aiEnabled: true,
  readAloudRate: 1,
  readAloudVoice: '',
  demoMode: false,
  onboarded: false,
  trustedContacts: [],
  campusSupport: null,
  name: '',
  demoClock: null,
  dayModeBannerDismissedFor: null,
};

export function settingsFromRows(rows: Array<{ key: string; value: unknown }>): Settings {
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
  }
  return merged as unknown as Settings;
}

export async function getSettings(): Promise<Settings> {
  return settingsFromRows(await db.settings.toArray());
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}

export async function setSettings(values: Partial<Settings>): Promise<void> {
  await db.settings.bulkPut(Object.entries(values).map(([key, value]) => ({ key, value })));
}
