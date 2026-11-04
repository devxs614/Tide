'use client';

// Quick check-in (v2.3 Item 1): two taps instead of words. First the four
// states, each with its color, name and plain subtitle; then the four simple
// words for that state, or "Skip". It saves an ordinary check-in (marked
// `quick`), so Today, Day Mode, celebrations, patterns and the companion all
// react as they always do. No free text means no AI and nothing for the
// safety layer to check. Arrow keys move around the grid; Escape and Close
// close it, Back returns to the states.
import { useRef, useState, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { copy, fill, quadrantLabel } from '@/copy/en';
import { quickCheckInCopy as t } from '@/copy/quickCheckInCopy';
import { EMOTIONS, SIMPLE_EMOTION_IDS, type Emotion } from '@/data/emotions';
import { createCheckIn } from '@/lib/repo/checkins';
import { emitCompanion } from '@/lib/companion/bus';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';
import { closeQuickCheckIn, useQuickCheckInOpen } from '@/lib/checkin/quickCheckIn';
import { useSettings } from '@/lib/settings';
import { useCheckInSheet } from '@/lib/ui';
import type { Quadrant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const QUADRANTS: Quadrant[] = ['surge', 'swell', 'ebb', 'still'];
// "Skip" saves the middle of the state's corner of the map.
const CENTER: Record<Quadrant, { energy: number; pleasantness: number }> = {
  surge: { energy: 3, pleasantness: -3 },
  swell: { energy: 3, pleasantness: 3 },
  ebb: { energy: -3, pleasantness: -3 },
  still: { energy: -3, pleasantness: 3 },
};
const TINT: Record<Quadrant, string> = { surge: 'bg-surge-tint', swell: 'bg-swell-tint', ebb: 'bg-ebb-tint', still: 'bg-still-tint' };

export function QuickCheckInSheet() {
  const open = useQuickCheckInOpen();
  const { settings } = useSettings();
  const { openCheckIn } = useCheckInSheet();
  const celebrate = useCelebrate();
  const [quadrant, setQuadrant] = useState<Quadrant | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const mode = settings.communicationMode;
  const words: Emotion[] = quadrant ? EMOTIONS.filter((e) => e.quadrant === quadrant && SIMPLE_EMOTION_IDS.includes(e.id)) : [];

  const close = () => {
    closeQuickCheckIn();
    setQuadrant(null);
  };

  const save = async (word: Emotion | null) => {
    if (!quadrant) return;
    const at = word ?? CENTER[quadrant];
    const checkIn = await createCheckIn({ emotions: word ? [word.id] : [], energy: at.energy, pleasantness: at.pleasantness, aiUsed: false, quick: true });
    close();
    emitCompanion({ type: 'checkinSaved', quadrant: checkIn.quadrant });
    void celebrate('checkinSaved', { feature: 'checkin', ownToast: true });
    toast(fill(copy.checkin.saved, { quadrant: quadrantLabel(checkIn.quadrant, mode) }), {
      action: { label: t.addMore, onClick: () => openCheckIn() },
    });
  };

  // Two columns: left/right step by one, up/down by two.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 }[e.key];
    if (!step) return;
    e.preventDefault();
    const buttons = Array.from(grid.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(Math.max(0, i) + step + buttons.length) % buttons.length]?.focus();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent aria-describedby={undefined}>
        <div className="flex flex-col gap-4 px-5 pb-6">
          <SheetTitle>{quadrant ? t.quickWords : t.quickTitle[mode]}</SheetTitle>
          {!quadrant ? (
            <div ref={grid} role="group" aria-label={t.quick} onKeyDown={onKeyDown} className="grid grid-cols-2 gap-3">
              {QUADRANTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuadrant(q)}
                  className={cn('flex min-h-24 flex-col items-start justify-center gap-1 rounded-card border-2 border-line p-3 text-left', TINT[q])}
                >
                  <span className="font-display text-lead font-extrabold text-ink">{copy.quadrants[q].name}</span>
                  <span className="text-caption text-ink-soft">{copy.quadrants[q].subtitle}</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {words.map((w) => (
                  <Button key={w.id} variant="secondary" onClick={() => void save(w)}>
                    {w.word}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void save(null)}>{t.skip}</Button>
                <Button variant="quiet" data-nav="back" onClick={() => setQuadrant(null)}>
                  {t.back}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
