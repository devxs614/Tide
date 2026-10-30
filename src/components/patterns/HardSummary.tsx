'use client';

// "What's been hard" (v2 spec 20): a small section, not a pattern card, with
// the two hard things picked most often in Close the day this period.
import { copy, fill } from '@/copy/en';
import type { DayWrap } from '@/lib/types';
import { hardSummary } from '@/lib/wrap/hardSummary';

export function HardSummary({ wraps }: { wraps: DayWrap[] }) {
  const rows = hardSummary(wraps);
  if (rows.length === 0) return null;
  const labels = copy.wrap.hardOptions as Record<string, string>;
  return (
    <section aria-labelledby="hard-summary" className="flex flex-col gap-2">
      <h3 id="hard-summary" className="text-h3 font-bold">
        {copy.wrap.hardSummaryTitle}
      </h3>
      <ul className="flex flex-col gap-1">
        {rows.map((r) => (
          <li key={r.id}>{fill(copy.wrap.hardSummaryRow, { label: labels[r.id.split(':')[1]] ?? r.id, k: r.k, n: r.n })}</li>
        ))}
      </ul>
    </section>
  );
}
