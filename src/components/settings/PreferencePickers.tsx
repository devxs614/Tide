'use client';

// The comfort controls shared by onboarding and Settings: text size (with a
// live preview), theme, and how Tide talks. Each change is saved at once and
// applied to the page right away, so Maya sees the effect as she chooses.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { CommunicationMode, Settings } from '@/lib/types';
import { THEMES } from '@/lib/theme/themes';
import { CardButton } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      <legend className="mb-2 font-bold">{copy.settings.textSize}</legend>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <Choice key={s} pressed={settings.textScale === s} onClick={() => void update('textScale', s)}>
            {Math.round(s * 100)}%
          </Choice>
        ))}
      </div>
      <p className="rounded-card border-2 border-line bg-surface-2 p-3">{copy.settings.textSizePreview}</p>
    </fieldset>
  );
}

const SCHEMES: Array<Settings['theme']> = ['system', 'light', 'dark'];

// The quick System / Light / Dark switch from v1. In v2 it picks the
// person's own light or dark theme (Lagoon and Midnight Tide by default,
// Classic and Classic Dark for v1 users), so it keeps doing what it says.
export function ThemePicker() {
  const { settings, updateMany } = useSettings();
  const current: Settings['theme'] = settings['appearance.followSystem']
    ? 'system'
    : THEMES[settings['appearance.theme']].scheme;
  const choose = (scheme: Settings['theme']) =>
    void updateMany({
      theme: scheme,
      'appearance.followSystem': scheme === 'system',
      ...(scheme === 'light' && { 'appearance.theme': settings['appearance.lightTheme'] }),
      ...(scheme === 'dark' && { 'appearance.theme': settings['appearance.darkTheme'] }),
    });
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-bold">{copy.settings.theme}</legend>
      <div className="flex flex-wrap gap-2">
        {SCHEMES.map((t) => (
          <Choice key={t} pressed={current === t} onClick={() => choose(t)}>
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
        <CardButton key={m} selected={settings.communicationMode === m} onClick={() => void update('communicationMode', m)}>
          <span className="font-display font-extrabold">{copy.settings.modes[m].name}</span>
          <span className="text-ink-soft">&ldquo;{copy.settings.modes[m].example}&rdquo;</span>
        </CardButton>
      ))}
    </fieldset>
  );
}
