'use client';

// The Tasks tab: an "Add task" button that stays in reach, then the board.
// When Maya comes back from a strategy she chose in Unstick ("Do it first"),
// the URL carries the task id and the Unstick sheet reopens on her step.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { copy } from '@/copy/en';
import { useUnstickSheet } from '@/lib/ui';
import { Button } from '@/components/ui/button';
import { TaskBoard } from './TaskBoard';
import dynamic from 'next/dynamic';
import { WhenOpened } from '@/components/shell/WhenOpened';

const TaskForm = dynamic(() => import('./TaskForm').then((m) => m.TaskForm), { ssr: false });

export function TasksScreen({ resumeUnstickId }: { resumeUnstickId?: string }) {
  const router = useRouter();
  const { openUnstick } = useUnstickSheet();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!resumeUnstickId) return;
    openUnstick({ taskId: resumeUnstickId, resume: true });
    router.replace('/tasks');
  }, [resumeUnstickId, openUnstick, router]);

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-16 z-20 -mx-5 bg-bg/95 px-5 py-2 backdrop-blur">
        <Button onClick={() => setFormOpen(true)}>
          <Plus aria-hidden />
          {copy.tasks.addTask}
        </Button>
      </div>
      <TaskBoard />
      <WhenOpened open={formOpen}>
        <TaskForm open={formOpen} onOpenChange={setFormOpen} />
      </WhenOpened>
    </div>
  );
}
