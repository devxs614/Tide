// Backups and settings files (v2 spec 15.5, 21.2): export → import gives
// the same data back; a broken file changes nothing; settings files keep
// good values and report bad ones.
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { DEFAULT_SETTINGS } from '@/lib/repo/settings';
import { resetApp } from '@/test/utils';
import { exportData } from './data';
import { exportSettingsFile, parseBackup, parseSettingsFile, restoreBackup } from './backup';
import { addTask } from './tasks';
import { createCheckIn } from './checkins';
import { writeBottle } from './bottles';

beforeEach(async () => {
  await resetApp();
});

describe('backups', () => {
  it('round-trips: export, delete, import, same data', async () => {
    await addTask({ title: 'Essay', type: 'writing', energyCost: 2 });
    await createCheckIn({ emotions: ['calm'], energy: 1, pleasantness: 2, aiUsed: false });
    await writeBottle('Breathe first.');
    const file = JSON.parse(JSON.stringify(await exportData(false)));
    await db.tasks.clear();
    await db.bottles.clear();
    const parsed = parseBackup(file)!;
    expect(parsed.counts).toMatchObject({ tasks: 1, checkins: 1, bottles: 1 });
    expect(await restoreBackup(parsed)).toBe(true);
    expect((await db.tasks.toArray())[0].title).toBe('Essay');
    expect((await db.bottles.toArray())[0].text).toBe('Breathe first.');
  });

  it('refuses a broken file before touching anything', async () => {
    await addTask({ title: 'Keep me', type: 'admin', energyCost: 1 });
    expect(parseBackup({ app: 'Tide', tables: { tasks: [{ title: 'no id' }] } })).toBeNull();
    expect(parseBackup({ hello: 'world' })).toBeNull();
    expect(await db.tasks.count()).toBe(1);
  });

  it('restores the previous data if the replace fails', async () => {
    await addTask({ title: 'Keep me', type: 'admin', energyCost: 1 });
    const bad = { tables: { tasks: [{ id: 'a' }, { id: 'a' }] }, settings: {}, counts: {} };
    expect(await restoreBackup(bad)).toBe(false);
    expect((await db.tasks.toArray()).map((t) => t.title)).toEqual(['Keep me']);
  });
});

describe('settings files', () => {
  it('exports and reads back, ignoring unknown keys and reporting bad values', () => {
    const file = JSON.parse(JSON.stringify(exportSettingsFile({ ...DEFAULT_SETTINGS, 'appearance.theme': 'sandbar' })));
    expect(parseSettingsFile(file)?.values['appearance.theme']).toBe('sandbar');
    const result = parseSettingsFile({ kind: 'settings', settings: { 'motion.level': 'wild', 'sound.enabled': true, extra: 1 } });
    expect(result).toEqual({ values: { 'sound.enabled': true }, invalid: ['motion.level'] });
    expect(parseSettingsFile({ kind: 'data' })).toBeNull();
  });
});
