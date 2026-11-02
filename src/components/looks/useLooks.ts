'use client';

// Trying looks (v2.1 F-11): the first try saves the person's own values in
// `appearance.lookSnapshot`; trying another keeps that snapshot; "Keep it"
// drops it; "Back to my look" puts every value back exactly. "Next look"
// goes in the list's order, "Surprise me" in the day's shuffle.
import { getLook, LOOKS, type LookId } from '@/data/looks';
import { now } from '@/lib/clock';
import { nextSurprise, snapshotOf, surpriseOrder } from '@/lib/looks';
import { useSettings } from '@/lib/settings';
import { toISODate } from '@/lib/time';

export function useLooks() {
  const { settings, updateMany } = useSettings();
  const snap = settings['appearance.lookSnapshot'];
  const trying = (snap?.trying as LookId | undefined) ?? null;

  const tryLook = (id: LookId, cursor = snap?.cursor) => {
    const look = getLook(id);
    if (!look) return;
    const values = snap?.values ?? snapshotOf(settings);
    void updateMany({ ...look.values, 'appearance.lookSnapshot': { values, trying: id, cursor } });
  };

  return {
    trying,
    tryLook,
    keep: () => void updateMany({ 'appearance.lookSnapshot': null }),
    back: () => snap && void updateMany({ ...snap.values, 'appearance.lookSnapshot': null }),
    next: () => {
      const at = LOOKS.findIndex((l) => l.id === trying);
      tryLook(LOOKS[(at + 1) % LOOKS.length].id);
    },
    surprise: () => {
      const pick = nextSurprise(surpriseOrder(toISODate(now())), snap?.cursor ?? -1, trying);
      tryLook(pick.id, pick.cursor);
    },
  };
}
