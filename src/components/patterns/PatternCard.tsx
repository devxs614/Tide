'use client';

// One pattern: the AI's (or template's) plain wording, and next to it the
// engine's own numbers, "4 of 5 times · Last 4 weeks", with confidence dots.
// The numbers in the meta line never come from the AI. "Why am I seeing
// this?" opens the evidence; "Not true for me" hides it for good.
import { useState } from 'react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import type { NarrateCard } from '@/lib/ai/schemas';
import { dismissPattern } from '@/lib/repo/patterns';
import type { PatternResult } from '@/lib/patterns/types';
import { Button } from '@/components/ui/button';
import { ConfidenceDots } from '@/components/ui/Dots';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { NotTrueDialog } from './NotTrueDialog';
import { WhyPanel } from './WhyPanel';

export function PatternCard({ pattern, card, periodLabel }: { pattern: PatternResult; card: NarrateCard | null; periodLabel: string }) {
  const [showWhy, setShowWhy] = useState(false);
  const [asking, setAsking] = useState(false);
  const whyId = `why-${pattern.key.replace(/[^a-z0-9]/gi, '-')}`;

  const hide = async (reason?: string) => {
    setAsking(false);
    await dismissPattern(pattern.key, reason);
    toast(copy.patterns.hidden);
  };

  return (
    <article data-demo-id="pattern-card" className="flex flex-col gap-3 card p-4">
      {card ? (
        <>
          <h3 className="text-[1.1176rem] leading-snug font-bold">{card.title}</h3>
          <p>{card.body}</p>
          <ReadAloudButton text={`${card.title}. ${card.body}`} />
        </>
      ) : (
        <div aria-hidden className="flex flex-col gap-2">
          <p className="text-ink-soft">{copy.patterns.loadingNarration}</p>
          <div className="h-12 animate-pulse rounded-md bg-surface-2" />
        </div>
      )}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
        <span className="font-bold">{fill(copy.patterns.meta, { k: pattern.k, n: pattern.n, period: periodLabel })}</span>
        <ConfidenceDots confidence={pattern.confidence} />
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="link" size="inline" aria-expanded={showWhy} aria-controls={whyId} onClick={() => setShowWhy((s) => !s)}>
          {showWhy ? copy.patterns.hideWhy : copy.patterns.why}
        </Button>
        <Button variant="quiet" size="sm" onClick={() => setAsking(true)}>
          {copy.patterns.notTrue}
        </Button>
      </div>
      {showWhy && <WhyPanel id={whyId} whyText={card?.whyText ?? ''} evidence={pattern.evidence} />}
      <NotTrueDialog open={asking} onOpenChange={setAsking} onHide={(r) => void hide(r)} />
    </article>
  );
}
