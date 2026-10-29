// Rule A, strategy before task: "after a 3-minute walk, writing tasks got
// going 4 of 5 times". A strategy counts as "before" a task when a focus
// block on that task starts within 20 minutes after it. The comparison is
// how often that task type gets going without any strategy first.

// The same groups feed Unstick's "helped you k of n times" line, so the two
// screens can never disagree.
import { strategyName } from '@/data/strategies';
import { formatShortDay, formatTime, MINUTE } from '@/lib/time';
import { copy } from '@/copy/en';
import type { FocusBlock, StrategyUse, Task, TaskType } from '@/lib/types';
import { confidenceFor, inWindow, pct } from '../confidence';
import type { EvidenceRow, PatternInput, PatternResult } from '../types';

const LINK_WINDOW = 20 * MINUTE;

export interface StrategyTaskGroup {
  strategyId: string;
  taskType: TaskType;
  k: number;
  n: number;
  pairs: Array<{ use: StrategyUse; block: FocusBlock }>;
}

type Data = Pick<PatternInput, 'now' | 'windowDays' | 'tasks' | 'focusBlocks' | 'strategyUses'>;

function firstBlockAfter(use: StrategyUse, blocks: FocusBlock[]): FocusBlock | undefined {
  return blocks.find((b) => b.ts > use.ts && b.ts <= use.ts + LINK_WINDOW);
}

export function strategyTaskGroups(data: Data): StrategyTaskGroup[] {
  const taskById = new Map(data.tasks.map((t) => [t.id, t]));
  const blocks = data.focusBlocks.filter((b) => inWindow(b.ts, data.now, data.windowDays)).sort((a, b) => a.ts - b.ts);
  const groups = new Map<string, StrategyTaskGroup>();
  // Two walks before the same focus block are one occasion, not two, or
  // "k of n" would grow every time Maya repeats a strategy. Going newest
  // first lets the walk closest to the block be the one that counts.
  const claimed = new Set<string>();
  const uses = data.strategyUses.filter((u) => inWindow(u.ts, data.now, data.windowDays)).sort((a, b) => b.ts - a.ts);

  for (const use of uses) {
    const block = firstBlockAfter(use, blocks);
    const task = block && taskById.get(block.taskId);
    if (!block || !task || claimed.has(`${use.strategyId}:${block.id}`)) continue;
    claimed.add(`${use.strategyId}:${block.id}`);
    const key = `${use.strategyId}:${task.type}`;
    const group = groups.get(key) ?? { strategyId: use.strategyId, taskType: task.type, k: 0, n: 0, pairs: [] };
    group.n += 1;
    if (block.outcome === 'got_going') group.k += 1;
    group.pairs.push({ use, block });
    groups.set(key, group);
  }
  // Evidence reads oldest first, like every other "Why am I seeing this?".
  for (const group of groups.values()) group.pairs.reverse();
  return [...groups.values()];
}

// How often a task type gets going with no strategy in the 20 minutes before.
// With fewer than 3 such blocks, fall back to the rate across all blocks.
export function baselineRate(data: Data, taskType: TaskType): number {
  const taskById = new Map(data.tasks.map((t) => [t.id, t]));
  const blocks = data.focusBlocks.filter((b) => inWindow(b.ts, data.now, data.windowDays));
  const rateOf = (list: FocusBlock[]) => (list.length ? list.filter((b) => b.outcome === 'got_going').length / list.length : 0);
  const unprimed = blocks.filter(
    (b) =>
      taskById.get(b.taskId)?.type === taskType &&
      !data.strategyUses.some((u) => u.ts < b.ts && b.ts - u.ts <= LINK_WINDOW),
  );
  return unprimed.length >= 3 ? rateOf(unprimed) : rateOf(blocks);
}

function evidenceFor(group: StrategyTaskGroup): EvidenceRow[] {
  return group.pairs.map(({ use, block }) => ({
    id: use.id,
    ts: use.ts,
    label: `${formatShortDay(use.ts)}, ${formatTime(use.ts)} · ${strategyName(use.strategyId)} → ${group.taskType}`,
    outcome: block.outcome ? copy.focus.outcomes[block.outcome] : copy.focus.outcomes.didnt_start,
  }));
}

export function strategyBeforeTask(input: PatternInput): PatternResult[] {
  return strategyTaskGroups(input).flatMap((g) => {
    const rate = g.k / g.n;
    const baseline = baselineRate(input, g.taskType);
    if (g.n < 3 || rate < 0.6 || rate - baseline < 0.25) return [];
    return [
      {
        key: `strategyBeforeTask:${g.strategyId}:${g.taskType}`,
        kind: 'strategy_before_task' as const,
        k: g.k,
        n: g.n,
        rate,
        baselineRate: baseline,
        confidence: confidenceFor(g.n),
        evidenceIds: g.pairs.map((p) => p.use.id),
        evidence: evidenceFor(g),
        facts: { strategyName: strategyName(g.strategyId), taskType: g.taskType, k: g.k, n: g.n, baselinePct: pct(baseline) },
      },
    ];
  });
}

// For Unstick: the strategies that came before this task type at least 3
// times, best rate first, top 3. The AI (or the fallback) only suggests one
// when it helped at least 60% of the time.
export function helpfulStrategiesFor(data: Data, taskType: Task['type']) {
  return strategyTaskGroups(data)
    .filter((g) => g.taskType === taskType && g.n >= 3)
    .sort((a, b) => b.k / b.n - a.k / a.n || b.n - a.n)
    .slice(0, 3)
    .map((g) => ({ id: g.strategyId, name: strategyName(g.strategyId), better: g.k, n: g.n }));
}
