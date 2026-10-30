'use client';

// Step 2, "Here's what I'm hearing": three suggested words (never
// preselected), the follow-up question that helps tell them apart, and the
// mood map. Maya can pick up to two words, move the dot, or open the full
// list with "None of these". The title follows the communication mode.
import { byMode, copy } from '@/copy/en';
import { getEmotion } from '@/data/emotions';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { EmotionCandidateCard } from './EmotionCandidateCard';
import { MoodMap, type MapPoint } from './MoodMap';
import { StepHeader } from './StepHeader';
import { canLeaveStepTwo, type CheckInState } from './checkInState';
import type { CSSProperties } from 'react';
import { CheckInCoach } from './CheckInCoach';

interface Props {
  state: CheckInState;
  onToggleEmotion: (id: string) => void;
  onMove: (p: MapPoint) => void;
  onNoneOfThese: () => void;
  onNext: () => void;
}

function Skeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-card bg-surface-2" />
      ))}
    </div>
  );
}

export function StepHearing({ state, onToggleEmotion, onMove, onNoneOfThese, onNext }: Props) {
  const { settings } = useSettings();
  const customWords = state.selected.filter((id) => id.startsWith('custom:'));
  const pickedFromList = state.selected.filter((id) => !id.startsWith('custom:') && !state.candidates.some((c) => c.id === id));
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-4">
        <StepHeader title={byMode(copy.checkin.step2Title, settings.communicationMode)} stepNumber={2} />
        <CheckInCoach>{copy.ob.coachWords}</CheckInCoach>
        <p aria-live="polite" className="text-ink-soft">
          {state.loading ? copy.checkin.loadingLabel : ''}
        </p>
        {state.loading && <Skeleton />}
        {!state.loading && state.candidates.length > 0 && (
          <>
            <p className="text-ink-soft">{copy.checkin.step2Hint}</p>
            <ul className="flex flex-col gap-3">
              {state.candidates.map((c, i) => {
                const emotion = getEmotion(c.id);
                if (!emotion) return null;
                return (
                  <li key={c.id} data-demo-id={`checkin-candidate-${c.id}`} className="stagger-in" style={{ '--i': i } as CSSProperties}>
                    <EmotionCandidateCard
                      word={emotion.word}
                      definition={c.definition}
                      quadrant={emotion.quadrant}
                      selected={state.selected.includes(c.id)}
                      onToggle={() => onToggleEmotion(c.id)}
                    />
                  </li>
                );
              })}
            </ul>
            {state.followUp && settings['checkin.showFollowUp'] && <p className="text-ink-soft">{state.followUp}</p>}
          </>
        )}
        {[...pickedFromList, ...customWords].length > 0 && (
          <p className="font-bold">
            {copy.checkin.selected}:{' '}
            {[...pickedFromList, ...customWords]
              .map((id) => (id.startsWith('custom:') ? id.slice(7) : (getEmotion(id)?.word ?? id)))
              .join(', ')}
          </p>
        )}
        {!state.loading && (
          <>
            <Button variant="link" size="inline" className="self-start" onClick={onNoneOfThese}>
              {copy.checkin.noneOfThese}
            </Button>
            <h3 className="font-bold">{copy.checkin.step2MapTitle}</h3>
            <MoodMap value={state.point} onChange={onMove} />
          </>
        )}
      </div>
      <div className="border-t border-line p-5">
        <Button size="block" disabled={!canLeaveStepTwo(state)} onClick={onNext} data-demo-id="checkin-next">
          {copy.global.next}
        </Button>
      </div>
    </>
  );
}
