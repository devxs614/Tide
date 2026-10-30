'use client';

// Step 8, "How should Tide talk to you?" (v2 spec 11.2): Gentle, Direct or
// Literal, each shown with its example line, said by the companion when
// there is one. Then the reading level the AI suggestions aim for.
import { copy } from '@/copy/en';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useSettings } from '@/lib/settings';
import type { CommunicationMode } from '@/lib/types';
import { CardButton } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Companion } from '@/components/companion/Companion';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

const MODES: CommunicationMode[] = ['gentle', 'direct', 'literal'];

export function TalkStep({ onNext }: StepProps) {
  const { settings, update } = useSettings();
  const profile = useCompanion();
  return (
    <StepFrame title={copy.ob.talkTitle} action={copy.ob.next} onAction={onNext}>
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{copy.ob.talkTitle}</legend>
        {MODES.map((m) => (
          <CardButton key={m} selected={settings.communicationMode === m} onClick={() => void update('communicationMode', m)} className="flex-row items-center gap-3">
            {profile.species && <Companion size={44} expression={settings.communicationMode === m ? 'happy' : 'idle'} decorative />}
            <span className="flex flex-col gap-1">
              <span className="font-display font-extrabold">{copy.settings.modes[m].name}</span>
              <span className="text-ink-soft">&ldquo;{copy.settings.modes[m].example}&rdquo;</span>
            </span>
          </CardButton>
        ))}
      </fieldset>
      <div className="flex flex-col gap-2">
        <span className="font-display font-extrabold">{copy.ob.readingLevel}</span>
        <SegmentedControl
          label={copy.ob.readingLevel}
          value={settings['language.readingLevel']}
          onChange={(v) => void update('language.readingLevel', v)}
          options={[
            { value: 'standard', label: copy.ob.readingLevels.standard },
            { value: 'simple', label: copy.ob.readingLevels.simple },
          ]}
        />
      </div>
    </StepFrame>
  );
}
