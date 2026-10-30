'use client';

// Step 3, "Your day as a tide": the chart, and one factual sentence built
// from the counts. Numbers only, never comparisons or judgments.
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { DayTideChart } from '../DayTideChart';
import type { WrapStepProps } from '../WrapStep';

export function TideStep({ facts }: WrapStepProps) {
  const { settings } = useSettings();
  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.tideTitle}</h1>
      <DayTideChart facts={facts} dayStart={settings['day.start']} dayEnd={settings['day.end']} />
      <p>
        {fill(copy.wrap.factsSentence, {
          c: facts.checkins.length,
          t: facts.tasksDone.length,
          s: facts.transitions.length,
          g: facts.strategies.length,
        })}
      </p>
    </>
  );
}
