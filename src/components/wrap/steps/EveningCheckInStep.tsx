'use client';

// Step 2, an evening check-in (optional): the mood map and a few quick
// words. "Save" makes a regular check-in, so patterns and the companion see
// it like any other; skipping is fine.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { getEmotion } from '@/data/emotions';
import { emitCompanion } from '@/lib/companion/bus';
import { createCheckIn } from '@/lib/repo/checkins';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { MoodMap, type MapPoint } from '@/components/checkin/MoodMap';
import type { WrapStepProps } from '../WrapStep';

const QUICK = ['calm', 'content', 'exhausted', 'drained', 'relaxed', 'stressed', 'grateful', 'worried', 'proud', 'restless', 'settled', 'foggy'];

export function EveningCheckInStep({ wrap, save, next }: WrapStepProps) {
  const [point, setPoint] = useState<MapPoint>({ energy: 0, pleasantness: 0 });
  const [words, setWords] = useState<string[]>([]);
  const toggle = (id: string) => setWords((w) => (w.includes(id) ? w.filter((x) => x !== id) : w.length < 2 ? [...w, id] : w));

  const saveCheckIn = async () => {
    const checkIn = await createCheckIn({ emotions: words, ...point, aiUsed: false });
    save({ eveningCheckInId: checkIn.id });
    emitCompanion({ type: 'checkinSaved', quadrant: checkIn.quadrant });
    next();
  };

  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.checkinTitle}</h1>
      <MoodMap value={point} onChange={setPoint} />
      <div role="group" aria-label={copy.wrap.quickWords} className="flex flex-wrap gap-2">
        {QUICK.map((id) => {
          const emotion = getEmotion(id);
          return emotion ? <Chip key={id} label={emotion.word} pressed={words.includes(id)} onToggle={() => toggle(id)} /> : null;
        })}
      </div>
      <Button size="block" disabled={!!wrap.eveningCheckInId} onClick={() => void saveCheckIn()}>
        {copy.wrap.checkinSave}
      </Button>
    </>
  );
}
