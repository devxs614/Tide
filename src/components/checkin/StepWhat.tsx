'use client';

// Step 1, "What's going on?": a big text box for Maya's own words, however
// messy, with dictation where the browser supports it. Two ways out if words
// won't come: start from the body, or skip straight to the map.
import { copy, fill } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { DictateButton } from '@/components/ui/DictateButton';
import { StepHeader } from './StepHeader';
import { CheckInCoach } from './CheckInCoach';

interface Props {
  text: string;
  onText: (text: string) => void;
  onNext: () => void;
  onNoWords: () => void;
  onSkipToMap: () => void;
}

export function StepWhat({ text, onText, onNext, onNoWords, onSkipToMap }: Props) {
  const ready = text.trim().length >= 3;
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-4">
        <StepHeader title={copy.checkin.step1Title} stepNumber={1} />
        <CheckInCoach>{copy.ob.coachText}</CheckInCoach>
        <div className="flex flex-col gap-2">
          <label htmlFor="checkin-text" className="font-bold">
            {copy.checkin.step1Label}
          </label>
          <textarea
            id="checkin-text"
            rows={4}
            maxLength={600}
            value={text}
            onChange={(e) => onText(e.target.value)}
            placeholder={copy.checkin.step1Placeholder}
            className="w-full resize-y rounded-input border border-line bg-surface-2 p-3 text-body text-ink placeholder:text-ink-soft"
          />
          {text.length > 450 && (
            <p className="text-caption text-ink-soft" aria-live="polite">
              {fill(copy.checkin.charCount, { n: text.length })}
            </p>
          )}
          <DictateButton value={text} onChange={onText} />
        </div>
        <Button variant="link" size="inline" className="self-start" onClick={onNoWords}>
          {copy.checkin.noWords}
        </Button>
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-5 sm:flex-row-reverse">
        <Button className="sm:flex-1" disabled={!ready} onClick={onNext}>
          {copy.global.next}
        </Button>
        <Button variant="secondary" className="sm:flex-1" onClick={onSkipToMap}>
          {copy.checkin.skipToMap}
        </Button>
      </div>
    </>
  );
}
