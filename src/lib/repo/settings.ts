// Preferences, stored as key/value rows in the settings table. Defaults live
// here so a brand-new device behaves sensibly before onboarding has run.
import { db } from '../db';
import { v2MigrationPatch } from '../settings/migrate';
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

  // v2 defaults are for new users. Existing v1 users keep their look through
  // the migration in lib/settings/migrate.ts.
  schemaVersion: 0,
  'appearance.theme': 'lagoon',
  'appearance.followSystem': false,
  'appearance.lightTheme': 'lagoon',
  'appearance.darkTheme': 'midnightTide',
  'appearance.font': 'playful',
  'appearance.boldText': false,
  'appearance.density': 'comfortable',
  'appearance.roundness': 'round',
  'appearance.quadrantPalette': 'theme',
  'appearance.showQuadrantShapes': false,
  'motion.level': 'auto',
  'motion.celebrations': 'full',
  'motion.confetti': true,
  'motion.pageTransitions': true,
  'motion.companionIdle': true,
  'motion.shoreWaves': true,
  'haptics.enabled': false,
  // Sound is off until Maya turns it on (v2 spec 6.1).
  'sound.enabled': false,
  'sound.volume': 0.5,
  'sound.ui': true,
  'sound.celebrations': true,
  'sound.companion': true,
  'sound.ambience': 'none',
  'sound.ambienceVolume': 0.3,
  'voice.engine': 'auto',
  'voice.rate': 1,
  'voice.deviceVoiceURI': null,
  'voice.naturalVoice': '',
  'voice.accent': 'auto',
  'voice.autoReadAi': false,
  'voice.readCompanion': false,
  'voice.breathingCues': false,
  'privacy.naturalVoiceAllowed': true,
};

export function settingsFromRows(rows: Array<{ key: string; value: unknown }>): Settings {
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
  }
  // Until the v2 migration is saved, apply it on every read, so an existing
  // user sees their v1 look from the very first frame of v2.
  return { ...(merged as unknown as Settings), ...v2MigrationPatch(rows) };
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
