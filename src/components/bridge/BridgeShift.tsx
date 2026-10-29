'use client';

// Bridge step 2, Shift: one short strategy (three minutes or less), the one
// the AI picked from the top of Maya's ranking. "Something else" shows the
// other top choices. If she already did one for this switch, it says so.
import { useState } from 'react';
import { Check } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { getStrategy } from '@/data/strategies';
import type { BridgeOutputT } from '@/lib/ai/schemas';
import type { RankedStrategy } from '@/lib/strategyRank';
import { Button } from '@/components/ui/button';
import { StrategyMeta } from '@/components/toolkit/StrategyMeta';

interface Props {
  plan: { ai: BridgeOutputT; candidates: RankedStrategy[] } | null;
  doneNames: string[];
  onStart: (strategyId: string) => void;
}

function Option({ id, onStart, better, n }: { id: string; onStart: (id: string) => void; better?: number; n?: number }) {
  const strategy = getStrategy(id);
  if (!strategy) return null;
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
      <span className="font-bold">{strategy.name}</span>
      <span className="text-ink-soft">{strategy.summary}</span>
      <StrategyMeta strategy={strategy} />
      {n ? <span className="text-caption font-bold">{fill(copy.toolkit.workedCount, { k: better ?? 0, n })}</span> : null}
      <Button className="self-start" onClick={() => onStart(id)}>
        {copy.bridge.start}
      </Button>
    </div>
  );
}

export function BridgeShift({ plan, doneNames, onStart }: Props) {
  const [others, setOthers] = useState(false);
  const chosen = plan?.ai.strategyId;
  const chosenStats = plan?.candidates.find((c) => c.strategy.id === chosen);
  return (
    <section aria-labelledby="bridge-shift" className="flex flex-col gap-2">
      <h3 id="bridge-shift" className="text-h3 font-bold">
        2 · {copy.bridge.shift}
      </h3>
      {doneNames.map((name) => (
        <p key={name} className="flex items-center gap-2">
          <Check className="size-4 text-primary" aria-hidden />
          {fill(copy.bridge.didStrategy, { name })}
        </p>
      ))}
      {chosen && <Option id={chosen} onStart={onStart} better={chosenStats?.better} n={chosenStats?.n} />}
      {plan && !others && (
        <Button variant="link" size="inline" className="self-start" onClick={() => setOthers(true)}>
          {copy.bridge.somethingElse}
        </Button>
      )}
      {plan &&
        others &&
        plan.candidates
          .filter((c) => c.strategy.id !== chosen)
          .map((c) => <Option key={c.strategy.id} id={c.strategy.id} onStart={onStart} better={c.better} n={c.n} />)}
    </section>
  );
}
