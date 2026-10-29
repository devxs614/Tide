'use client';

// The Bridge card on Today, shown when the next event is 15 minutes away:
// "Chemistry lab → Calculus · leave in 8 min", the "has felt hard" line when
// Maya's own data supports it, a preview of the three steps, and "Get ready".
import { ArrowRightLeft } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { fromTitle, KIND_WORDS } from '@/lib/bridge';
import { useBridgeSheet } from '@/lib/ui';
import { Button } from '@/components/ui/button';
import type { UpcomingBridge } from './useUpcomingBridge';

export function bridgeNames(b: UpcomingBridge) {
  return { from: fromTitle(b, copy.bridge.whatYouAreDoing), to: b.to.title };
}

export function hardLine(b: UpcomingBridge): string | null {
  if (!b.hard) return null;
  return fill(copy.bridge.patternLine, {
    from: KIND_WORDS[b.fromKind] ?? b.fromKind,
    to: KIND_WORDS[b.to.kind] ?? b.to.kind,
    k: b.hard.k,
    n: b.hard.n,
  });
}

export function BridgeCard({ bridge }: { bridge: UpcomingBridge }) {
  const { openBridge } = useBridgeSheet();
  const { from, to } = bridgeNames(bridge);
  const line = hardLine(bridge);
  return (
    <section
      aria-label={fill(copy.bridge.cardLabel, { from, to, m: bridge.minutesUntil })}
      className="flex flex-col gap-3 rounded-card border-2 border-primary bg-surface p-4"
    >
      <p className="flex items-start gap-2 text-lead font-bold">
        <ArrowRightLeft className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
        {fill(copy.bridge.card, { from, to, m: bridge.minutesUntil })}
      </p>
      {line && <p>{line}</p>}
      <ol className="flex flex-wrap gap-x-4 text-ink-soft">
        <li>1 · {copy.bridge.close}</li>
        <li>2 · {copy.bridge.shift}</li>
        <li>3 · {copy.bridge.startStep}</li>
      </ol>
      <Button className="self-start" onClick={() => openBridge(bridge.to.id)}>
        {copy.bridge.getReady}
      </Button>
    </section>
  );
}
