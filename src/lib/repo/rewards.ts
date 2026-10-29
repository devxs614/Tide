// Maya's own micro-rewards ("Tea break"). Tide suggests one after a focus
// block that got going; it never decides for her what counts as a reward.
import { db } from '../db';
import type { Reward } from '../types';

export async function addReward(text: string): Promise<Reward | undefined> {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const reward: Reward = { id: crypto.randomUUID(), text: trimmed };
  await db.rewards.add(reward);
  return reward;
}

export async function removeReward(id: string): Promise<void> {
  await db.rewards.delete(id);
}
