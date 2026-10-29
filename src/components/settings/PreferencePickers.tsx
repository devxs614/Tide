'use client';

// The comfort controls shared by onboarding and Settings: text size (with a
// live preview), theme, and how Tide talks. Each change is saved at once and
// applied to the page right away, so Maya sees the effect as she chooses.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { CommunicationMode, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';

function Choice({ pressed, onClick, children, className }: { pressed: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'min-h-12 rounded-full border px-4 py-2 text-left',
        pressed ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface text-ink hover:bg-surface-2',
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
      <legend className="mb-2 font-bold">{copy.settings.textSize}</legend>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <Choice key={s} pressed={settings.textScale === s} onClick={() => void update('textScale', s)}>
            {Math.round(s * 100)}%
          </Choice>
        ))}
      </div>
      <p className="rounded-card bg-surface-2 p-3">{copy.settings.textSizePreview}</p>
    </fieldset>
  );
}

const THEMES: Array<Settings['theme']> = ['system', 'light', 'dark'];

export function ThemePicker() {
  const { settings, update } = useSettings();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{copy.settings.theme}</legend>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <Choice key={t} pressed={settings.theme === t} onClick={() => void update('theme', t)}>
            {copy.settings.themes[t]}
          </Choice>
        ))}
      </div>
    </fieldset>
  );
}

const MODES: CommunicationMode[] = ['gentle', 'direct', 'literal'];

export function ModePicker({ legend = copy.settings.howTideTalks }: { legend?: string }) {
  const { settings, update } = useSettings();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{legend}</legend>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={settings.communicationMode === m}
          onClick={() => void update('communicationMode', m)}
          className={cn(
            'flex flex-col gap-1 rounded-card border p-4 text-left',
            settings.communicationMode === m ? 'border-2 border-primary bg-surface' : 'border-line bg-surface hover:bg-surface-2',
          )}
        >
          <span className="font-bold">{copy.settings.modes[m].name}</span>
          <span className="text-ink-soft">&ldquo;{copy.settings.modes[m].example}&rdquo;</span>
        </button>
      ))}
    </fieldset>
  );
}
