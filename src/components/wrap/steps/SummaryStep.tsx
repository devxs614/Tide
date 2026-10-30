'use client';

// Step 11, the summary (v2 spec 14.6): /api/ai/wrapup puts the day into a
// few kind sentences, a highlight, a tip for tomorrow and a line from the
// companion. It gets counts, titles and the labels Maya picked, never her
// own notes. Without the AI (or if its answer judges the day), a plain
// template says the same facts. Saved, so reopening doesn't ask again.
import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { copy } from '@/copy/en';
import { companionLine } from '@/copy/companions';
import { strategyName } from '@/data/strategies';
import { useAi } from '@/lib/ai/useAi';
import { db } from '@/lib/db';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useSettings } from '@/lib/settings';
import { wrapupInput } from '@/lib/wrap/facts';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import type { WrapStepProps } from '../WrapStep';

function label(id: string): string {
  const [kind, key] = id.split(':');
  if (kind === 'strategy') return strategyName(key);
  return (copy.wrap.helpedOptions as Record<string, string>)[key] ?? (copy.wrap.hardOptions as Record<string, string>)[key] ?? key;
}

export function SummaryStep({ wrap, facts, save }: WrapStepProps) {
  const { settings } = useSettings();
  const profile = useCompanion();
  const ai = useAi('wrapup');
  const asked = useRef(false);
  const summary = wrap.aiSummary;

  useEffect(() => {
    if (summary || asked.current) return;
    asked.current = true;
    void (async () => {
      const anchor = wrap.anchorTaskId ? await db.tasks.get(wrap.anchorTaskId) : undefined;
      const input = wrapupInput(facts, wrap, { helped: wrap.helped.map(label), hard: wrap.hard.map(label) }, {
        mode: settings.communicationMode,
        readingLevel: settings['language.readingLevel'],
        anchorTitle: anchor?.title ?? null,
        patternHint: null,
        companionName: profile.species ? profile.name.slice(0, 16) : null,
      });
      const result = await ai.run(input);
      // The template's goodnight is generic; the companion has its own.
      const line = result.source === 'fallback' && profile.species ? companionLine(profile.species, 'wrap_end', settings.communicationMode, { name: settings.name }) : result.data.companionLine;
      save({ aiSummary: { ...result.data, companionLine: line, source: result.source } });
    })();
  }, [summary, wrap, facts, settings, profile, ai, save]);

  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.summaryTitle}</h1>
      {!summary ? (
        <p aria-live="polite" className="text-ink-soft">
          {copy.wrap.summaryLoading}
        </p>
      ) : (
        <section className="card flex flex-col gap-3 p-4" aria-live="polite">
          <p>{summary.summary}</p>
          <p className="flex items-start gap-2 font-bold">
            <Star aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
            {summary.highlight}
          </p>
          <p>{summary.tomorrowTip}</p>
          <p className="font-display text-lead">&ldquo;{summary.companionLine}&rdquo;</p>
          <ReadAloudButton text={[summary.summary, summary.highlight, summary.tomorrowTip, summary.companionLine].join(' ')} />
          <p className="text-caption text-ink-soft">{copy.wrap.notJudgment}</p>
        </section>
      )}
    </>
  );
}
