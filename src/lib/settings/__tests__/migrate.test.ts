// The v1 → v2 settings migration (v2 spec 18.4): existing users keep their
// v1 look, new users get v2's, and nothing a person chose is undone.
import { describe, expect, it } from 'vitest';
import { settingsFromRows } from '@/lib/repo/settings';
import { shouldSaveMigration, v2MigrationPatch } from '../migrate';

const rows = (o: Record<string, unknown>) => Object.entries(o).map(([key, value]) => ({ key, value }));

describe('v2 settings migration', () => {
  it('keeps an onboarded v1 user on the Classic look and Hyperlegible font', () => {
    const s = settingsFromRows(rows({ onboarded: true }));
    expect(s['appearance.followSystem']).toBe(true);
    expect([s['appearance.lightTheme'], s['appearance.darkTheme']]).toEqual(['classic', 'classicDark']);
    expect(s['appearance.font']).toBe('hyperlegible');
  });

  it('maps light, dark and system', () => {
    expect(settingsFromRows(rows({ onboarded: true, theme: 'light' }))).toMatchObject({ 'appearance.theme': 'classic', 'appearance.followSystem': false });
    expect(settingsFromRows(rows({ onboarded: true, theme: 'dark' }))).toMatchObject({ 'appearance.theme': 'classicDark', 'appearance.followSystem': false });
    expect(settingsFromRows(rows({ onboarded: true, theme: 'system' }))).toMatchObject({ 'appearance.followSystem': true });
  });

  it('carries over reduce motion, vibration, read-aloud speed and voice', () => {
    const s = settingsFromRows(rows({ onboarded: true, reduceMotion: true, vibration: true, readAloudRate: 0.8, readAloudVoice: 'Moira' }));
    expect(s).toMatchObject({ 'motion.level': 'off', 'haptics.enabled': true, 'voice.rate': 0.8, 'voice.deviceVoiceURI': 'Moira' });
  });

  it('gives a brand-new user the v2 defaults', () => {
    expect(settingsFromRows([])).toMatchObject({ 'appearance.theme': 'lagoon', 'appearance.font': 'playful', 'motion.level': 'auto' });
  });

  it('never undoes a v2 choice, and does nothing once saved', () => {
    expect(v2MigrationPatch(rows({ onboarded: true, 'appearance.font': 'lexend' }))['appearance.font']).toBeUndefined();
    expect(v2MigrationPatch(rows({ onboarded: true, theme: 'dark', schemaVersion: 2 }))).toEqual({});
  });

  it('is only written down for people who finished onboarding', () => {
    expect(shouldSaveMigration(rows({ onboarded: true }))).toBe(true);
    expect(shouldSaveMigration(rows({ onboarded: false }))).toBe(false);
    expect(shouldSaveMigration([])).toBe(false);
    expect(shouldSaveMigration(rows({ onboarded: true, schemaVersion: 2 }))).toBe(false);
  });
});
