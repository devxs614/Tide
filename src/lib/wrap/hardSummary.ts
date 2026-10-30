// "What's been hard" on Patterns (v2 spec 20): the two things Maya picked
// most often as hard across the days she closed in the period. Counts only,
// no advice, and nothing until there are at least three closed days.
import type { DayWrap } from '@/lib/types';

export function hardSummary(wraps: DayWrap[]): Array<{ id: string; k: number; n: number }> {
  const closed = wraps.filter((w) => w.completedAt);
  if (closed.length < 3) return [];
  const counts = new Map<string, number>();
  for (const w of closed) for (const id of w.hard) if (id !== 'general:nothing') counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 2)
    .map(([id, k]) => ({ id, k, n: closed.length }));
}
