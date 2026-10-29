// The built-in first steps for Unstick: one literal, physical step for every
// stuck reason and task type (6 × 6 = 36). This is what Maya gets when AI is
// off, slow or wrong, so every entry has to be good enough on its own.
// {task} is replaced with the task title.
import type { StuckReason, TaskType } from '@/lib/types';

export const FIRST_STEP_TABLE: Record<StuckReason, Record<TaskType, string>> = {
  dont_know_start: {
    writing: 'Open the document and type only the title.',
    studying: 'Open your notes and read only the first heading.',
    admin: 'Open the form or email and fill in only your name.',
    social: "Open the chat and type one short line. Don't send it yet.",
    chores: 'Pick up one thing and put it where it belongs.',
    other: 'Write down the very first physical action for {task}.',
  },
  too_big: {
    writing: 'Write only the first sentence of one section.',
    studying: 'Do only the first problem. Nothing else.',
    admin: 'Do only the first field or the first step.',
    social: 'Reply to only the most recent message.',
    chores: 'Do only one small area, like one shelf.',
    other: 'Pick the smallest part of {task} and do only that.',
  },
  boring: {
    writing: 'Set a 5-minute timer and write only the first paragraph.',
    studying: 'Set a 5-minute timer and do only the first part.',
    admin: 'Set a 5-minute timer and do only the first part.',
    social: 'Set a 5-minute timer and answer only the first message.',
    chores: 'Put on one song and do only the first part.',
    other: 'Set a 5-minute timer and do only the first part.',
  },
  worried_result: {
    writing: 'Write three rough bullet points. Nobody will read them.',
    studying: 'Try the first problem in pencil. Mistakes are fine.',
    admin: 'Fill in a rough draft of the form. You can fix it later.',
    social: "Write a rough reply in your notes first. Don't send it yet.",
    chores: 'Do a rough version. It does not need to be perfect.',
    other: 'Do a rough first try of {task}. Nobody will check it.',
  },
  place_noise: {
    writing: 'Put on headphones or move to a quieter spot, then open {task}.',
    studying: 'Put on headphones or move to a quieter spot, then open {task}.',
    admin: 'Put on headphones or move to a quieter spot, then open {task}.',
    social: 'Move somewhere you feel comfortable, then open the chat.',
    chores: 'Put on headphones with music you like, then start {task}.',
    other: 'Put on headphones or move to a quieter spot, then start {task}.',
  },
  no_energy: {
    writing: 'Sit down and open the document. That is enough for now.',
    studying: 'Open the book or notes to the right page. That is all.',
    admin: 'Open the email or form. That is all.',
    social: 'Open the chat and read the last message. That is all.',
    chores: 'Put one item where it belongs.',
    other: 'Sit down and get one thing you need for {task}.',
  },
};

// When Maya asks for a different step, the fallback walks down to these:
// the smallest version for her task type, then one that fits any task.
export const SMALLEST_STEP: Record<TaskType, string> = {
  writing: 'Open the document. Nothing else.',
  studying: 'Put the book or notes in front of you. Nothing else.',
  admin: 'Find the form or email. Nothing else.',
  social: 'Open the chat. Nothing else.',
  chores: 'Stand up and look at one spot. Nothing else.',
  other: 'Put what you need for {task} in front of you.',
};

export const ANY_TASK_STEP = 'Write the name of the task on a piece of paper.';
