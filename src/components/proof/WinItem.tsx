// One win in the proof log, with an icon for where it came from (a task, a
// switch, a strategy, or Maya herself) that is also named for screen readers.
import { ArrowRightLeft, CircleCheck, Leaf, PenLine } from 'lucide-react';
import { copy } from '@/copy/en';
import type { Win } from '@/lib/types';

const ICONS = { task: CircleCheck, transition: ArrowRightLeft, strategy: Leaf, manual: PenLine };

export function WinItem({ win }: { win: Win }) {
  const Icon = ICONS[win.source];
  return (
    <li className="flex items-start gap-3 rounded-card border border-line bg-surface p-3">
      <Icon className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
      <span className="flex-1 break-words">
        <span className="sr-only">{copy.proof.sources[win.source]}: </span>
        {win.text}
      </span>
    </li>
  );
}
