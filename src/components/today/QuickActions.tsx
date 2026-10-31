'use client';

// Today's quick actions (v2 spec 12): four big tiles for the things Maya
// reaches for most. Check in opens the sheet; Regulate opens the Toolkit,
// which already sorts itself for her latest check-in; Focus asks which task
// first; Close the day opens two hours before her usual closing time and
// before that just says "later", so it never pushes. Always two by two:
// Today lives in the phone-width column even on a laptop.
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { HeartPulse, Moon, Timer, WavesHorizontal } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { useCheckInSheet } from '@/lib/ui';
import { IconTile } from '@/components/ui/icon-tile';
import { WhenOpened } from '@/components/shell/WhenOpened';

const FocusPicker = dynamic(() => import('./FocusPicker').then((m) => m.FocusPicker), { ssr: false });

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Same evening window as the evening card, opened 90 minutes earlier.
export function closeDayOpen(nowTs: number, wrapTime: string, dayStart: string): boolean {
  const d = new Date(nowTs);
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes >= minutesOf(wrapTime) - 120 || minutes < minutesOf(dayStart);
}

export function QuickActions({ nowTs }: { nowTs: number }) {
  const { settings } = useSettings();
  const { openCheckIn } = useCheckInSheet();
  const [picking, setPicking] = useState(false);
  const canClose = closeDayOpen(nowTs, settings['day.wrapTime'], settings['day.start']);
  const q = copy.today.quick;
  return (
    <section aria-label={q.label} data-demo-id="quick-actions" className="grid grid-cols-2 gap-3">
      <IconTile icon={WavesHorizontal} label={q.checkIn} onClick={openCheckIn} />
      <IconTile icon={HeartPulse} label={q.regulate} href="/toolkit" />
      <IconTile icon={Timer} label={q.focus} onClick={() => setPicking(true)} />
      <IconTile icon={Moon} label={canClose ? q.closeDay : q.closeDayLater} href="/wrap" disabled={!canClose} />
      <WhenOpened open={picking}>
        <FocusPicker open={picking} onOpenChange={setPicking} />
      </WhenOpened>
    </section>
  );
}
