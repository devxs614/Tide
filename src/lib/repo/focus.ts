// Saving focus blocks. A block is stored once, when it ends, with whether the
// timer ran out and how Maya says it went. Those outcomes feed the pattern
// engine ("writing tasks get going more often after a walk").
import { db } from '../db';
import { unstuckWin } from '../wins';
import { addWin } from './wins';
import type { FocusBlock } from '../types';

export type NewFocusBlock = Omit<FocusBlock, 'id'>;

export async function saveFocusBlock(input: NewFocusBlock): Promise<FocusBlock> {
  return db.transaction('rw', db.focusBlocks, db.tasks, db.wins, async () => {
    const block: FocusBlock = { ...input, id: crypto.randomUUID() };
    await db.focusBlocks.add(block);
    const task = await db.tasks.get(block.taskId);
    // A stuck reason on the task means it went through Unstick. Getting
    // going after that earns a win, once; clearing the reason stops a second
    // block from repeating it.
    if (task && block.outcome === 'got_going' && task.stuckReason) {
      await addWin(unstuckWin(task.title), 'task', task.id);
      await db.tasks.update(task.id, { stuckReason: undefined });
    }
    return block;
  });
}
