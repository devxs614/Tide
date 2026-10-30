'use client';

// The morning card on Today (v2 spec 12): if last night's Close the day
// chose one thing to start with, from the start of the day until noon it
// says "Your one thing today" and its first step, ready to start.
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy, fill } from '@/copy/en';
import { db } from '@/lib/db';
import { getWrap } from '@/lib/repo/dayWraps';
import { useSettings } from '@/lib/settings';
import { addDays, toISODate } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { LazyCompanion } from '@/components/companion/LazyCompanion';
import { SIZES } from '@/lib/companion/registry';
import { useCompanionShown } from '@/lib/companion/useCompanion';

export function MorningCard({ nowTs }: { nowTs: number }) {
  const { settings, update } = useSettings();
  // Just a picture here (no line, no voice), so it stays off Today's first load.
  const withCompanion = useCompanionShown('today');
  const today = toISODate(nowTs);
  const yesterday = toISODate(addDays(nowTs, -1));
  const anchor = useLiveQuery(async () => {
    const wrap = await getWrap(yesterday);
    if (!wrap?.completedAt || !wrap.anchorTaskId) return null;
    const task = await db.tasks.get(wrap.anchorTaskId);
    return task && task.status !== 'done' ? { task, step: wrap.anchorFirstStep ?? task.firstStep } : null;
  }, [yesterday]);
  const [h, m] = settings['day.start'].split(':').map(Number);
  const d = new Date(nowTs);
  const minutes = d.getHours() * 60 + d.getMinutes();
  const morning = minutes >= h * 60 + (m || 0) && d.getHours() < 12;
  if (!anchor || !morning || settings['wrap.morningHiddenFor'] === today) return null;

  return (
    <section aria-labelledby="morning-card" className="card flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <h2 id="morning-card" className="flex-1 text-h3 font-extrabold">
          {copy.wrap.morningTitle}
        </h2>
        {withCompanion && <LazyCompanion size={SIZES.sm} expression="waving" decorative />}
      </div>
      <p className="font-bold">{fill(copy.wrap.morningThing, { title: anchor.task.title })}</p>
      {anchor.step && <p>{fill(copy.wrap.morningStep, { step: anchor.step })}</p>}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/focus/${anchor.task.id}`}>{copy.wrap.startWithThis}</Link>
        </Button>
        <Button variant="secondary" onClick={() => void update('wrap.morningHiddenFor', today)}>
          {copy.wrap.notNow}
        </Button>
      </div>
    </section>
  );
}
