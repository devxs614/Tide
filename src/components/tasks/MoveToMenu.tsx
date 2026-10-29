'use client';

// "Move to…" on every task card: the way to change a task's column without
// dragging, for keyboard users, screen-reader users, and anyone on a phone
// where dragging is fiddly.
import { Ellipsis } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import type { Task, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskMoves } from './useTaskMoves';

export const STATUS_ORDER: TaskStatus[] = ['not_started', 'in_progress', 'stuck', 'done'];

export function MoveToMenu({ task }: { task: Task }) {
  const move = useTaskMoves();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="quiet" size="sm" aria-label={fill(copy.tasks.moveToLabel, { title: task.title })}>
          <Ellipsis aria-hidden />
          {copy.tasks.moveTo}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{copy.tasks.moveTo}</DropdownMenuLabel>
        {STATUS_ORDER.filter((s) => s !== task.status).map((status) => (
          <DropdownMenuItem key={status} onSelect={() => void move(task.id, status)}>
            {copy.tasks.statuses[status]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
