// Saving bridges (transitions) and how they went. A transition is saved when
// Maya taps "Done, I'm going"; the rating comes later, after the next event
// has started. Easy and okay switches go into the proof log.
import { db } from '../db';
import { now } from '../clock';
import { transitionWin } from '../wins';
import { addWin } from './wins';
import type { Transition, TransitionRating } from '../types';

export type NewTransition = Omit<Transition, 'ts' | 'rating' | 'ratedAt'> & { ts?: number };

export async function saveTransition(input: NewTransition): Promise<Transition> {
  const transition: Transition = { ...input, ts: input.ts ?? now() };
  await db.transitions.put(transition);
  return transition;
}

export async function getTransition(id: string): Promise<Transition | undefined> {
  return db.transitions.get(id);
}

// The labels the bridge showed ("Chemistry lab", "Calculus") so the win reads
// the same way Maya saw the switch.
export async function transitionLabels(t: Transition): Promise<{ from: string; to: string }> {
  const [fromEvent, fromTask, toEvent] = await Promise.all([
    t.fromEventId ? db.events.get(t.fromEventId) : undefined,
    t.fromTaskId ? db.tasks.get(t.fromTaskId) : undefined,
    db.events.get(t.toEventId),
  ]);
  return {
    from: fromEvent?.title ?? fromTask?.title ?? 'what you were doing',
    to: toEvent?.title ?? 'the next thing',
  };
}

export async function rateTransition(id: string, rating: TransitionRating): Promise<void> {
  await db.transaction('rw', db.transitions, db.wins, db.events, db.tasks, async () => {
    const t = await db.transitions.get(id);
    if (!t || t.rating) return;
    await db.transitions.update(id, { rating, ratedAt: now() });
    if (rating === 'easy' || rating === 'okay') {
      const labels = await transitionLabels(t);
      await addWin(transitionWin(labels.from, labels.to), 'transition', id);
    }
  });
}
