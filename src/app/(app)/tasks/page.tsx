// /tasks — the four-state board. `?unstick=<taskId>` reopens Unstick on the
// step Maya was given, after she comes back from "Do it first".
import { TasksScreen } from '@/components/tasks/TasksScreen';

export default async function TasksPage({ searchParams }: PageProps<'/tasks'>) {
  const params = await searchParams;
  const resume = typeof params.unstick === 'string' ? params.unstick : undefined;
  return <TasksScreen resumeUnstickId={resume} />;
}
