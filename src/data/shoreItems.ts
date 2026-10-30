// What washes up on Your Shore (v2 spec 13.4). Each win becomes one item,
// decided by its kind and data, never by chance: a writing task is always a
// spiral shell, an easy switch is always blue sea glass. The words here are
// what Maya reads when she taps an item, and, in the Collection, how an
// item arrives. It's a field guide, not a checklist.
import type { FirstFeature, StrategyFamily, Win } from '@/lib/types';

export type ShoreItemType =
  | 'spiral' | 'scallop' | 'cowrie' | 'conch' | 'clam' | 'moonSnail'
  | 'pebble' | 'seaGlass' | 'starfish' | 'sandDollar' | 'driftwood' | 'bottle' | 'pearl' | 'welcome';

export const SHORE_ITEM_TYPES: ShoreItemType[] = [
  'spiral', 'scallop', 'cowrie', 'conch', 'clam', 'moonSnail', 'pebble', 'seaGlass', 'starfish', 'sandDollar', 'driftwood', 'bottle', 'pearl', 'welcome',
];

export const SHORE_ITEMS: Record<ShoreItemType, { name: string; description: string; howTo: string }> = {
  spiral: { name: 'Spiral shell', description: 'A spiral shell. You finished something you wrote.', howTo: 'Finish a writing task' },
  scallop: { name: 'Scallop', description: 'A scallop. You finished something you studied.', howTo: 'Finish a studying task' },
  cowrie: { name: 'Cowrie', description: 'A cowrie. You got a piece of admin done.', howTo: 'Finish an admin task' },
  conch: { name: 'Conch', description: 'A conch. You reached out to someone.', howTo: 'Finish a social task' },
  clam: { name: 'Clam', description: 'A clam. You took care of a chore.', howTo: 'Finish a chore' },
  moonSnail: { name: 'Moon snail', description: 'A moon snail. You finished something.', howTo: 'Finish any other task' },
  pebble: { name: 'Smooth pebble', description: 'A smooth pebble. You got unstuck.', howTo: 'Get going on a task that was stuck' },
  seaGlass: { name: 'Sea glass', description: 'Sea glass. You made it through a switch.', howTo: 'Rate a switch easy or okay' },
  starfish: { name: 'Starfish', description: 'A starfish. {strategy} helped.', howTo: 'Try a strategy that helps' },
  sandDollar: { name: 'Sand dollar', description: 'A sand dollar. Something you chose to remember.', howTo: 'Add a win yourself in the Proof log' },
  driftwood: { name: 'Driftwood', description: 'Driftwood. You closed the day.', howTo: 'Close the day in the evening' },
  bottle: { name: 'Bottle', description: 'A message you wrote to yourself.', howTo: 'Keep a note you wrote to future you' },
  pearl: { name: 'Pearl', description: 'A pearl. Your first {feature}.', howTo: 'Use a part of Tide for the first time' },
  welcome: { name: 'Welcome shell', description: 'Your shore started here.', howTo: 'Finish setting up Tide' },
};

const TASK_SHELL: Record<string, ShoreItemType> = {
  writing: 'spiral', studying: 'scallop', admin: 'cowrie', social: 'conch', chores: 'clam', other: 'moonSnail',
};

// Light, medium or deep for tasks by energy; family colors for starfish.
export type ItemVariant = 'light' | 'medium' | 'deep' | 'grey' | 'slate' | 'warm' | 'blue' | 'green' | 'clear' | StrategyFamily | 'plain';

export function itemForWin(win: Win): { type: ShoreItemType; variant: ItemVariant } {
  const shade = (['light', 'medium', 'deep'] as const)[(win.meta?.energyCost ?? 2) - 1];
  switch (win.kind) {
    case 'task_done':
      return { type: TASK_SHELL[win.meta?.taskType ?? 'other'] ?? 'moonSnail', variant: shade };
    case 'unstuck':
      return { type: 'pebble', variant: (['grey', 'slate', 'warm'] as const)[hash(win.id) % 3] };
    case 'transition':
      return { type: 'seaGlass', variant: win.meta?.rating === 'easy' ? 'blue' : 'green' };
    case 'strategy_better':
      return { type: 'starfish', variant: win.meta?.family ?? 'calm' };
    case 'wrap':
      return { type: 'driftwood', variant: 'plain' };
    case 'bottle':
      return { type: 'bottle', variant: (['green', 'blue', 'clear'] as const)[hash(win.id) % 3] };
    case 'welcome':
      return { type: 'welcome', variant: 'plain' };
    case 'first_time':
      return { type: 'pearl', variant: 'plain' };
    default:
      return { type: 'sandDollar', variant: 'plain' };
  }
}

export const FEATURE_WORDS: Record<FirstFeature, string> = {
  checkin: 'check-in', unstick: 'small first step', focus: 'focus block', bridge: 'bridge', strategy: 'strategy', wrap: 'closed day', bottle: 'bottle',
};

// FNV-1a: a small, stable string hash, so the same win always gets the same
// variant and the same spot on the sand.
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
