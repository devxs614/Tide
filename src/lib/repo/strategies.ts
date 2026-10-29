// Recording when Maya uses a regulation strategy and how she felt after.
// Each use remembers the latest check-in and the task or transition it was
// for, which is what lets the pattern engine learn "a walk before writing
// helps you" without anyone typing that in.
import { db } from '../db';
import { now } from '../clock';
import { strategyName } from '@/data/strategies';
import { strategyWin } from '../wins';
import { latestCheckIn } from './checkins';
import { addWin } from './wins';
import type { RecheckResult, StrategyContext, StrategyUse } from '../types';

export interface NewStrategyUse {
  strategyId: string;
  context: StrategyContext;
  taskId?: string;
  transitionId?: string;
  result?: RecheckResult;
}

export async function recordStrategyUse(input: NewStrategyUse): Promise<StrategyUse> {
  const latest = await latestCheckIn();
  const use: StrategyUse = {
    id: crypto.randomUUID(),
    ts: now(),
    strategyId: input.strategyId,
    context: input.context,
    checkInId: latest?.id,
    taskId: input.taskId,
    transitionId: input.transitionId,
    result: input.result,
  };
  await db.transaction('rw', db.strategyUses, db.wins, async () => {
    await db.strategyUses.add(use);
    if (use.result === 'better') {
      await addWin(strategyWin(strategyName(use.strategyId)), 'strategy', use.id);
    }
  });
  return use;
}

export async function listStrategyUses(): Promise<StrategyUse[]> {
  return db.strategyUses.toArray();
}
