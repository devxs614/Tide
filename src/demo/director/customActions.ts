// Things the tour does that aren't a single tap (v2 spec 16.4): put a
// chapter in place (route and time), show every companion and a few
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

import { orAbort, wait } from './abortable';

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
    case 'cycleThemes':
      for (const theme of ['coralReef', 'midnightTide', 'kelpForest', 'lagoon'] as const) {
        await orAbort(setSettings({ 'appearance.theme': theme }), signal);
        await sleep(700 / speed);
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
