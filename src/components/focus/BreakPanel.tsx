'use client';

// "Take a 2-minute break" from a refocus nudge (v2.1 F-07): the timer is
// paused, a soft countdown runs, and a Move strategy is suggested for the
// two minutes. "Back to it" resumes the block; nothing happens on its own
// when the two minutes are up.
import { useEffect, useState } from 'react';
import { fill } from '@/copy/en';
import { nudgeCopy as t } from '@/copy/nudgeCopy';
import { getStrategy } from '@/data/strategies';
import { now } from '@/lib/clock';
import { formatCountdown } from '@/lib/time';
import { Button } from '@/components/ui/button';

export function BreakPanel({ until, onBack }: { until: number; onBack: () => void }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => redraw((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const idea = getStrategy('m-shake-20');
  return (
    <section aria-labelledby="break-title" className="card flex w-full max-w-sm flex-col gap-2 p-4">
      <h2 id="break-title" className="text-h3 font-bold">
        {t.breakTitle}
      </h2>
      <p aria-live="off" className="text-lead font-bold">
        {fill(t.breakLeft, { time: formatCountdown(until - now()) })}
      </p>
      {idea && <p className="text-ink-soft">{fill(t.breakIdea, { strategy: idea.name, summary: idea.summary })}</p>}
      <Button onClick={onBack}>{t.backToIt}</Button>
    </section>
  );
}
