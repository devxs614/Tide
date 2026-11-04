'use client';

// "Delete this task?" (v2.1 F-03). Keep it is the default; Delete uses the
// calm notice style, never red. By default the task only disappears (its
// shells stay on the shore and patterns keep learning); the checkbox also
// removes that history, once the 10-second Undo has passed.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { getTask } from '@/lib/repo/taskQueries';
import { focusRunningTask } from '@/lib/focusRunning';
import { purgeTaskCascade, softDeleteTasks, undoDeleteTasks, UNDO_MS } from '@/lib/repo/taskEdits';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { taskEditCopy } from '@/copy/taskEditCopy';

// Deletes, offers Undo, and (when asked) removes the history after the
// window. Module-level, so it outlives the dialog that started it.
export async function deleteTasksWithUndo(ids: string[], withHistory: boolean) {
  await softDeleteTasks(ids, { withHistory });
  let undone = false;
  toast(ids.length > 1 ? fill(taskEditCopy.deletedMany, { n: ids.length }) : taskEditCopy.deleted, {
    duration: UNDO_MS,
    action: {
      label: copy.global.undo,
      onClick: () => {
        undone = true;
        void undoDeleteTasks(ids);
      },
    },
  });
  if (withHistory) {
    window.setTimeout(() => {
      if (!undone) void Promise.all(ids.map(purgeTaskCascade));
    }, UNDO_MS);
  }
}

export function DeleteTaskDialog({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const [withHistory, setWithHistory] = useState(false);
  const first = useLiveQuery(() => (ids.length === 1 ? getTask(ids[0]) : undefined), [ids]);
  const t = taskEditCopy;
  const many = ids.length > 1;
  const [endsFocus] = useState(() => ids.includes(focusRunningTask() ?? ''));
  const confirm = async () => {
    onClose();
    await deleteTasksWithUndo(ids, withHistory);
  };
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="pr-0">
          <DialogTitle>{many ? fill(t.deleteTitleMany, { n: ids.length }) : fill(t.deleteTitle, { title: first?.title ?? '' })}</DialogTitle>
          <DialogDescription>
            {many ? t.deleteBodyMany : t.deleteBody}
            {endsFocus && ` ${t.deleteEndsFocus}`}
          </DialogDescription>
        </DialogHeader>
        <CheckboxRow id="delete-history" label={t.deleteHistory} checked={withHistory} onCheckedChange={setWithHistory} />
        <DialogFooter>
          <Button variant="notice" onClick={() => void confirm()} data-demo-id="task-delete-confirm">
            {t.delete}
          </Button>
          <Button onClick={onClose} autoFocus>
            {t.keepIt}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
