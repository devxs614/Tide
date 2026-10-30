'use client';

// The check-in sheet: what Maya sees after tapping "Check in". It walks her
// through four short steps (her words, possible feeling words, what might be
// behind it, what she needs) and saves one check-in at the end. If her words
// sound like a crisis, coaching stops: the check-in is saved without the
// text and the support screen opens instead. Her companion (if she has one)
// sits in the corner: it listens while she types and reacts when she saves.
import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { copy, fill, quadrantLabel } from '@/copy/en';
import { EMOTION_IDS, SIMPLE_EMOTION_IDS } from '@/data/emotions';
import { useAi } from '@/lib/ai/useAi';
import { now } from '@/lib/clock';
import { createCheckIn } from '@/lib/repo/checkins';
import { detectCrisis } from '@/lib/safety/detect';
import { useSettings } from '@/lib/settings';
import { localTimeLabel } from '@/lib/time';
import { useCheckInSheet, useDayModeSheet } from '@/lib/ui';
import type { Need } from '@/lib/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { emitCompanion } from '@/lib/companion/bus';
import { SIZES } from '@/lib/companion/registry';
import { useTypingSignal } from '@/lib/companion/typing';
import { useCompanion } from '@/lib/companion/useCompanion';
import { CompanionHost, afterCheckIn } from '@/components/companion/CompanionHost';
import { companionToastIcon } from '@/components/companion/companionToastIcon';
import { AllWords } from './AllWords';
import { BodyPath } from './BodyPath';
import { LeaveConfirm } from './LeaveConfirm';
import { StepBehind } from './StepBehind';
import { StepHearing } from './StepHearing';
import { StepNeed } from './StepNeed';
import { StepWhat } from './StepWhat';
import { bodyCues, initialState, isDirty, reducer } from './checkInState';
import type { LabelInputT } from '@/lib/ai/schemas';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';
import { db } from '@/lib/db';
import { CoachContext } from './CheckInCoach';
import type { CheckIn } from '@/lib/types';

// `coach` and `onSaved` are for onboarding's first check-in: hints at each
// step, and after saving, onboarding continues instead of the usual route.
export function CheckInSheet({ coach = false, onSaved }: { coach?: boolean; onSaved?: (checkIn: CheckIn) => void } = {}) {
  const router = useRouter();
  const { settings } = useSettings();
  const { open, closeCheckIn } = useCheckInSheet();
  const { openDayMode } = useDayModeSheet();
  const label = useAi('label');
  // Settings → Check-in decides where step 1 starts: words, body or map.
  const path = settings['checkin.defaultPath'];
  const [state, dispatch] = useReducer(reducer, path, (p) => (p === 'body' ? { ...initialState, step: 'body' as const } : p === 'map' ? reducer(initialState, { type: 'skipToMap' }) : initialState));
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [saving, setSaving] = useState(false);
  const mode = settings.communicationMode;
  const companion = useCompanion();
  const typing = useTypingSignal();
  const celebrate = useCelebrate();

  const close = () => {
    setConfirmLeave(false);
    closeCheckIn();
  };

  // Start fresh next time, but only after the sheet has slid away; resetting
  // right away would flash step 1 while the sheet is still fading out.
  const resetLabel = label.reset;
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      resetLabel();
      dispatch({ type: 'reset' });
      if (path === 'body') dispatch({ type: 'go', step: 'body' });
      if (path === 'map') dispatch({ type: 'skipToMap' });
    }, 350);
    return () => clearTimeout(t);
  }, [open, resetLabel, path]);

  const requestClose = () => (isDirty(state) ? setConfirmLeave(true) : close());

  const crisis = async () => {
    await createCheckIn({ text: state.text, emotions: [], energy: 0, pleasantness: 0, aiUsed: false, safetyTriggered: true });
    close();
    router.push('/support?crisis=1');
  };

  const findWords = async (input: Omit<LabelInputT, 'mode' | 'localTime' | 'vocabulary'>) => {
    dispatch({ type: 'loading' });
    const result = await label.run({ ...input, mode, localTime: localTimeLabel(now()), vocabulary: settings['checkin.vocabulary'] === 'simple' ? SIMPLE_EMOTION_IDS : EMOTION_IDS });
    if (result.safetyTriggered) return crisis();
    dispatch({ type: 'candidates', output: result.data, aiUsed: result.source !== 'fallback' });
  };

  const onNextFromWords = () => {
    if (detectCrisis(state.text)) return void crisis();
    void findWords({ text: state.text.trim() });
  };

  const onBodySubmit = () =>
    void findWords({ bodyCues: bodyCues(state), energyHint: state.energyHint, pleasantnessHint: state.comfortHint });

  const toggleEmotion = (id: string) => {
    if (state.selected.includes(id)) return dispatch({ type: 'select', ids: state.selected.filter((s) => s !== id) });
    if (state.selected.length >= 2) return void toast(copy.checkin.maxTwo);
    dispatch({ type: 'select', ids: [...state.selected, id] });
  };

  const save = async (need: Need) => {
    setSaving(true);
    const checkIn = await createCheckIn({
      text: state.text.trim() || undefined,
      bodyCues: state.bodyPlaces.length || state.bodyFeelings.length ? bodyCues(state) : undefined,
      emotions: state.selected,
      energy: state.point.energy,
      pleasantness: state.point.pleasantness,
      causes: state.causes.length ? state.causes : undefined,
      need,
      aiUsed: state.aiUsed,
    });
    setSaving(false);
    close();
    emitCompanion({ type: 'checkinSaved', quadrant: checkIn.quadrant });
    // A quiet pop for every check-in; the very first one gets a pearl.
    const first = (await db.checkins.count()) === 1;
    void celebrate(first ? 'firstTime' : 'checkinSaved', { feature: 'checkin', ownToast: !first });
    const reaction = afterCheckIn[checkIn.quadrant];
    if (need === 'keep') {
      toast(fill(copy.checkin.saved, { quadrant: quadrantLabel(checkIn.quadrant, mode) }), {
        icon: companionToastIcon(companion, reaction.expression ?? 'idle', reaction.reaction),
      });
    }
    if (onSaved) return onSaved(checkIn);
    if (need === 'adjust') openDayMode();
    if (need === 'regulate') router.push('/toolkit');
    if (need === 'talk') router.push('/support');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => (next ? undefined : requestClose())}>
        <SheetContent className="h-[94dvh]" aria-describedby={undefined}>
          <CoachContext value={coach}>
          <CompanionHost
            placement="checkin"
            size={SIZES.sm}
            listens={['typing', 'aiLoading', 'aiDone']}
            openingLine="checkin_listening"
            bubble="inline"
            noneAlt="nothing"
            className="shrink-0 px-5 pt-5 pr-28"
          />
          {state.step === 'what' && (
            <StepWhat
              text={state.text}
              onText={(text) => {
                dispatch({ type: 'text', text });
                typing();
              }}
              onNext={onNextFromWords}
              onNoWords={() => dispatch({ type: 'go', step: 'body' })}
              onSkipToMap={() => dispatch({ type: 'skipToMap' })}
            />
          )}
          {state.step === 'body' && (
            <BodyPath
              state={state}
              onToggle={(field, value) => dispatch({ type: 'toggleBody', field, value })}
              onHints={(hints) => dispatch({ type: 'hints', ...hints })}
              onSubmit={onBodySubmit}
              onBack={() => dispatch({ type: 'go', step: 'what' })}
            />
          )}
          {state.step === 'hearing' && (
            <StepHearing
              state={state}
              onToggleEmotion={toggleEmotion}
              onMove={(point) => dispatch({ type: 'move', point })}
              onNoneOfThese={() => dispatch({ type: 'go', step: 'all-words' })}
              onNext={() => dispatch({ type: 'go', step: settings['checkin.showCauses'] ? 'behind' : 'need' })}
            />
          )}
          {state.step === 'all-words' && (
            <AllWords
              selected={state.selected}
              onToggleEmotion={toggleEmotion}
              onBack={() => dispatch({ type: 'go', step: 'hearing' })}
            />
          )}
          {state.step === 'behind' && (
            <StepBehind
              causes={state.causes}
              onToggle={(cause) => dispatch({ type: 'toggleCause', cause })}
              onNext={() => dispatch({ type: 'go', step: 'need' })}
              onSkip={() => dispatch({ type: 'go', step: 'need' })}
            />
          )}
          {state.step === 'need' && <StepNeed onChoose={(need) => void save(need)} saving={saving} />}
          </CoachContext>
        </SheetContent>
      </Sheet>
      <LeaveConfirm open={confirmLeave} onKeep={() => setConfirmLeave(false)} onLeave={close} />
    </>
  );
}
