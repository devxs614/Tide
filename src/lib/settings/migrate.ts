// The one-time move from v1 settings to v2 (v2 spec 18.4). Existing users
// keep exactly the look they had (Classic colors, the Hyperlegible font, no
// companion) until they choose otherwise; new users get the v2 defaults.
// It's a pure function of the stored rows, so it can run on every read
// until the result is saved, and running it twice changes nothing.
import type { Settings } from '../types';

export const SETTINGS_SCHEMA_VERSION = 2;

export function v2MigrationPatch(rows: Array<{ key: string; value: unknown }>): Partial<Settings> {
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  if (stored.get('schemaVersion') === SETTINGS_SCHEMA_VERSION) return {};
  const patch: Partial<Settings> = {};
  const existingUser = stored.get('onboarded') === true;
  const v1Theme = stored.get('theme') as Settings['theme'] | undefined;

  // A v2 key Maya already set (say, in a newer onboarding) is never undone.
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!stored.has(key)) patch[key] = value;
  };

  if (existingUser || v1Theme !== undefined) {
    const theme = v1Theme ?? 'system';
    set('appearance.lightTheme', 'classic');
    set('appearance.darkTheme', 'classicDark');
    set('appearance.followSystem', theme === 'system');
    set('appearance.theme', theme === 'dark' ? 'classicDark' : 'classic');
  }
  if (existingUser) set('appearance.font', 'hyperlegible');
  if (stored.get('reduceMotion') === true) set('motion.level', 'off');
  if (stored.has('vibration')) set('haptics.enabled', Boolean(stored.get('vibration')));
  if (typeof stored.get('readAloudRate') === 'number') set('voice.rate', stored.get('readAloudRate') as number);
  const voiceName = stored.get('readAloudVoice');
  if (typeof voiceName === 'string' && voiceName) set('voice.deviceVoiceURI', voiceName);
  return patch;
}

// Whether the migration should be written down now. Only for people who
// finished onboarding: a brand-new or just-deleted database stays empty,
// and v2 onboarding writes the schema version itself.
export function shouldSaveMigration(rows: Array<{ key: string; value: unknown }>): boolean {
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  return stored.get('onboarded') === true && stored.get('schemaVersion') !== SETTINGS_SCHEMA_VERSION;
}
