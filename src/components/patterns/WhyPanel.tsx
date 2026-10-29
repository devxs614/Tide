// "Why am I seeing this?": the sentence about where the pattern comes from,
// and the actual moments behind it, with date, time and how each went.
// Nothing is hidden; Maya can check every count herself.
import { copy } from '@/copy/en';
import type { EvidenceRow } from '@/lib/patterns/types';

export function WhyPanel({ id, whyText, evidence }: { id: string; whyText: string; evidence: EvidenceRow[] }) {
  return (
    <div id={id} className="flex flex-col gap-2 rounded-card bg-surface-2 p-3">
      <p>{whyText}</p>
      <h4 className="font-bold">{copy.patterns.evidenceTitle}</h4>
      <ul className="flex flex-col gap-1 text-caption">
        {evidence.map((row) => (
          <li key={row.id}>
            {row.label} · <span className="font-bold">{row.outcome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
