'use client';

// Shows whichever task sheet is open (v2.1 F-03): details, the edit form or
// the delete question. AppShell loads this file the first time one opens,
// so screens that never edit a task don't carry the code.
import { useLiveQuery } from 'dexie-react-hooks';
import { getTask } from '@/lib/repo/taskQueries';
import { closeTaskSheet, useTaskSheet } from '@/lib/taskSheets';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { TaskDetailSheet } from './TaskDetailSheet';
import { TaskForm } from './TaskForm';

function EditSheet({ id }: { id: string }) {
  const task = useLiveQuery(() => getTask(id), [id]);
  if (!task) return null;
  // Keyed by id, so opening another task starts the form fresh.
  return <TaskForm key={task.id} open task={task} onOpenChange={(open) => !open && closeTaskSheet()} />;
}

export function TaskSheets() {
  const sheet = useTaskSheet();
  if (!sheet) return null;
  if (sheet.kind === 'detail') return <TaskDetailSheet id={sheet.id} onClose={closeTaskSheet} />;
  if (sheet.kind === 'edit') return <EditSheet id={sheet.id} />;
  return <DeleteTaskDialog ids={sheet.ids} onClose={closeTaskSheet} />;
}
