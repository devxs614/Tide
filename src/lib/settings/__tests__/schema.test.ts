// The settings schema (v2 spec 15.5, 21.2): every default passes, every key
// has a rule, garbage is rejected key by key, unknown keys are ignored.
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/repo/settings';
import { SettingsSchema, validateSettings } from '../schema';

describe('SettingsSchema', () => {
  it('accepts the defaults and covers every key', () => {
    const parsed = SettingsSchema.safeParse(DEFAULT_SETTINGS);
    expect(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 3))).toBe(true);
    expect(Object.keys(SettingsSchema.shape).sort()).toEqual(Object.keys(DEFAULT_SETTINGS).sort());
  });

  it('keeps good values, lists bad ones and ignores unknown keys', () => {
    const { values, invalid } = validateSettings({
      'appearance.theme': 'sandbar',
      'motion.level': 'wild',
      'day.start': '25:00',
      textScale: 1.3,
      'not.a.setting': true,
    });
    expect(values).toEqual({ 'appearance.theme': 'sandbar', textScale: 1.3 });
    expect(invalid.sort()).toEqual(['day.start', 'motion.level']);
  });

  it('rejects something that is not a settings object', () => {
    expect(validateSettings('hello').invalid).toEqual(['settings']);
  });
});
