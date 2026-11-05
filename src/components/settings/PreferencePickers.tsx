'use client';

// The comfort controls shared by onboarding and Settings: text size (with a
// live preview), theme, and how Tide talks. Each change is saved at once and
// applied to the page right away, so Maya sees the effect as she chooses.
import { useSettings } from '@/lib/settings';
import type { CommunicationMode, Settings } from '@/lib/types';
import { CardButton } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TextSizeSample } from './TextSizeSample';
import { settingsV1 } from '@/copy/settingsV1Copy';

function Choice({ pressed, onClick, children, className }: { pressed: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'press-3d min-h-12 rounded-full border-2 px-4 py-2 text-left font-display font-bold',
        pressed
          ? 'border-primary bg-primary text-on-primary [--ledge-color:var(--primary-shadow)]'
          : 'border-line bg-surface text-ink [--ledge-color:var(--line)] hover:bg-surface-2',
        className,
      )}
    >
      {children}
    </button>
  );
}

const SIZES: Array<Settings['textScale']> = [1, 1.15, 1.3, 1.5];

export function TextSizePicker() {
  const { settings, update } = useSettings();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{settingsV1.textSize}</legend>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <Choice key={s} pressed={settings.textScale === s} onClick={() => void update('textScale', s)}>
            {Math.round(s * 100)}%
          </Choice>
        ))}
      </div>
      <p className="rounded-card border-2 border-line bg-surface-2 p-3">{settingsV1.textSizePreview}</p>
      <TextSizeSample />
    </fieldset>
  );
}

const MODES: CommunicationMode[] = ['gentle', 'direct', 'literal'];

export function ModePicker({ legend = settingsV1.howTideTalks }: { legend?: string }) {
  const { settings, update } = useSettings();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{legend}</legend>
      {MODES.map((m) => (
        <CardButton key={m} selected={settings.communicationMode === m} onClick={() => void update('communicationMode', m)}>
          <span className="font-display font-extrabold">{settingsV1.modes[m].name}</span>
          <span className="text-ink-soft">&ldquo;{settingsV1.modes[m].example}&rdquo;</span>
        </CardButton>
      ))}
    </fieldset>
  );
}
