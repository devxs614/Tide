'use client';

// Step 10, "Your day" (v2 spec 11.2): when the day usually starts, when
// Maya likes to close it, how early to warn before a switch (15 minutes, as
// in v1, unless she picks less), and a 12- or 24-hour clock.
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

const LEADS: Array<Settings['day.transitionLead']> = [5, 10, 15];

function TimeField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-display font-extrabold">
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="min-h-12 rounded-input border-2 border-line bg-surface px-3 text-body"
      />
    </div>
  );
}

export function DayStep({ onNext }: StepProps) {
  const { settings, update } = useSettings();
  return (
    <StepFrame title={copy.ob.dayTitle} action={copy.ob.next} onAction={onNext}>
      <TimeField id="ob-day-start" label={copy.ob.dayStart} value={settings['day.start']} onChange={(v) => void update('day.start', v)} />
      <TimeField id="ob-wrap-time" label={copy.ob.wrapTime} value={settings['day.wrapTime']} onChange={(v) => void update('day.wrapTime', v)} />
      <div className="flex flex-col gap-2">
        <span className="font-display font-extrabold">{copy.ob.transitionLead}</span>
        <SegmentedControl
          label={copy.ob.transitionLead}
          value={String(settings['day.transitionLead'])}
          onChange={(v) => void update('day.transitionLead', Number(v) as Settings['day.transitionLead'])}
          options={LEADS.map((n) => ({ value: String(n), label: fill(copy.ob.minutes, { n }) }))}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-display font-extrabold">{copy.ob.clock}</span>
        <SegmentedControl
          label={copy.ob.clock}
          value={settings['language.timeFormat']}
          onChange={(v) => void update('language.timeFormat', v)}
          options={[
            { value: '12h', label: copy.ob.clocks['12h'] },
            { value: '24h', label: copy.ob.clocks['24h'] },
          ]}
        />
      </div>
    </StepFrame>
  );
}
