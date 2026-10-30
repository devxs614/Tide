'use client';

// Close the day (v2 spec 14): thirteen short steps with the companion, about
// three minutes, every one skippable. The sky behind moves from golden hour
// to night as the steps go by. Progress is saved after each step, so leaving
// and coming back resumes where Maya was; a closed day can be reopened.
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { now } from '@/lib/clock';
import { emitCompanion } from '@/lib/companion/bus';
import { SIZES, type Expression } from '@/lib/companion/registry';
import { getWrap, saveWrapStep, startWrap, wrapDateFor } from '@/lib/repo/dayWraps';
import { useSettings } from '@/lib/settings';
import { skyColors, type SkyPhase } from '@/lib/shore/sky';
import { useThemeScheme } from '@/lib/theme/useThemeScheme';
import { loadDayFacts } from '@/lib/wrap/facts';
import type { DayWrap } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CompanionHost } from '@/components/companion/CompanionHost';
import { WrapStep } from './WrapStep';

export const WRAP_STEPS = 13;

function phaseFor(step: number): SkyPhase {
  return step <= 4 ? 'golden' : step <= 9 ? 'dusk' : 'night';
}

function faceFor(step: number): Expression {
  if (step === 6) return 'soft';
  if (step >= 13) return 'sleeping';
  return step >= 10 ? 'sleepy' : 'calm';
}

export function WrapScreen({ reopen = false }: { reopen?: boolean }) {
  const router = useRouter();
  const { settings } = useSettings();
  const scheme = useThemeScheme();
  const date = useMemo(() => wrapDateFor(now(), settings['day.start']), [settings]);
  const [ready, setReady] = useState(false);
  const wrap = useLiveQuery(() => getWrap(date), [date]);
  const facts = useLiveQuery(() => loadDayFacts(date), [date]);

  useEffect(() => {
    void startWrap(date).then((w) => {
      // A closed day reopens at the summary, where the reflection can be
      // looked at again; one in progress resumes where it stopped.
      if (reopen && w.completedAt) void saveWrapStep(date, { step: 11 });
      setReady(true);
    });
    emitCompanion({ type: 'wrapStarted' });
  }, [date, reopen]);

  if (!ready || !wrap || !facts) return null;
  const step = Math.min(WRAP_STEPS, Math.max(1, wrap.step));
  const go = (n: number) => void saveWrapStep(date, { step: Math.min(WRAP_STEPS, Math.max(1, n)) });
  const save = (patch: Partial<DayWrap>) => void saveWrapStep(date, patch);
  const sky = skyColors('time', phaseFor(step), scheme === 'dark');
  const own = step === 1 || step === WRAP_STEPS;

  return (
    <div className="flow-enter flex min-h-dvh flex-col" style={{ '--wrap-top': sky.top, '--wrap-bottom': sky.bottom } as CSSProperties}>
      <div className="flex flex-col gap-3 bg-linear-to-b from-(--wrap-top) to-(--wrap-bottom) px-5 pt-4 pb-6">
        <div className="flex items-center gap-2">
          <Button variant="quiet" size="sm" onClick={() => router.push('/')}>
            <X aria-hidden />
            {copy.wrap.close}
          </Button>
          {!own && (
            <Button variant="quiet" size="sm" className="ml-auto" onClick={() => go(step + 1)}>
              {copy.wrap.skipStep}
            </Button>
          )}
        </div>
        <ProgressBar value={step} max={WRAP_STEPS} label={fill(copy.wrap.stepOf, { n: step, total: WRAP_STEPS })} />
        <div className="flex justify-center">
          <CompanionHost
            placement="wrap"
            size={own ? SIZES.lg : SIZES.md}
            base={faceFor(step)}
            listens={['checkinSaved', 'aiLoading', 'aiDone', 'wrapEnded']}
            openingLine={step === 1 ? 'wrap_start' : undefined}
            bubble="right"
            noneAlt="nothing"
          />
        </div>
      </div>
      <div key={step} className="flow-enter flex flex-1 flex-col gap-4 p-5">
        <WrapStep step={step} wrap={wrap} facts={facts} save={save} next={() => go(step + 1)} />
      </div>
      {!own && (
        <div className="flex gap-2 border-t-2 border-line p-5">
          <Button variant="secondary" className="flex-1" onClick={() => go(step - 1)}>
            {copy.wrap.back}
          </Button>
          <Button className="flex-1" onClick={() => go(step + 1)}>
            {copy.wrap.next}
          </Button>
        </div>
      )}
    </div>
  );
}
