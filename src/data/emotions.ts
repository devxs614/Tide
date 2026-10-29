// Tide's emotion vocabulary: 48 words, 12 per state, each with a place on the
// mood map and a one-line plain definition. The AI may only choose from these
// ids, which keeps suggestions inside words Maya can look up and read aloud.
// This list is a draft from the team's spec, to review with their partner.
import type { Quadrant } from '@/lib/types';

export interface Emotion {
  id: string;
  word: string;
  quadrant: Quadrant;
  energy: number;
  pleasantness: number;
  definition: string;
}

export const EMOTIONS: Emotion[] = [
  // Surge: high energy, unpleasant
  { id: 'anxious', word: 'Anxious', quadrant: 'surge', energy: 3, pleasantness: -3, definition: 'Worried about what might happen, with a busy body or mind' },
  { id: 'frustrated', word: 'Frustrated', quadrant: 'surge', energy: 2, pleasantness: -3, definition: 'Blocked from something you want to do' },
  { id: 'overwhelmed', word: 'Overwhelmed', quadrant: 'surge', energy: 3, pleasantness: -4, definition: 'Too much at once to handle right now' },
  { id: 'irritated', word: 'Irritated', quadrant: 'surge', energy: 2, pleasantness: -2, definition: 'Small things are bothering you more than usual' },
  { id: 'stressed', word: 'Stressed', quadrant: 'surge', energy: 3, pleasantness: -3, definition: 'Under pressure from demands or deadlines' },
  { id: 'panicked', word: 'Panicked', quadrant: 'surge', energy: 5, pleasantness: -5, definition: 'Sudden strong fear that makes it hard to think' },
  { id: 'angry', word: 'Angry', quadrant: 'surge', energy: 4, pleasantness: -4, definition: 'Strong feeling that something is unfair or wrong' },
  { id: 'restless', word: 'Restless', quadrant: 'surge', energy: 3, pleasantness: -1, definition: 'Unable to sit still or settle' },
  { id: 'worried', word: 'Worried', quadrant: 'surge', energy: 2, pleasantness: -3, definition: 'Thinking again and again about a possible problem' },
  { id: 'tense', word: 'Tense', quadrant: 'surge', energy: 2, pleasantness: -2, definition: 'Your body or mind feels tight and on guard' },
  { id: 'embarrassed', word: 'Embarrassed', quadrant: 'surge', energy: 2, pleasantness: -3, definition: 'Uncomfortable about how others might see you' },
  { id: 'jittery', word: 'Jittery', quadrant: 'surge', energy: 4, pleasantness: -2, definition: 'Shaky, buzzing energy that is hard to use' },

  // Swell: high energy, pleasant
  { id: 'excited', word: 'Excited', quadrant: 'swell', energy: 4, pleasantness: 4, definition: 'Looking forward to something with lots of energy' },
  { id: 'motivated', word: 'Motivated', quadrant: 'swell', energy: 3, pleasantness: 3, definition: 'Ready and wanting to get things done' },
  { id: 'proud', word: 'Proud', quadrant: 'swell', energy: 2, pleasantness: 4, definition: 'Good about something you did' },
  { id: 'energized', word: 'Energized', quadrant: 'swell', energy: 4, pleasantness: 3, definition: 'Full of energy and ready to move' },
  { id: 'curious', word: 'Curious', quadrant: 'swell', energy: 2, pleasantness: 2, definition: 'Interested and wanting to know more' },
  { id: 'hopeful', word: 'Hopeful', quadrant: 'swell', energy: 1, pleasantness: 3, definition: 'Believing something good can happen' },
  { id: 'focused', word: 'Focused', quadrant: 'swell', energy: 2, pleasantness: 2, definition: 'Your attention is where you want it' },
  { id: 'playful', word: 'Playful', quadrant: 'swell', energy: 3, pleasantness: 4, definition: 'Light, fun and in the mood to joke or explore' },
  { id: 'confident', word: 'Confident', quadrant: 'swell', energy: 2, pleasantness: 3, definition: 'Sure you can handle what is in front of you' },
  { id: 'inspired', word: 'Inspired', quadrant: 'swell', energy: 3, pleasantness: 4, definition: 'Full of ideas and wanting to create' },
  { id: 'happy', word: 'Happy', quadrant: 'swell', energy: 2, pleasantness: 4, definition: 'Feeling good overall' },
  { id: 'determined', word: 'Determined', quadrant: 'swell', energy: 3, pleasantness: 2, definition: 'Set on finishing something, even if it is hard' },

  // Ebb: low energy, unpleasant
  { id: 'drained', word: 'Drained', quadrant: 'ebb', energy: -3, pleasantness: -3, definition: 'Low battery; everything feels like effort' },
  { id: 'sad', word: 'Sad', quadrant: 'ebb', energy: -2, pleasantness: -4, definition: 'Down or heavy, maybe about a loss or disappointment' },
  { id: 'bored', word: 'Bored', quadrant: 'ebb', energy: -2, pleasantness: -2, definition: 'Nothing feels interesting right now' },
  { id: 'lonely', word: 'Lonely', quadrant: 'ebb', energy: -2, pleasantness: -3, definition: 'Wanting connection with others' },
  { id: 'disappointed', word: 'Disappointed', quadrant: 'ebb', energy: -2, pleasantness: -3, definition: 'Something did not go the way you hoped' },
  { id: 'discouraged', word: 'Discouraged', quadrant: 'ebb', energy: -2, pleasantness: -3, definition: 'Losing belief that trying will work' },
  { id: 'numb', word: 'Numb', quadrant: 'ebb', energy: -4, pleasantness: -2, definition: 'Hard to feel much of anything' },
  { id: 'exhausted', word: 'Exhausted', quadrant: 'ebb', energy: -5, pleasantness: -3, definition: 'Physically or mentally out of energy' },
  { id: 'ashamed', word: 'Ashamed', quadrant: 'ebb', energy: -2, pleasantness: -4, definition: 'Feeling bad about yourself, not only about what happened' },
  { id: 'defeated', word: 'Defeated', quadrant: 'ebb', energy: -3, pleasantness: -4, definition: 'Feeling like you lost or cannot win this one' },
  { id: 'foggy', word: 'Foggy', quadrant: 'ebb', energy: -3, pleasantness: -2, definition: 'Thoughts feel slow or blurry' },
  { id: 'unmotivated', word: 'Unmotivated', quadrant: 'ebb', energy: -3, pleasantness: -2, definition: 'You know what to do but cannot make yourself start' },

  // Still: low energy, pleasant
  { id: 'calm', word: 'Calm', quadrant: 'still', energy: -2, pleasantness: 3, definition: 'Quiet inside, not in a hurry' },
  { id: 'content', word: 'Content', quadrant: 'still', energy: -1, pleasantness: 3, definition: 'Things feel okay as they are' },
  { id: 'relaxed', word: 'Relaxed', quadrant: 'still', energy: -3, pleasantness: 3, definition: 'Your body and mind feel loose' },
  { id: 'grateful', word: 'Grateful', quadrant: 'still', energy: -1, pleasantness: 4, definition: 'Thankful for something or someone' },
  { id: 'peaceful', word: 'Peaceful', quadrant: 'still', energy: -3, pleasantness: 4, definition: 'Settled and at ease' },
  { id: 'safe', word: 'Safe', quadrant: 'still', energy: -2, pleasantness: 3, definition: 'Nothing feels threatening right now' },
  { id: 'rested', word: 'Rested', quadrant: 'still', energy: -1, pleasantness: 3, definition: 'Recovered and not tired' },
  { id: 'settled', word: 'Settled', quadrant: 'still', energy: -2, pleasantness: 2, definition: 'You know where you are and what is next' },
  { id: 'comfortable', word: 'Comfortable', quadrant: 'still', energy: -2, pleasantness: 2, definition: 'Physically at ease in your space' },
  { id: 'thoughtful', word: 'Thoughtful', quadrant: 'still', energy: -1, pleasantness: 2, definition: 'Quietly thinking things through' },
  { id: 'satisfied', word: 'Satisfied', quadrant: 'still', energy: -1, pleasantness: 3, definition: 'Something feels complete or enough' },
  { id: 'cozy', word: 'Cozy', quadrant: 'still', energy: -3, pleasantness: 3, definition: 'Warm, snug and comfortable' },
];

export const EMOTION_IDS = EMOTIONS.map((e) => e.id);

const byId = new Map(EMOTIONS.map((e) => [e.id, e]));

export function getEmotion(id: string): Emotion | undefined {
  return byId.get(id);
}

// Display word for a stored id. Custom words are kept as 'custom:<word>' so
// they never collide with the vocabulary.
export function emotionWord(id: string): string {
  if (id.startsWith('custom:')) return id.slice('custom:'.length);
  return byId.get(id)?.word ?? id;
}

export function emotionsInQuadrant(q: Quadrant): Emotion[] {
  return EMOTIONS.filter((e) => e.quadrant === q);
}
