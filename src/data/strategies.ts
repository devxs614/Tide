// The regulation strategy library: 20 short things Maya can do to feel a bit
// steadier before a task or a switch. Each one has literal steps (max five,
// each under 15 words), a duration, sensory notes and the states it suits by
// default. Personal results later reorder them (see lib/strategyRank.ts).
// This list is a draft from the team's spec, to review with their partner.
import type { Quadrant, StrategyContext, StrategyFamily } from '@/lib/types';

export type ToolId =
  | 'box_breathing'
  | 'grounding_54321'
  | 'sudoku_4x4'
  | 'doodle'
  | 'walk_timer'
  | 'brain_dump'
  | 'message_template'
  | 'steps_timer';

export interface Strategy {
  id: string;
  family: StrategyFamily;
  name: string;
  summary: string;
  steps: string[];
  durationSec: number;
  sensory: {
    sound: 'none' | 'optional';
    movement: 'none' | 'light' | 'active';
    screen: 'none' | 'some' | 'full';
  };
  suits: Quadrant[];
  contexts: StrategyContext[];
  tool?: ToolId;
  template?: string;
}

const ALL: StrategyContext[] = ['unstick', 'bridge', 'toolkit'];

export const STRATEGIES: Strategy[] = [
  {
    id: 'm-walk-3',
    family: 'move',
    name: '3-minute walk',
    summary: 'A short walk to reset your body before the next thing.',
    steps: ['Put your phone in your pocket.', 'Walk anywhere.', 'Come back when it vibrates.'],
    durationSec: 180,
    sensory: { sound: 'none', movement: 'active', screen: 'none' },
    suits: ['ebb', 'surge'],
    contexts: ALL,
    tool: 'walk_timer',
  },
  {
    id: 'm-shake-20',
    family: 'move',
    name: 'Shake it out',
    summary: 'Shake your hands and feet to wake your body up.',
    steps: ['Stand up.', 'Shake your hands 10 times.', 'Shake your feet 10 times.', 'Breathe out.'],
    durationSec: 60,
    sensory: { sound: 'none', movement: 'active', screen: 'none' },
    suits: ['ebb'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 'm-stairs',
    family: 'move',
    name: 'Stairs once',
    summary: 'One floor up and down to get blood moving.',
    steps: ['Find stairs.', 'Go up and down one floor.', 'Come back.'],
    durationSec: 120,
    sensory: { sound: 'none', movement: 'active', screen: 'none' },
    suits: ['ebb'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 'm-stretch',
    family: 'move',
    name: 'Desk stretch',
    summary: 'A quick stretch you can do without leaving your seat.',
    steps: ['Reach up for 5 seconds.', 'Roll your shoulders 5 times.', 'Turn your neck slowly.'],
    durationSec: 90,
    sensory: { sound: 'none', movement: 'light', screen: 'none' },
    suits: ['ebb', 'surge'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 'm-song',
    family: 'move',
    name: 'One-song move',
    summary: 'Move however you like for the length of one song.',
    steps: ['Play one song.', 'Move in any way you like.', 'Stop when the song ends.'],
    durationSec: 210,
    sensory: { sound: 'optional', movement: 'active', screen: 'some' },
    suits: ['ebb', 'swell'],
    contexts: ['unstick', 'toolkit'],
    tool: 'steps_timer',
  },
  {
    id: 'c-box',
    family: 'calm',
    name: 'Box breathing',
    summary: 'Breathe in a slow square to settle a racing body.',
    steps: ['Breathe in for 4.', 'Hold for 4.', 'Breathe out for 4.', 'Hold for 4.', 'Repeat.'],
    durationSec: 120,
    sensory: { sound: 'none', movement: 'none', screen: 'some' },
    suits: ['surge'],
    contexts: ALL,
    tool: 'box_breathing',
  },
  {
    id: 'c-54321',
    family: 'calm',
    name: '5-4-3-2-1 senses',
    summary: 'Notice what is around you, one sense at a time.',
    steps: [
      'Name 5 things you can see.',
      'Name 4 things you can feel.',
      'Name 3 things you can hear.',
      'Name 2 things you can smell.',
      'Name 1 thing you can taste.',
    ],
    durationSec: 150,
    sensory: { sound: 'none', movement: 'none', screen: 'some' },
    suits: ['surge'],
    contexts: ALL,
    tool: 'grounding_54321',
  },
  {
    id: 'c-long-exhale',
    family: 'calm',
    name: 'Longer breath out',
    summary: 'Breathe out longer than you breathe in.',
    steps: ['Breathe in for 4.', 'Breathe out for 6.', 'Do it 8 times.'],
    durationSec: 90,
    sensory: { sound: 'none', movement: 'none', screen: 'none' },
    suits: ['surge'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 'c-quiet',
    family: 'calm',
    name: 'Quiet corner',
    summary: 'A few minutes somewhere with less noise and light.',
    steps: ['Find a quieter spot.', 'Lower the light or close your eyes.', 'Stay 3 minutes.'],
    durationSec: 180,
    sensory: { sound: 'none', movement: 'light', screen: 'none' },
    suits: ['surge'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 'c-music',
    family: 'calm',
    name: 'Low music',
    summary: 'One calm song at low volume, and nothing else.',
    steps: ['Put on one calm song at low volume.', 'Do nothing else until it ends.'],
    durationSec: 180,
    sensory: { sound: 'optional', movement: 'none', screen: 'some' },
    suits: ['surge', 'ebb'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 's-text-friend',
    family: 'connect',
    name: 'Text a friend',
    summary: 'Reach out to someone with a ready-made message.',
    steps: ['Pick a person.', 'Edit the message.', 'Copy it and send it yourself.'],
    durationSec: 120,
    sensory: { sound: 'none', movement: 'none', screen: 'full' },
    suits: ['ebb'],
    contexts: ALL,
    tool: 'message_template',
    template: 'Hey, rough afternoon. Can you send me something funny or just say hi?',
  },
  {
    id: 's-body-double',
    family: 'connect',
    name: 'Work next to someone',
    summary: 'Having someone nearby can make starting easier.',
    steps: [
      'Ask someone to sit or video-call with you.',
      'Say your first step out loud.',
      'Start.',
    ],
    durationSec: 600,
    sensory: { sound: 'optional', movement: 'none', screen: 'some' },
    suits: ['ebb', 'still'],
    contexts: ['unstick', 'toolkit'],
    tool: 'steps_timer',
  },
  {
    id: 's-voice-memo',
    family: 'connect',
    name: 'Say it out loud',
    summary: 'Talk through what is going on in a voice memo.',
    steps: ['Record a voice memo saying what is going on.', 'You do not need to send it.'],
    durationSec: 60,
    sensory: { sound: 'optional', movement: 'none', screen: 'some' },
    suits: ['surge', 'ebb'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 's-ask-help',
    family: 'connect',
    name: 'Ask for help',
    summary: 'A ready-made message to a TA, professor or classmate.',
    steps: [
      'Edit the message to your TA, professor or classmate.',
      'Copy it and send it yourself.',
    ],
    durationSec: 180,
    sensory: { sound: 'none', movement: 'none', screen: 'full' },
    suits: ['surge', 'ebb'],
    contexts: ALL,
    tool: 'message_template',
    template:
      "Hi, I'm working on {task} and I'm stuck on where to start. Could you point me to the first thing I should focus on? Thank you.",
  },
  {
    id: 'cr-doodle',
    family: 'create',
    name: '2-minute doodle',
    summary: 'Draw anything for two minutes. Nothing is saved.',
    steps: ['Draw anything.', 'Lines, shapes, scribbles.', 'Nothing is saved.'],
    durationSec: 120,
    sensory: { sound: 'none', movement: 'light', screen: 'full' },
    suits: ['ebb', 'surge', 'still'],
    contexts: ALL,
    tool: 'doodle',
  },
  {
    id: 'cr-three-words',
    family: 'create',
    name: 'Three words',
    summary: 'Write three words about right now.',
    steps: ['Write three words about right now.', 'That is all.'],
    durationSec: 60,
    sensory: { sound: 'none', movement: 'none', screen: 'some' },
    suits: ['ebb', 'still'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 'cr-brain-dump',
    family: 'create',
    name: 'Brain dump',
    summary: 'Get everything out of your head, one line at a time.',
    steps: [
      'Type everything in your head.',
      'One thing per line.',
      'Turn lines into tasks if you want.',
    ],
    durationSec: 120,
    sensory: { sound: 'none', movement: 'none', screen: 'full' },
    suits: ['surge'],
    contexts: ALL,
    tool: 'brain_dump',
  },
  {
    id: 't-sudoku',
    family: 'think',
    name: 'Mini sudoku',
    summary: 'A tiny 4 by 4 puzzle to give your mind one clear job.',
    steps: [
      'Fill the 4 by 4 grid with 1 to 4.',
      'Each row, column and box has each number once.',
    ],
    durationSec: 180,
    sensory: { sound: 'none', movement: 'none', screen: 'full' },
    suits: ['surge', 'ebb'],
    contexts: ALL,
    tool: 'sudoku_4x4',
  },
  {
    id: 't-count-7',
    family: 'think',
    name: 'Count back by 7',
    summary: 'A counting task that crowds out racing thoughts.',
    steps: ['Start at 100.', 'Subtract 7 each time.', 'Say the numbers in your head.'],
    durationSec: 60,
    sensory: { sound: 'none', movement: 'none', screen: 'none' },
    suits: ['surge'],
    contexts: ALL,
    tool: 'steps_timer',
  },
  {
    id: 't-spot-blue',
    family: 'think',
    name: 'Spot five blue things',
    summary: 'Look around and find five blue things.',
    steps: ['Look around.', 'Find five blue things.', 'Name them.'],
    durationSec: 60,
    sensory: { sound: 'none', movement: 'light', screen: 'none' },
    suits: ['surge', 'ebb'],
    contexts: ALL,
    tool: 'steps_timer',
  },
];

const byId = new Map(STRATEGIES.map((s) => [s.id, s]));

export function getStrategy(id: string): Strategy | undefined {
  return byId.get(id);
}

export function strategyName(id: string): string {
  return byId.get(id)?.name ?? id;
}

export const STRATEGY_FAMILIES: StrategyFamily[] = ['move', 'calm', 'connect', 'create', 'think'];
