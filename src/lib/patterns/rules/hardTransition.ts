// Rule B, hard transitions: "switching from lab to class felt hard 3 of the
// last 4 times". Switches are grouped by the kind of activity on each side
// (an event's kind, or "task" when Maya was coming from a task). When one
// strategy was used in some of those switches and not in others, the rule
// also compares how often the switch felt hard with and without it.
import { strategyName } from '@/data/strategies';
import { copy } from '@/copy/en';
import { formatShortDay, formatTime } from '@/lib/time';
import type { CalendarEvent, StrategyUse, Transition } from '@/lib/types';
import { confidenceFor, inWindow } from '../confidence';
import type { EvidenceRow, PatternInput, PatternResult } from '../types';

export interface TransitionGroup {
  fromLabel: string;
  toLabel: string;
  k: number; // rated hard
  n: number; // rated at all
  items: Transition[];
}

type Data = Pick<PatternInput, 'now' | 'windowDays' | 'events' | 'transitions' | 'strategyUses'>;

export function sideLabels(t: Transition, events: Map<string, CalendarEvent>): { fromLabel: string; toLabel: string } {
  const from = t.fromEventId ? events.get(t.fromEventId) : undefined;
  return { fromLabel: from?.kind ?? 'task', toLabel: events.get(t.toEventId)?.kind ?? 'other' };
}

export function transitionGroups(data: Data): TransitionGroup[] {
  const events = new Map(data.events.map((e) => [e.id, e]));
  const groups = new Map<string, TransitionGroup>();
  for (const t of data.transitions) {
    if (!t.rating || !inWindow(t.ts, data.now, data.windowDays)) continue;
    const { fromLabel, toLabel } = sideLabels(t, events);
    const key = `${fromLabel}:${toLabel}`;
    const g = groups.get(key) ?? { fromLabel, toLabel, k: 0, n: 0, items: [] };
    g.n += 1;
    if (t.rating === 'hard') g.k += 1;
    g.items.push(t);
    groups.set(key, g);
  }
  return [...groups.values()];
}

// The most-used strategy in this group's switches, and the hard counts with
// and without it. Only reported when both sides have at least 2 switches.
function strategyComparison(g: TransitionGroup, uses: Map<string, StrategyUse>) {
  const strategyOf = (t: Transition) => (t.strategyUseId ? uses.get(t.strategyUseId)?.strategyId : undefined);
  const counts = new Map<string, number>();
  g.items.forEach((t) => {
    const s = strategyOf(t);
    if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
  });
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!top) return null;
  const withIt = g.items.filter((t) => strategyOf(t) === top);
  const without = g.items.filter((t) => strategyOf(t) !== top);
  if (withIt.length < 2 || without.length < 2) return null;
  return {
    withStrategyName: strategyName(top),
    withStrategyHardK: withIt.filter((t) => t.rating === 'hard').length,
    withStrategyN: withIt.length,
    withoutStrategyHardK: without.filter((t) => t.rating === 'hard').length,
    withoutStrategyN: without.length,
  };
}

function evidenceFor(g: TransitionGroup, uses: Map<string, StrategyUse>): EvidenceRow[] {
  return g.items
    .sort((a, b) => a.ts - b.ts)
    .map((t) => {
      const used = t.strategyUseId ? uses.get(t.strategyUseId) : undefined;
      return {
        id: t.id,
        ts: t.ts,
        label: `${formatShortDay(t.ts)}, ${formatTime(t.ts)} · ${g.fromLabel} → ${g.toLabel}${used ? ` · ${strategyName(used.strategyId)}` : ''}`,
        outcome: copy.bridge.ratings[t.rating!],
      };
    });
}

export function hardTransition(input: PatternInput): PatternResult[] {
  const uses = new Map(input.strategyUses.map((u) => [u.id, u]));
  return transitionGroups(input).flatMap((g) => {
    const rate = g.k / g.n;
    if (g.n < 3 || rate < 0.5) return [];
    const comparison = strategyComparison(g, uses);
    return [
      {
        key: `hardTransition:${g.fromLabel}:${g.toLabel}`,
        kind: 'hard_transition' as const,
        k: g.k,
        n: g.n,
        rate,
        confidence: confidenceFor(g.n),
        evidenceIds: g.items.map((t) => t.id),
        evidence: evidenceFor(g, uses),
        facts: { fromLabel: g.fromLabel, toLabel: g.toLabel, k: g.k, n: g.n, ...(comparison ?? {}) },
      },
    ];
  });
}

// For the Bridge sheet: the hard-switch numbers for one pair, only when
// they clear the same bar as the Patterns card.
export function hardSwitchFor(data: Data, fromLabel: string, toLabel: string): { k: number; n: number } | null {
  const g = transitionGroups(data).find((x) => x.fromLabel === fromLabel && x.toLabel === toLabel);
  return g && g.n >= 3 && g.k / g.n >= 0.5 ? { k: g.k, n: g.n } : null;
}
