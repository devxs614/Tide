'use client';

// Step 7, "If today were water, it was…": five cards from Stormy to Glassy,
// each with its plain meaning. In Literal mode only the plain meaning shows.
// Optional.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { Overall } from '@/lib/types';
import { CardButton } from '@/components/ui/card';
import type { WrapStepProps } from '../WrapStep';

const LEVELS: Overall[] = ['very_hard', 'hard', 'mixed', 'okay', 'good'];

export function OverallStep({ wrap, save }: WrapStepProps) {
  const { settings } = useSettings();
  const literal = settings.communicationMode === 'literal';
  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.overallTitle}</h1>
      <div className="flex flex-col gap-2">
        {LEVELS.map((o) => (
          <CardButton key={o} selected={wrap.overall === o} onClick={() => save({ overall: o })}>
            <span className="font-display font-extrabold">{literal ? copy.wrap.overall[o].literal : copy.wrap.overall[o].water}</span>
            {!literal && <span className="text-small text-ink-soft">{copy.wrap.overall[o].literal}</span>}
          </CardButton>
        ))}
      </div>
    </>
  );
}
