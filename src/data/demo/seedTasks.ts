// Maya's tasks for demo mode: about three weeks of finished work, then the
// board on demo day (Thursday, Nov 5) from Section 14.2. All titles are
// invented; none come from real people or the Challenge Partner.
import type { TaskStatus, TaskType } from '@/lib/types';

export interface SeedTask {
  id: string;
  title: string;
  type: TaskType;
  energy: 1 | 2 | 3;
  status: TaskStatus;
  due?: string;
  doneAt?: number;
  startedAt?: number;
}

const oct = (day: number, h: number, m = 0) => new Date(2026, 9, day, h, m).getTime();
const nov = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m).getTime();
const done = (id: string, title: string, type: TaskType, energy: 1 | 2 | 3, doneAt: number): SeedTask => ({
  id: `demo-${id}`,
  title,
  type,
  energy,
  status: 'done',
  doneAt,
});

export const HISTORY: SeedTask[] = [
  done('physics-ps3', 'Physics problem set 3', 'studying', 2, oct(16, 18, 30)),
  done('essay-outline', 'English essay outline', 'writing', 2, oct(17, 21, 40)),
  done('lab-partner', 'Reply to lab partner', 'social', 1, oct(18, 10)),
  done('sheets', 'Wash sheets', 'chores', 2, oct(18, 12, 30)),
  done('calc-ps5', 'Calculus problem set 5', 'studying', 2, oct(19, 22)),
  done('thank-you', 'Thank-you note to tutor', 'writing', 1, oct(20, 21, 50)),
  done('advising', 'Book advising appointment', 'admin', 1, oct(21, 10, 15)),
  done('prelab', 'Chemistry prelab notes', 'writing', 2, oct(21, 21, 45)),
  done('prog-lab4', 'Programming lab 4', 'studying', 2, oct(22, 20, 30)),
  done('essay-draft', 'English essay draft', 'writing', 3, oct(23, 21, 50)),
  done('desk', 'Clean desk', 'chores', 1, oct(24, 13)),
  done('group-checkin', 'Group project check-in message', 'social', 1, oct(24, 18)),
  done('physics-ps4', 'Physics problem set 4', 'studying', 2, oct(25, 20)),
  done('reflection', 'Reflection paper', 'writing', 2, oct(25, 21, 50)),
  done('rent', 'Pay rent share', 'admin', 1, oct(26, 9, 30)),
  done('calc-ps6', 'Calculus problem set 6', 'studying', 2, oct(26, 22, 10)),
  done('lab-report-2', 'Chemistry lab report 2', 'writing', 3, oct(28, 21, 55)),
  done('professor', 'Email professor about office hours', 'admin', 1, oct(30, 11)),
  done('groceries', 'Buy groceries', 'chores', 1, oct(31, 12, 10)),
  done('readme', 'Programming project README', 'writing', 2, nov(1, 21, 50)),
  done('physics-reading-3', 'Read Physics chapter 3', 'studying', 2, nov(2, 20, 15)),
];

// The board on demo day, exactly as the spec lists it. The three done ones
// also count as history ("Finished: Lab outline" on Thursday, Oct 29).
export const DEMO_BOARD: SeedTask[] = [
  { id: 'demo-lab-report', title: 'Chemistry lab report', type: 'writing', energy: 3, status: 'in_progress', due: '2026-11-06', startedAt: nov(2, 20) },
  { id: 'demo-calc-ps7', title: 'Calculus problem set 7', type: 'studying', energy: 2, status: 'not_started', due: '2026-11-06' },
  { id: 'demo-physics-4', title: 'Read Physics chapter 4', type: 'studying', energy: 2, status: 'not_started', due: '2026-11-09' },
  { id: 'demo-email-ta', title: 'Email TA about lab data', type: 'admin', energy: 1, status: 'not_started', due: '2026-11-05' },
  { id: 'demo-group-chat', title: 'Reply to group project chat', type: 'social', energy: 1, status: 'not_started' },
  { id: 'demo-laundry', title: 'Laundry', type: 'chores', energy: 2, status: 'not_started' },
  { ...done('quiz-review', 'Programming quiz review', 'studying', 2, nov(4, 20, 30)), due: '2026-11-04' },
  { ...done('phone-bill', 'Pay phone bill', 'admin', 1, nov(3, 9, 40)), due: '2026-11-03' },
  { ...done('lab-outline', 'Lab outline', 'writing', 2, oct(29, 22)), due: '2026-10-29' },
];
