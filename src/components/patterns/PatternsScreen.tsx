'use client';

// "What works for you": the check-in calendar, the patterns the engine found
// (worded by the AI or the template), the strategies that helped, and the
// hardest switch. Everything is computed on the device from Maya's own
// records for the chosen period; nothing here is a guess about who she is.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { copy } from '@/copy/en';
import { now } from '@/lib/clock';
import { computePatterns } from '@/lib/patterns/engine';
import { loadPatternInput } from '@/lib/patterns/data';
import { transitionGroups } from '@/lib/patterns/rules/hardTransition';
import { strategyTallies } from '@/lib/patterns/rules/strategyEffect';
import { useReducedMotionPref, useSettings } from '@/lib/settings';
import { TalkToAPersonButton } from '@/components/safety/TalkToAPersonButton';
import { PatternCard } from './PatternCard';
import { PeriodDots } from './PeriodDots';
import { TopStrategies } from './TopStrategies';
import { TransitionsSummary } from './TransitionsSummary';
import { useNarration } from './useNarration';

type Period = 'week' | 'month';

export function PatternsScreen() {
  const { settings } = useSettings();
  const reduce = useReducedMotionPref();
  const [period, setPeriod] = useState<Period>('month');
  const windowDays = period === 'week' ? 7 : 28;
  const data = useLiveQuery(() => loadPatternInput(now(), windowDays), [windowDays]);
  const patterns = data ? computePatterns(data) : [];
  const cards = useNarration(patterns, settings.communicationMode);
  if (!data) return null;
  const periodLabel = copy.patterns.periods[period];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-h1 font-bold">{copy.patterns.title}</h2>
        <div role="group" aria-label={copy.patterns.periodLabel} className="flex gap-2">
          {(['week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`min-h-12 rounded-full border px-4 ${period === p ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface'}`}
            >
              {copy.patterns.periods[p]}
            </button>
          ))}
        </div>
      </div>

      <PeriodDots checkins={data.checkins} nowTs={data.now} days={windowDays} />

      <section aria-labelledby="patterns-heading" className="flex flex-col gap-3">
        <h2 id="patterns-heading" className="text-h3 font-bold">
          {copy.patterns.patternsHeading}
        </h2>
        {patterns.length === 0 ? (
          <div className="flex flex-col gap-1 rounded-card bg-surface-2 p-4">
            <p>{copy.patterns.notEnough}</p>
            <p className="text-ink-soft">{copy.patterns.notEnoughProgress}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {/* framer-motion is only used here (the card fading out after "Not
                true for me"), so its reduced-motion switch lives here too. */}
            <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
              <AnimatePresence initial={false}>
                {patterns.map((p, i) => (
                  <motion.li
                    key={p.key}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <PatternCard pattern={p} card={cards[i]} periodLabel={periodLabel} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </MotionConfig>
          </ul>
        )}
      </section>

      <TopStrategies tallies={strategyTallies(data)} />
      <TransitionsSummary groups={transitionGroups(data)} />

      <footer className="flex flex-col gap-3 border-t border-line pt-4">
        <p className="text-ink-soft">{copy.patterns.footer}</p>
        <TalkToAPersonButton />
      </footer>
    </div>
  );
}
