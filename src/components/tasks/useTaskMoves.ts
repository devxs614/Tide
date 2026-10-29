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

export function useTaskMoves() {
  const { openUnstick } = useUnstickSheet();

  return useCallback(
    async (taskId: string, status: TaskStatus, index?: number) => {
      const before = await getTask(taskId);
      if (!before) return;
      await moveTask(taskId, status, index);
      if (before.status === status) return;
      if (status === 'done') toast(copy.tasks.doneToast);
      else if (status === 'stuck') openUnstick({ taskId });
      else toast(fill(copy.tasks.movedToast, { status: copy.tasks.statuses[status] }));
    },
    [openUnstick],
  );
}
