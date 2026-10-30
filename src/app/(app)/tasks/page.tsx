// /tasks — the four-state board. `?unstick=<taskId>` reopens Unstick on the
// step Maya was given, after she comes back from "Do it first". `?new=1` (the
// "n" shortcut) opens the new-task form.
import { TasksScreen } from '@/components/tasks/TasksScreen';

export default async function TasksPage({ searchParams }: PageProps<'/tasks'>) {
  const params = await searchParams;
  const resume = typeof params.unstick === 'string' ? params.unstick : undefined;
  return <TasksScreen resumeUnstickId={resume} startNew={params.new === '1'} />;
}
