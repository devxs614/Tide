'use client';

// The strategy runner: the steps (each can be read aloud), the interactive
// tool, then the one re-check question. It records one StrategyUse with the
// context it was opened from (toolkit, unstick or bridge) and the task or
// transition it was for, then sends Maya back where she came from.
import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { copy } from '@/copy/en';
import { getStrategy } from '@/data/strategies';
import { db } from '@/lib/db';
import { recordStrategyUse } from '@/lib/repo/strategies';
import type { RecheckResult, StrategyContext } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { TalkToAPersonButton } from '@/components/safety/TalkToAPersonButton';
import { ReCheck } from './ReCheck';
import { StrategyMeta } from './StrategyMeta';
import { ToolArea } from './ToolArea';
import { SIZES, type Expression } from '@/lib/companion/registry';
import { CompanionHost } from '@/components/companion/CompanionHost';

export function returnPath(context: StrategyContext, refId?: string): string {
  if (context === 'unstick' && refId) return `/tasks?unstick=${refId}`;
  if (context === 'bridge' && refId) return `/?bridge=${refId}`;
  return '/toolkit';
}

// The companion beside the answer (v2 spec 9): glad when it helped, calm
// when it's the same, soft and close when it's worse. Never disappointed.
const AFTER_FACE: Record<RecheckResult, Expression> = { better: 'happy', same: 'calm', worse: 'soft' };

const AFTER: Record<RecheckResult, string> = {
  better: copy.toolkit.better,
  same: copy.toolkit.same,
  worse: copy.toolkit.worse,
};

export function StrategyRunner({ id, context, refId }: { id: string; context: StrategyContext; refId?: string }) {
  const router = useRouter();
  const strategy = getStrategy(id);
  const task = useLiveQuery(async () => (context === 'unstick' && refId ? ((await db.tasks.get(refId)) ?? null) : null), [context, refId]);
  const [phase, setPhase] = useState<'doing' | 'recheck' | 'after'>('doing');
  const [result, setResult] = useState<RecheckResult | undefined>();
  const [saving, setSaving] = useState(false);

  if (!strategy) {
    return (
      <div className="flex flex-col gap-3">
        <p>{copy.toolkit.notFound}</p>
        <Link href="/toolkit" className="text-primary underline underline-offset-4">
          {copy.toolkit.backToToolkit}
        </Link>
      </div>
    );
  }

  const answer = async (r: RecheckResult | undefined) => {
    setSaving(true);
    await recordStrategyUse({
      strategyId: strategy.id,
      context,
      taskId: context === 'unstick' ? refId : undefined,
      transitionId: context === 'bridge' ? refId : undefined,
      result: r,
    });
    setSaving(false);
    if (!r) return router.push(returnPath(context, refId));
    setResult(r);
    setPhase('after');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-h1 font-bold">{strategy.name}</h2>
        <StrategyMeta strategy={strategy} />
        <p className="text-ink-soft">{strategy.summary}</p>
      </div>

      <section aria-labelledby="steps-heading" className="flex flex-col gap-2">
        <h3 id="steps-heading" className="font-bold">
          {copy.toolkit.steps}
        </h3>
        <ol className="flex flex-col gap-1">
          {/* Steps can repeat ("Hold for 4." comes twice in box breathing), so
              the position is the key; this list never reorders. */}
          {strategy.steps.map((step, i) => (
            <li key={i} className="flex flex-wrap items-center gap-x-2">
              <span className="font-bold">{i + 1}.</span>
              <span className="flex-1">{step}</span>
              <ReadAloudButton text={step} />
            </li>
          ))}
        </ol>
      </section>

      {/* Wait for the task (when there is one) so the message tool can put
          its title into the template on first render. */}
      {phase === 'doing' && task !== undefined && (
        <ToolArea strategy={strategy} context={context} taskTitle={task?.title} onDone={() => setPhase('recheck')} />
      )}
      {phase === 'recheck' && <ReCheck onAnswer={(r) => void answer(r)} saving={saving} />}
      {phase === 'after' && result && (
        <section aria-live="polite" className="flex flex-col gap-3 card p-4">
          <div className="flex items-center gap-3">
            <CompanionHost placement="toolkit" size={SIZES.sm} base={AFTER_FACE[result]} bubble="none" noneAlt="nothing" decorative />
            <p className="flex-1 text-lead">{AFTER[result]}</p>
          </div>
          <Button onClick={() => router.push(returnPath(context, refId))}>{copy.toolkit.continue}</Button>
        </section>
      )}

      <TalkToAPersonButton />
    </div>
  );
}
