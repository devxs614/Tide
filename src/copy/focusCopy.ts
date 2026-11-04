// Words for the Focus screen and its outcome sheet, moved out of en.ts in
// v2.3: Today never shows them, and en.ts loads with Today's first page.
import type { ModeText } from '@/copy/en';
import type { FocusOutcome } from '@/lib/types';

export const focusCopy = {
  chooseLength: 'How long?',
  minutesOption: '{n} min',
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  end: 'End',
  endEarly: "I'm done early",
  timeLeft: '{time} left',
  paused: 'Paused',
  firstStep: 'First step',
  timerLabel: 'Focus timer',
  progressLabel: 'Time passed in this block',
  finished: 'Time is up.',
  howDidItGo: 'How did it go?',
  outcomes: {
    got_going: 'Got going',
    a_little: 'A little',
    didnt_start: "Didn't start",
  } satisfies Record<FocusOutcome, string>,
  didntStart: {
    gentle: "That's useful to know. Want a smaller step?",
    direct: 'Okay. Smaller step?',
    literal: 'This is useful information. You can try a smaller step now or later.',
  } satisfies ModeText,
  smallerStep: 'Smaller step',
  rewardHint: 'You could take: {reward}.',
  saved: 'Saved. Nice work showing up.',
  backToTasks: 'Back to tasks',
  taskMissing: 'This task is no longer on your list.',
} as const;
