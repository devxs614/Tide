'use client';

// The wordless path, for when "how do you feel?" has no answer yet. Maya
// taps where she notices something and what it feels like, and sets two
// sliders; Tide turns that into a few words she can choose from. Nothing
// here needs typing.
import { copy } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { StepHeader } from './StepHeader';
import { ToggleChip } from './ToggleChip';
import type { CheckInState } from './checkInState';

interface Props {
  state: CheckInState;
  onToggle: (field: 'bodyPlaces' | 'bodyFeelings', value: string) => void;
  onHints: (hints: { energyHint?: number; comfortHint?: number }) => void;
  onSubmit: () => void;
  onBack: () => void;
}

function HintSlider(props: { id: string; label: string; min: string; max: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span id={props.id} className="font-bold">
        {props.label}
      </span>
      <Slider
        min={-5}
        max={5}
        step={1}
        value={[props.value]}
        onValueChange={(v) => props.onChange(v[0])}
        thumbLabelledBy={props.id}
        valueText={(v) => (v <= -3 ? props.min : v >= 3 ? props.max : String(v))}
      />
      <div className="flex justify-between text-caption text-ink-soft">
        <span>{props.min}</span>
        <span>{props.max}</span>
      </div>
    </div>
  );
}

export function BodyPath({ state, onToggle, onHints, onSubmit, onBack }: Props) {
  const { bodyPlaces, bodyFeelings, energySlider, comfortSlider } = copy.checkin;
  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-4">
        <StepHeader title={copy.checkin.bodyTitle} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">{copy.checkin.bodyWhere}</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bodyPlaces).map(([id, label]) => (
              <ToggleChip key={id} label={label} pressed={state.bodyPlaces.includes(id)} onToggle={() => onToggle('bodyPlaces', id)} />
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">{copy.checkin.bodyFeel}</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bodyFeelings).map(([id, label]) => (
              <ToggleChip key={id} label={label} pressed={state.bodyFeelings.includes(id)} onToggle={() => onToggle('bodyFeelings', id)} />
            ))}
          </div>
        </fieldset>
        <HintSlider
          id="body-energy"
          label={energySlider.label}
          min={energySlider.min}
          max={energySlider.max}
          value={state.energyHint}
          onChange={(energyHint) => onHints({ energyHint })}
        />
        <HintSlider
          id="body-comfort"
          label={comfortSlider.label}
          min={comfortSlider.min}
          max={comfortSlider.max}
          value={state.comfortHint}
          onChange={(comfortHint) => onHints({ comfortHint })}
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-5 sm:flex-row-reverse">
        <Button className="sm:flex-1" onClick={onSubmit}>
          {copy.checkin.bodyCta}
        </Button>
        <Button variant="secondary" className="sm:flex-1" onClick={onBack}>
          {copy.global.back}
        </Button>
      </div>
    </>
  );
}
