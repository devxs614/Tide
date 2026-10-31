// Things the tour does that aren't a single tap (v2 spec 16.4): put a
// chapter in place (route and time), show every companion and a few
// themes in turn, move a task to Stuck and open Unstick for it, and put the
// look back after the low-sensory preset.
import { SPECIES } from '@/lib/companion/registry';
import { db } from '@/lib/db';
import { setDemoTime } from '@/lib/repo/demo';
import { setSettings } from '@/lib/repo/settings';
import { moveTask } from '@/lib/repo/tasks';
import { presetValues } from '@/lib/settings/presets';
import { DEMO_SETTINGS_V2 } from '@/data/demo/seedV2';

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export async function runCustom(name: string, args: Record<string, unknown> | undefined, navigate: (path: string) => void, speed: number): Promise<void> {
  switch (name) {
    case 'setupChapter': {
      // Close any open sheet first, then move time and place. The Escape
      // must not bubble: sheets hear it on the document, but the tour's own
      // controls listen on the window, where Escape means "exit the tour",
      // and a bubbling one ended every tour at its first step.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: false }));
      if (typeof args?.ts === 'number') await setDemoTime(args.ts);
      if (typeof args?.path === 'string') navigate(args.path);
      return sleep(700);
    }
    case 'cycleSpecies':
      for (const species of [...SPECIES, 'axolotl' as const]) {
        await setSettings({ 'companion.species': species, 'companion.variant': species === 'axolotl' ? 'pink' : '' });
        await sleep(600 / speed);
      }
      return;
    case 'cycleThemes':
      for (const theme of ['coralReef', 'midnightTide', 'kelpForest', 'lagoon'] as const) {
        await setSettings({ 'appearance.theme': theme });
        await sleep(700 / speed);
      }
      return;
    case 'stuckTask': {
      const task = (await db.tasks.toArray()).find((t) => t.title === args?.title && t.status !== 'done');
      if (!task) throw new Error('task not found');
      await moveTask(task.id, 'stuck');
      navigate(`/tasks?unstick=${task.id}`);
      return sleep(700);
    }
    case 'restoreCalm':
      await setSettings({ ...presetValues('calm', false), ...DEMO_SETTINGS_V2, 'motion.level': 'lively' });
      return;
  }
}
