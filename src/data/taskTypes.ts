// The six kinds of task Tide knows about. The type matters because Maya's
// patterns are per type ("writing tasks start more often after a walk"), and
// the Unstick fallback table has a first step for each one.
import { BookOpen, Circle, ClipboardList, MessageCircle, PenLine, Shirt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TaskType } from '@/lib/types';

export interface TaskTypeInfo {
  id: TaskType;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const TASK_TYPES: TaskTypeInfo[] = [
  { id: 'writing', label: 'Writing', icon: PenLine, description: 'Essays, reports, emails longer than a few lines' },
  { id: 'studying', label: 'Studying', icon: BookOpen, description: 'Reading, problem sets, review' },
  { id: 'admin', label: 'Admin', icon: ClipboardList, description: 'Forms, payments, appointments, short emails' },
  { id: 'social', label: 'Social', icon: MessageCircle, description: 'Replies, group work coordination, calls' },
  { id: 'chores', label: 'Chores', icon: Shirt, description: 'Laundry, cleaning, groceries' },
  { id: 'other', label: 'Other', icon: Circle, description: 'Anything else' },
];

export const TASK_TYPE_IDS: TaskType[] = TASK_TYPES.map((t) => t.id);

export function getTaskType(id: TaskType): TaskTypeInfo {
  return TASK_TYPES.find((t) => t.id === id) ?? TASK_TYPES[TASK_TYPES.length - 1];
}
