'use client';

// The gentle offer of a lighter day, shown only when Maya's latest check-in
// today was low (Ebb), a lot (strong Surge), or she asked to adjust. "Not
// now" hides it until her next check-in; it never nags.
import { byMode, copy } from '@/copy/en';
import type { BannerReason } from '@/lib/daymode';
import { useSettings } from '@/lib/settings';
import { useDayModeSheet } from '@/lib/ui';
import { Button } from '@/components/ui/button';

const TEXT = {
  ebb: copy.today.dayModeBannerEbb,
  surge: copy.today.dayModeBannerSurge,
  adjust: copy.today.dayModeBannerAdjust,
};

export function DayModeBanner({ reason, checkInId }: { reason: BannerReason; checkInId: string }) {
  const { settings, update } = useSettings();
  const { openDayMode } = useDayModeSheet();
  return (
    <section aria-label={copy.dayMode.title} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <p className="text-lead">{byMode(TEXT[reason], settings.communicationMode)}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={openDayMode}>{copy.today.showMe}</Button>
        <Button variant="quiet" onClick={() => void update('dayModeBannerDismissedFor', checkInId)}>
          {copy.global.notNow}
        </Button>
      </div>
    </section>
  );
}
