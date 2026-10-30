'use client';

// What happens around a status change, in one place for the board, the
// "Move to…" menu and drag and drop: finishing says so calmly, and moving a
// task to Stuck opens Unstick straight away, because that is the moment Maya
// needs a small first step. Reordering inside a column stays silent.
import { useCallback } from 'react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { getTask, moveTask } from '@/lib/repo/tasks';
import { useUnstickSheet } from '@/lib/ui';
import type { TaskStatus } from '@/lib/types';
import { emitCompanion } from '@/lib/companion/bus';
import { useCompanion } from '@/lib/companion/useCompanion';
import { companionToastIcon } from '@/components/companion/companionToastIcon';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';

export function useTaskMoves() {
  const { openUnstick } = useUnstickSheet();
  const companion = useCompanion();
  const celebrate = useCelebrate();

  return useCallback(
    async (taskId: string, status: TaskStatus, index?: number) => {
      const before = await getTask(taskId);
      if (!before) return;
      await moveTask(taskId, status, index);
      if (before.status === status) return;
      if (status === 'done') {
        // A task that was stuck, or one that costs a lot of energy, is a big
        // one (v2 spec 10.2). On a hard day the toast's title says so kindly
        // ("That counted.") and the proof-log note moves underneath.
        const hard = before.status === 'stuck' || !!before.stuckReason || before.energyCost === 3;
        emitCompanion({ type: 'taskDone', taskType: before.type, wasStuck: before.status === 'stuck' });
        const decision = await celebrate('taskDone', { tier: hard ? 'big' : 'small', title: before.title, ownToast: true });
        const face = decision?.companion ?? { expression: 'happy' as const, reaction: 'hop' as const };
        toast(decision?.toast ?? copy.tasks.doneToast, {
          description: decision?.toast ? copy.tasks.addedToProof : undefined,
          icon: companionToastIcon(companion, face.expression, face.reaction),
        });
      } else if (status === 'stuck') openUnstick({ taskId });
      else {
        if (status === 'in_progress') void celebrate('taskStarted');
        toast(fill(copy.tasks.movedToast, { status: copy.tasks.statuses[status] }));
      }
    },
    [openUnstick, companion, celebrate],
  );
}
