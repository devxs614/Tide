// The small facts under a strategy's name: how long it takes and what it
// involves ("Quiet", "Moves body", "Screen"), always as words, so Maya can
// tell at a glance whether it fits the room she's in.
import { copy, fill } from '@/copy/en';
import type { Strategy } from '@/data/strategies';

export function durationLabel(seconds: number): string {
  return seconds < 60 ? fill(copy.toolkit.durationSeconds, { n: seconds }) : fill(copy.toolkit.duration, { n: Math.round(seconds / 60) });
}

export function sensoryBadges(s: Strategy): string[] {
  const t = copy.toolkit.sensory;
  const badges: string[] = [];
  badges.push(s.sensory.sound === 'none' ? t.quiet : t.sound);
  if (s.sensory.movement === 'active') badges.push(t.movesBody);
  if (s.sensory.movement === 'light') badges.push(t.lightMove);
  badges.push(s.sensory.screen === 'none' ? t.noScreen : t.screen);
  return badges;
}

export function StrategyMeta({ strategy }: { strategy: Strategy }) {
  return (
    <ul className="flex flex-wrap gap-2 text-caption">
      <li className="rounded-full bg-surface-2 px-3 py-1 font-bold">{durationLabel(strategy.durationSec)}</li>
      {sensoryBadges(strategy).map((b) => (
        <li key={b} className="rounded-full border border-line px-3 py-1 text-ink-soft">
          {b}
        </li>
      ))}
    </ul>
  );
}
