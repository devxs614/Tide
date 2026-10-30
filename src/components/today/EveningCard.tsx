'use client';

// The evening card on Today (v2 spec 12): from half an hour before Maya's
// usual closing time, "Ready to close the day? About 3 minutes." with "Not
// tonight", which hides it until tomorrow. Once the day is closed it says so
// and offers to reopen the summary. Never a reminder, never a nag.
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { Moon } from 'lucide-react';
import { copy } from '@/copy/en';
import { getWrap, wrapDateFor } from '@/lib/repo/dayWraps';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function EveningCard({ nowTs }: { nowTs: number }) {
  const { settings, update } = useSettings();
  const date = wrapDateFor(nowTs, settings['day.start']);
  const wrap = useLiveQuery(() => getWrap(date), [date]);
  const d = new Date(nowTs);
  const minutes = d.getHours() * 60 + d.getMinutes();
  // Evening: from wrapTime − 30 min until midnight, and after midnight until
  // the day starts (that's still "tonight").
  const evening = minutes >= minutesOf(settings['day.wrapTime']) - 30 || minutes < minutesOf(settings['day.start']);
  if (!evening || settings['wrap.eveningHiddenFor'] === date) return null;

  if (wrap?.completedAt) {
    return (
      <section className="card-flat flex items-center gap-3 p-4">
        <Moon aria-hidden className="size-5 text-ink-soft" />
        <p className="flex-1 font-bold">{copy.wrap.dayClosed}</p>
        <Button variant="quiet" size="sm" asChild>
          <Link href="/wrap?reopen=1">{copy.wrap.reopen}</Link>
        </Button>
      </section>
    );
  }
  return (
    <section aria-labelledby="evening-card" className="card flex flex-col gap-2 p-4">
      <h2 id="evening-card" className="text-h3 font-extrabold">
        {copy.wrap.eveningTitle}
      </h2>
      <p className="text-ink-soft">{copy.wrap.eveningBody}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/wrap">{copy.wrap.closeDay}</Link>
        </Button>
        <Button variant="secondary" onClick={() => void update('wrap.eveningHiddenFor', date)}>
          {copy.wrap.notTonight}
        </Button>
      </div>
    </section>
  );
}
