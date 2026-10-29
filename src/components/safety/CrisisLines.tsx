// The crisis phone lines as big, plain tel: buttons. The numbers come from
// data/resources.ts, which the team verifies before submission.
import { Phone } from 'lucide-react';
import { CRISIS_LINES } from '@/data/resources';

export function CrisisLines() {
  return (
    <ul className="flex flex-col gap-3">
      {CRISIS_LINES.map((line) => (
        <li key={line.id}>
          <a
            href={`tel:${line.tel}`}
            className="flex min-h-14 items-center gap-3 rounded-card border border-primary bg-surface px-5 py-3 text-lead font-bold text-primary hover:bg-surface-2"
          >
            <Phone className="size-6 shrink-0" aria-hidden />
            {line.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
