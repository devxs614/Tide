// One strategy in the toolkit list: family icon, name, a one-line summary,
// duration and sensory notes, and, when Maya has history with it, "Worked
// for you 3 of 4 times". The whole card is a link to the runner.
import Link from 'next/link';
import { copy, fill } from '@/copy/en';
import type { Strategy } from '@/data/strategies';
import { FAMILY_ICONS } from './familyIcons';
import { StrategyMeta } from './StrategyMeta';

export function StrategyCard({ strategy, better, n, href }: { strategy: Strategy; better: number; n: number; href: string }) {
  const Icon = FAMILY_ICONS[strategy.family];
  return (
    <Link href={href} className="flex h-full flex-col gap-2 rounded-card border border-line bg-surface p-4 hover:bg-surface-2">
      <span className="flex items-center gap-2">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden />
        <span className="text-body font-bold">{strategy.name}</span>
      </span>
      <span className="text-ink-soft">{strategy.summary}</span>
      <StrategyMeta strategy={strategy} />
      {n > 0 && <span className="text-caption font-bold">{fill(copy.toolkit.workedCount, { k: better, n })}</span>}
    </Link>
  );
}
