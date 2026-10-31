// Turning demo mode on and off, and moving the demo clock. Demo mode
// replaces everything on the device with Maya's synthetic three weeks, sets
// the persona's preferences, and starts the clock at Thursday 3:40 pm. The
// Settings screen asks before any of this, because it deletes real data.
import { db, dataTables } from '../db';
import { DEMO_START, demoClockAt } from '../clock';
import { buildDemoData } from '@/data/demo/seed';
import { clearData } from './data';
import { setSettings } from './settings';
import { currentWorkspace } from '../workspace';
import { DEMO_BOTTLE, DEMO_SETTINGS_V2, demoDayWraps } from '@/data/demo/seedV2';

// 4:36 pm: the Bridge to Calculus (4:50 pm) is already on screen when the
// demo starts, and the lab (until 4:40 pm) is still where Maya is.
export const DEMO_BRIDGE_TIME = new Date(2026, 10, 5, 16, 36).getTime();
// 4:41 pm: Calculus starts in 9 minutes, as in the rehearsal step of 14.3.
export const DEMO_JUMP_TIME = new Date(2026, 10, 5, 16, 41).getTime();

export async function loadDemoData(clockBase: number = DEMO_START): Promise<void> {
  const data = buildDemoData();
  await db.transaction('rw', dataTables(), async () => {
    await Promise.all(dataTables().map((t) => t.clear()));
    await db.checkins.bulkAdd(data.checkins);
    await db.tasks.bulkAdd(data.tasks);
    await db.events.bulkAdd(data.events);
    await db.focusBlocks.bulkAdd(data.focusBlocks);
    await db.strategyUses.bulkAdd(data.strategyUses);
    await db.transitions.bulkAdd(data.transitions);
    await db.wins.bulkAdd(data.wins);
    await db.rewards.bulkAdd(data.rewards);
  });
  await setSettings({
    demoMode: true,
    demoClock: demoClockAt(clockBase),
    onboarded: true,
    name: 'Maya',
    communicationMode: 'gentle',
    // Clearly fake number; the persona is fictional.
    trustedContacts: [{ id: 'demo-contact-sofi', name: 'Sofi (roommate)', method: 'phone', value: '+52 81 0000 0000' }],
    campusSupport: { name: 'Student Wellbeing Center' },
    dayModeBannerDismissedFor: null,
  });
}

export async function leaveDemo(): Promise<void> {
  await clearData();
  await setSettings({
    demoMode: false,
    demoClock: null,
    name: '',
    trustedContacts: [],
    campusSupport: null,
    dayModeBannerDismissedFor: null,
  });
}

// Moves the demo clock without touching the data (rehearsal only).
export async function setDemoTime(base: number): Promise<void> {
  await setSettings({ demoClock: demoClockAt(base) });
}

// The demo workspace (v2 spec 16.3): fill its own database the first time
// (or when it has no v2 data yet). The main database is never touched; this
// only ever runs while the demo database is the open one.
export async function seedDemoWorkspace(): Promise<void> {
  if ((await db.checkins.count()) > 0 && (await db.dayWraps.count()) > 0) return;
  await fillDemoWorkspace();
}

// Before every tour: back to the seed exactly, so a second run in a row
// starts from the same afternoon, with the Bridge not done yet and the
// planted patterns' numbers intact. Refuses outside the demo workspace, so
// it can never clear someone's own data.
export async function resetDemoWorkspace(): Promise<void> {
  if (currentWorkspace() !== 'demo') return;
  await fillDemoWorkspace();
}

async function fillDemoWorkspace(): Promise<void> {
  await loadDemoData(DEMO_START);
  const uses = await db.strategyUses.toArray();
  await db.transaction('rw', db.dayWraps, db.bottles, async () => {
    await db.dayWraps.bulkAdd(demoDayWraps(uses));
    await db.bottles.add(DEMO_BOTTLE);
  });
  await setSettings(DEMO_SETTINGS_V2);
}
