// Every screen and open state the layout audit visits (v2.1 spec 4.3), and
// how to get there: a route, the workspace it needs, and the taps that open
// a sheet or make the companion speak. Taps use the same data-demo-id hooks
// as the guided tour, so the audit and the tour keep each other honest.
import type { Page } from '@playwright/test';
import { writeSettings, type Workspace } from './prepare.ts';

export interface AuditState {
  id: string;
  route: string | ((page: Page) => Promise<string>);
  ws: Workspace;
  open?: (page: Page) => Promise<void>;
  // Runs before the route loads (resetting a wrap, choosing an onboarding step).
  before?: (page: Page) => Promise<void>;
}

// Keep in sync with SECTIONS in src/lib/settings/catalog.ts; a unit test
// (src/test/auditStates.test.ts) fails if a section is missing here.
export const SETTINGS_SECTIONS = [
  'profile', 'companion', 'appearance', 'motion', 'sound', 'voice', 'language', 'checkin', 'day',
  'focus', 'patterns', 'shore', 'privacy', 'people', 'shortcuts', 'demo', 'about',
];

const demo = (id: string) => `[data-demo-id="${id}"]`;
const click = async (page: Page, selector: string) => {
  await page.locator(selector).first().click({ timeout: 8000 });
  await page.waitForTimeout(400);
};

// The demo's "now" is Thursday, November 5; these jump its clock.
const setDemoTime = (page: Page, h: number, m: number) =>
  page.evaluate(async ({ h, m }) => {
    const base = new Date(2026, 10, 5, h, m).getTime();
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open('tide-demo');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ key: 'demoClock', value: { base, startedAt: Date.now() } });
    await new Promise<void>((res) => (tx.oncomplete = () => res()));
    db.close();
  }, { h, m });

const resetTodayWrap = (page: Page) =>
  page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open('tide-demo');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = db.transaction('dayWraps', 'readwrite');
    tx.objectStore('dayWraps').delete('2026-11-05');
    await new Promise<void>((res) => (tx.oncomplete = () => res()));
    db.close();
  });

const firstTaskId = (page: Page) =>
  page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open('tide-demo');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tasks = await new Promise<Array<{ id: string; status: string }>>((res) => {
      const req = db.transaction('tasks').objectStore('tasks').getAll();
      req.onsuccess = () => res(req.result);
    });
    db.close();
    return (tasks.find((t) => t.status === 'not_started') ?? tasks[0]).id;
  });

const wrapStep = (n: number): AuditState => ({
  id: `wrap:step${n}`,
  route: '/wrap',
  ws: 'demo',
  before: async (page) => {
    await setDemoTime(page, 21, 0);
    await resetTodayWrap(page);
  },
  open: async (page) => {
    if (n === 1) return;
    await click(page, demo('wrap-start'));
    for (let i = 2; i < n; i++) await click(page, demo('wrap-skip'));
  },
});

const onboardingStep = (n: number): AuditState => ({
  id: `onboarding:step${n}`,
  route: '/onboarding',
  ws: 'empty',
  before: (page) => writeSettings(page, 'empty', { onboarded: false, 'onboarding.step': n }),
});

const openCheckIn = async (page: Page) => {
  await click(page, demo('fab-checkin'));
  await page.locator(demo('checkin-text')).first().fill('Tired and behind on the lab report. Annoyed at myself.');
};

const openTaskDetail = (page: Page) => click(page, '[data-demo-id^="task-open-"]:visible');

export const STATES: AuditState[] = [
  // Main screens with Maya's data.
  { id: 'today', route: '/', ws: 'demo' },
  { id: 'today:empty', route: '/', ws: 'empty' },
  { id: 'tasks', route: '/tasks', ws: 'demo' },
  { id: 'toolkit', route: '/toolkit', ws: 'demo' },
  { id: 'patterns', route: '/patterns', ws: 'demo' },
  { id: 'shore', route: '/shore', ws: 'demo' },
  { id: 'shore:collection', route: '/shore/collection', ws: 'demo' },
  { id: 'companion', route: '/companion', ws: 'demo' },
  { id: 'focus', route: async (page) => `/focus/${await firstTaskId(page)}`, ws: 'demo' },
  { id: 'support', route: '/support', ws: 'demo' },
  { id: 'proof', route: '/proof', ws: 'demo' },
  { id: 'demo-launcher', route: '/demo', ws: 'empty' },
  { id: 'settings', route: '/settings', ws: 'demo' },
  ...SETTINGS_SECTIONS.map((s): AuditState => ({ id: `settings:${s}`, route: `/settings/${s}`, ws: 'demo' })),
  ...[1, 3, 8, 9, 11].map(wrapStep),
  ...[1, 3, 6, 7, 10].map(onboardingStep),

  // Open sheets.
  { id: 'sheet:checkin1', route: '/', ws: 'demo', open: openCheckIn },
  {
    id: 'sheet:checkin2',
    route: '/',
    ws: 'demo',
    open: async (page) => {
      await openCheckIn(page);
      await click(page, demo('checkin-next'));
      await page.locator('[role="checkbox"]').first().waitFor({ timeout: 10_000 });
    },
  },
  {
    id: 'sheet:checkin4',
    route: '/',
    ws: 'demo',
    open: async (page) => {
      await openCheckIn(page);
      await click(page, demo('checkin-next'));
      await page.locator('[role="checkbox"]').first().click({ timeout: 10_000 });
      await click(page, demo('checkin-next'));
      await click(page, demo('checkin-skip'));
    },
  },
  {
    id: 'sheet:daymode',
    route: '/',
    ws: 'demo',
    open: async (page) => {
      await openCheckIn(page);
      await click(page, demo('checkin-next'));
      await page.locator('[role="checkbox"]').first().click({ timeout: 10_000 });
      await click(page, demo('checkin-next'));
      await click(page, demo('checkin-skip'));
      await click(page, demo('need-adjust'));
    },
  },
  {
    id: 'sheet:unstick',
    route: '/tasks',
    ws: 'demo',
    open: async (page) => {
      // On a phone the board shows one column at a time.
      const stuck = page.locator('button:has-text("I\'m stuck"):visible');
      if ((await stuck.count()) === 0) await click(page, 'button:has-text("In progress"):visible');
      await stuck.first().click({ timeout: 8000 });
      await page.waitForTimeout(400);
    },
  },
  { id: 'sheet:taskform', route: '/tasks', ws: 'demo', open: (page) => click(page, 'button:has-text("Add task")') },
  // v2.1 F-03: a task's details, its edit form and the delete question.
  { id: 'sheet:taskdetail', route: '/tasks', ws: 'demo', open: openTaskDetail },
  {
    id: 'sheet:taskedit',
    route: '/tasks',
    ws: 'demo',
    open: async (page) => {
      await openTaskDetail(page);
      await click(page, demo('task-detail-edit'));
    },
  },
  {
    id: 'dialog:taskdelete',
    route: '/tasks',
    ws: 'demo',
    open: async (page) => {
      await openTaskDetail(page);
      await click(page, demo('task-detail-delete'));
    },
  },
  { id: 'sheet:eventform', route: '/', ws: 'demo', open: (page) => click(page, 'button:has-text("Add an event")') },
  {
    id: 'sheet:bridge',
    route: '/',
    ws: 'demo',
    before: (page) => setDemoTime(page, 16, 41),
    open: (page) => click(page, demo('bridge-get-ready')),
  },

  // The companion speaking in its different places.
  { id: 'bubble:shore', route: '/shore', ws: 'demo', open: (page) => click(page, '[data-companion-placement="shore"] button') },
  { id: 'bubble:studio', route: '/companion', ws: 'demo', open: (page) => click(page, demo('companion-hero')) },
  {
    // The companion joins when the block starts, saying "let's start".
    id: 'bubble:focus',
    route: async (page) => `/focus/${await firstTaskId(page)}`,
    ws: 'demo',
    open: (page) => click(page, demo('focus-start')),
  },
  { id: 'bubble:today', route: '/', ws: 'demo' },
  { id: 'bubble:breathing', route: '/toolkit/c-box?context=toolkit', ws: 'demo' },
  { id: 'bubble:checkin', route: '/', ws: 'demo', open: (page) => click(page, demo('fab-checkin')) },
];
