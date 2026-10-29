// "You left off at: …" shown first when Maya comes back to a task she parked
// during a switch, so she doesn't have to remember where she was.
import { Bookmark } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import type { Task } from '@/lib/types';

export function LeftOffNote({ task }: { task: Task }) {
  if (!task.parkingNote) return null;
  return (
    <p className="flex items-start gap-2 rounded-card bg-surface-2 p-3">
      <Bookmark className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
      <span>{fill(copy.unstick.leftOff, { note: task.parkingNote })}</span>
    </p>
  );
}
