// Saving and reading check-ins. The quadrant is always computed here from
// the two map numbers, never taken from a caller, so a check-in can't end up
// saying "Ebb" with Swell coordinates.
import { db } from '../db';
import { now } from '../clock';
import { clampCoord, toQuadrant } from '../quadrant';
import type { CheckIn } from '../types';

export type NewCheckIn = Omit<CheckIn, 'id' | 'ts' | 'quadrant'> & { ts?: number };

export async function createCheckIn(input: NewCheckIn): Promise<CheckIn> {
  const energy = clampCoord(input.energy);
  const pleasantness = clampCoord(input.pleasantness);
  const checkIn: CheckIn = {
    ...input,
    id: crypto.randomUUID(),
    ts: input.ts ?? now(),
    energy,
    pleasantness,
    quadrant: toQuadrant(energy, pleasantness),
    emotions: input.emotions.slice(0, 2),
  };
  // When the safety layer fired we keep that it happened, never what was said.
  if (checkIn.safetyTriggered) delete checkIn.text;
  await db.checkins.add(checkIn);
  return checkIn;
}

export async function latestCheckIn(): Promise<CheckIn | undefined> {
  return db.checkins
    .orderBy('ts')
    .reverse()
    .filter((c) => !c.safetyTriggered)
    .first();
}
