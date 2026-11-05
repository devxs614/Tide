// Things the tour does that aren't a single tap (v2 spec 16.4): put a
// chapter in place (route and time), show every companion and three
// themes in turn, move a task to Stuck and open Unstick for it, put the
// look back after the low-sensory preset, and (v2.1) cue one refocus
// check-in during the focus block.
// Demo fix pack (D-5): every wait here stops when the step is called off
// (pause, Next, exit). The longer ones (a chapter's setup, the companion
// and theme cycles, Stuck, the restore) are safe to run again from the
// start, so a paused step restarts them; the two that act once (opening
// the check-in, cueing the nudge) act and return without waiting, so a
// pause can never catch them halfway and do them twice.
import { SPECIES } from '@/lib/companion/registry';
import { setDemoTime } from '@/lib/repo/demo';
import { setSettings } from '@/lib/repo/settings';
import { moveTask } from '@/lib/repo/tasks';
import { presetValues } from '@/lib/settings/presets';
import { DEMO_SETTINGS_V2 } from '@/data/demo/seedV2';
import { activeTasks } from '@/lib/repo/taskQueries';
import { DEMO_NUDGE_EVENT } from '@/lib/focus/nudgePlan';

import type { ThemeId } from '@/lib/theme/themes';
import { nextFrame, orAbort, wait } from './abortable';
import { waitForStable } from './stable';

// Demo fix pack, D-4. Three looks, one second each: dark, light, then the
// demo's own color theme, which stays for the rest of the tour. Fewer,
// slower changes are easier on the eyes than a fast slideshow of themes.
export const DEMO_THEME_SEQUENCE = [
  { id: 'ink', label: 'Black' }, // true black (high-contrast dark)
  { id: 'pearl', label: 'White' }, // true white (high-contrast light)
  { id: 'lagoon', label: 'Color' }, // the demo's own theme; stays on
] as const;
export const DEMO_THEME_VISIBLE_MS = 1000;

// The last look follows the demo workspace's seeded theme, so changing the
// demo's base theme later changes it here too.
export function demoThemes(): ThemeId[] {
  const base = (DEMO_SETTINGS_V2['appearance.theme'] as ThemeId | undefined) ?? 'lagoon';
  return DEMO_THEME_SEQUENCE.map((look, i) => (i === DEMO_THEME_SEQUENCE.length - 1 ? base : look.id));
}

// Until the page shows the theme and its crossfade has faded (instant at
// motion Off), so each one is fully visible for its whole second.
async function themeShown(theme: ThemeId, signal?: AbortSignal) {
  for (let t = 0; t < 90 && document.documentElement.dataset.theme !== theme; t++) await nextFrame(signal);
  await waitForStable(null, { signal });
}

export async function runCustom(
  name: string,
  args: Record<string, unknown> | undefined,
  navigate: (path: string) => void,
  speed: number,
  signal?: AbortSignal,
): Promise<void> {
  const sleep = (ms: number) => wait(ms, signal);
  switch (name) {
    case 'setupChapter': {
      // Close any open sheet first, then move time and place. The Escape
      // must not bubble: sheets hear it on the document, but the tour's own
      // controls listen on the window, where Escape means "exit the tour",
      // and a bubbling one ended every tour at its first step.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: false }));
      if (typeof args?.ts === 'number') await orAbort(setDemoTime(args.ts), signal);
      if (typeof args?.path === 'string') navigate(args.path);
      return sleep(700);
    }
    case 'cycleSpecies':
      for (const species of [...SPECIES, 'axolotl' as const]) {
        await orAbort(setSettings({ 'companion.species': species, 'companion.variant': species === 'axolotl' ? 'pink' : '' }), signal);
        await sleep(600 / speed);
      }
      return;
    // Each theme a full second after its crossfade, at every speed: the
    // team asked for exactly one second each (D-4). It used to cycle four
    // themes at 0.7 s divided by the speed.
    case 'cycleThemes':
      for (const theme of demoThemes()) {
        await orAbort(setSettings({ 'appearance.theme': theme }), signal);
        await themeShown(theme, signal);
        await sleep(DEMO_THEME_VISIBLE_MS);
      }
      return;
    case 'stuckTask': {
      const task = (await orAbort(activeTasks(), signal)).find((t) => t.title === args?.title && t.status !== 'done');
      if (!task) throw new Error('task not found');
      await orAbort(moveTask(task.id, 'stuck'), signal);
      navigate(`/tasks?unstick=${task.id}`);
      return sleep(700);
    }
    // v2.3 Item 1: the check-in may be the floating button, a tab bar item
    // or (when hidden) Today's quick action; use whichever is there.
    case 'openCheckIn': {
      const el = ['fab-checkin', 'tab-checkin', 'qa-checkin']
        .map((id) => document.querySelector<HTMLElement>(`[data-demo-id="${id}"]`))
        .find((e) => e && (e.checkVisibility?.() ?? true));
      el?.click();
      return;
    }
    case 'triggerNudge':
      window.dispatchEvent(new Event(DEMO_NUDGE_EVENT));
      return;
    case 'restoreCalm':
      await orAbort(setSettings({ ...presetValues('calm', false), ...DEMO_SETTINGS_V2, 'motion.level': 'lively' }), signal);
      return;
  }
}
