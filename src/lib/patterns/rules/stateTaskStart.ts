// Rule C, state before task: "writing tasks got going less often after an
// Ebb check-in". Each focus block is matched to the latest check-in from the
// three hours before it; blocks are grouped by that check-in's state and the
// task type, and compared with how that task type goes across all states.
import { copy } from '@/copy/en';
import { getTaskType } from '@/data/taskTypes';
import { formatShortDay, formatTime, HOUR } from '@/lib/time';
import type { CheckIn, FocusBlock, Quadrant, TaskType } from '@/lib/types';
import { confidenceFor, inWindow, pct } from '../confidence';
import type { PatternInput, PatternResult } from '../types';

const LOOKBACK = 3 * HOUR;

interface Linked {
  block: FocusBlock;
  checkIn: CheckIn;
  taskType: TaskType;
}

function linkBlocks(input: PatternInput): Linked[] {
  const tasks = new Map(input.tasks.map((t) => [t.id, t]));
  const checkins = input.checkins.filter((c) => !c.safetyTriggered).sort((a, b) => b.ts - a.ts);
  return input.focusBlocks
    .filter((b) => inWindow(b.ts, input.now, input.windowDays))
    .flatMap((block) => {
      const task = tasks.get(block.taskId);
      const checkIn = checkins.find((c) => c.ts <= block.ts && block.ts - c.ts <= LOOKBACK);
      return task && checkIn ? [{ block, checkIn, taskType: task.type }] : [];
    });
}

const gotGoing = (list: Linked[]) => list.filter((l) => l.block.outcome === 'got_going').length;

export function stateTaskStart(input: PatternInput): PatternResult[] {
  const linked = linkBlocks(input);
  const groups = new Map<string, { quadrant: Quadrant; taskType: TaskType; items: Linked[] }>();
  for (const l of linked) {
    const key = `${l.checkIn.quadrant}:${l.taskType}`;
    const g = groups.get(key) ?? { quadrant: l.checkIn.quadrant, taskType: l.taskType, items: [] };
    g.items.push(l);
    groups.set(key, g);
  }

  return [...groups.values()].flatMap((g) => {
    const n = g.items.length;
    const k = gotGoing(g.items);
    const sameType = linked.filter((l) => l.taskType === g.taskType);
    const baseline = gotGoing(sameType) / sameType.length;
    const rate = k / n;
    if (n < 3 || Math.abs(rate - baseline) < 0.25) return [];
    const quadrantName = copy.quadrants[g.quadrant].name;
    return [
      {
        key: `stateTaskStart:${g.quadrant}:${g.taskType}`,
        kind: 'state_task_start' as const,
        k,
        n,
        rate,
        baselineRate: baseline,
        confidence: confidenceFor(n),
        evidenceIds: g.items.map((l) => l.block.id),
        evidence: g.items.map((l) => ({
          id: l.block.id,
          ts: l.block.ts,
          label: `${formatShortDay(l.block.ts)}, ${formatTime(l.block.ts)} · ${quadrantName} → ${getTaskType(g.taskType).label.toLowerCase()}`,
          outcome: copy.focus.outcomes[l.block.outcome ?? 'didnt_start'],
        })),
        facts: { quadrantName, taskType: g.taskType, k, n, baselinePct: pct(baseline), direction: rate > baseline ? 'higher' : 'lower' },
      },
    ];
  });
}
