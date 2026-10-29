'use client';

// The Toolkit tab: short strategies sorted by what has worked for Maya and
// what suits how she feels now (her check-in from the last six hours).
// "Works for you" pulls up the ones with a real track record. Families are
// tabs, and the tab that opens first is the family of the best match.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy, fill, quadrantLabel } from '@/copy/en';
import { STRATEGY_FAMILIES } from '@/data/strategies';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { recentCheckIn } from '@/lib/latestState';
import { useSettings } from '@/lib/settings';
import { rankStrategies } from '@/lib/strategyRank';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TalkToAPersonButton } from '@/components/safety/TalkToAPersonButton';
import { FAMILY_ICONS } from './familyIcons';
import { StrategyCard } from './StrategyCard';
import { QuadrantDot } from '@/components/ui/QuadrantDot';

const href = (id: string) => `/toolkit/${id}?context=toolkit`;

export function ToolkitScreen() {
  const { settings } = useSettings();
  const latest = useLiveQuery(async () => (await recentCheckIn(now())) ?? null, []);
  const uses = useLiveQuery(() => db.strategyUses.toArray(), []);
  const [showAll, setShowAll] = useState(false);
  const [family, setFamily] = useState<string | null>(null);
  if (latest === undefined || !uses) return null;

  const quadrant = latest?.quadrant;
  const ranked = rankStrategies({ quadrant, uses, context: 'toolkit', now: now() });
  const visible = quadrant && !showAll ? ranked.filter((r) => r.strategy.suits.includes(quadrant)) : ranked;
  const worksForYou = ranked.filter((r) => r.n >= 2 && r.better / r.n >= 0.6 && !r.suppressed);
  const openFamily = family ?? visible[0]?.strategy.family ?? 'move';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="flex flex-wrap items-center gap-2 text-h2 font-bold">
          {quadrant ? (
            <>
              {copy.toolkit.headerNow}:
              <span className="inline-flex items-center gap-2">
                <QuadrantDot quadrant={quadrant} />
                {quadrantLabel(quadrant, settings.communicationMode)}
              </span>
            </>
          ) : (
            copy.toolkit.headerNone
          )}
        </h2>
        {quadrant && (
          <Button variant="link" size="inline" className="self-start" aria-pressed={showAll} onClick={() => setShowAll((s) => !s)}>
            {showAll ? copy.toolkit.showForNow : copy.toolkit.showAll}
          </Button>
        )}
      </div>

      {worksForYou.length > 0 && (
        <section aria-labelledby="works-heading" className="flex flex-col gap-3">
          <h2 id="works-heading" className="text-h3 font-bold">
            {copy.toolkit.worksForYou}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {worksForYou.map((r) => (
              <li key={r.strategy.id}>
                <StrategyCard strategy={r.strategy} better={r.better} n={r.n} href={href(r.strategy.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Tabs value={openFamily} onValueChange={setFamily}>
        <TabsList aria-label={copy.toolkit.familyTabsLabel}>
          {STRATEGY_FAMILIES.map((f) => {
            const Icon = FAMILY_ICONS[f];
            return (
              <TabsTrigger key={f} value={f}>
                <Icon aria-hidden />
                {copy.toolkit.families[f].name}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {STRATEGY_FAMILIES.map((f) => {
          const list = visible.filter((r) => r.strategy.family === f);
          return (
            <TabsContent key={f} value={f} className="flex flex-col gap-3">
              <p className="text-ink-soft">{copy.toolkit.families[f].body}</p>
              {list.length === 0 && (
                <p className="text-ink-soft">
                  {fill(copy.toolkit.noneForNow, { family: copy.toolkit.families[f].name })}
                </p>
              )}
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {list.map((r) => (
                  <li key={r.strategy.id}>
                    <StrategyCard strategy={r.strategy} better={r.better} n={r.n} href={href(r.strategy.id)} />
                  </li>
                ))}
              </ul>
            </TabsContent>
          );
        })}
      </Tabs>

      <TalkToAPersonButton />
    </div>
  );
}
