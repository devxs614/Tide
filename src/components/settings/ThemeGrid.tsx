'use client';

// The theme picker (v2 spec 4.6.5): every theme as a tiny preview drawn in
// its own colors (sky and sea, a 3D button, two lines of text, the four
// state dots), grouped Light / Dark / High contrast. Picking one applies it
// at once with a soft crossfade. "Follow my device" swaps the single grid for
// two: one for when the device is light and one for when it's dark.
import { Check } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { useUndoableUpdate } from '@/lib/settings/useUndoableUpdate';
import { QUADRANT_PALETTES, THEMES, THEME_IDS, type ThemeGroup, type ThemeId } from '@/lib/theme/themes';
import { SwitchRow } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const GROUPS: ThemeGroup[] = ['light', 'dark', 'contrast'];

function ThemeCard({ id, selected, onPick }: { id: ThemeId; selected: boolean; onPick: () => void }) {
  const theme = THEMES[id];
  const c = theme.tokens;
  const dots = QUADRANT_PALETTES[theme.quadrants];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPick}
      data-demo-id={`theme-card-${id}`}
      className={cn(
        'press-3d relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border-2 text-left [--ledge-color:var(--line)]',
        selected ? 'border-primary [--ledge-color:var(--primary-shadow)]' : 'border-line',
      )}
    >
      <span aria-hidden className="flex flex-col gap-1.5 p-2.5" style={{ background: c.bg }}>
        <span className="h-5 rounded-md" style={{ background: `linear-gradient(${c.skyTop}, ${c.sea})` }} />
        <span className="h-1.5 w-4/5 rounded-full" style={{ background: c.ink }} />
        <span className="h-1.5 w-3/5 rounded-full" style={{ background: c.inkSoft }} />
        <span className="flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-0.5 font-display text-[0.6471rem] font-extrabold"
            style={{ background: c.primary, color: c.onPrimary, boxShadow: `0 3px 0 ${c.primaryShadow}` }}
          >
            {copy.themes.previewButton}
          </span>
          <span className="flex gap-1">
            {Object.values(dots).map((color) => (
              <span key={color} className="size-2 rounded-full" style={{ background: color }} />
            ))}
          </span>
        </span>
      </span>
      <span className="flex flex-col gap-0.5 bg-surface px-2.5 py-2">
        <span className="font-display text-[0.8824rem] font-extrabold text-ink">{copy.themes.names[id]}</span>
        <span className="text-caption text-ink-soft">{copy.themes.descriptions[id]}</span>
      </span>
      {selected && (
        <span aria-hidden className="anim-pop absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="size-4 stroke-[3]" />
        </span>
      )}
    </button>
  );
}

function Grid({ selected, onPick, label }: { selected: ThemeId; onPick: (id: ThemeId) => void; label?: string }) {
  return (
    <div className="flex flex-col gap-4">
      {label && <h4 className="text-body font-extrabold">{label}</h4>}
      {GROUPS.map((group) => (
        <section key={group} className="flex flex-col gap-2" aria-label={copy.themes.groups[group]}>
          <h5 className="font-display text-small font-bold text-ink-soft">{copy.themes.groups[group]}</h5>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEME_IDS.filter((id) => THEMES[id].group === group).map((id) => (
              <ThemeCard key={id} id={id} selected={selected === id} onPick={() => onPick(id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ThemeGrid() {
  const { settings, update } = useSettings();
  const undoable = useUndoableUpdate();
  const follow = settings['appearance.followSystem'];
  return (
    <div className="flex flex-col gap-4" data-demo-id="theme-grid">
      <h3 className="text-h3 font-extrabold">{copy.themes.pickerTitle}</h3>
      <SwitchRow
        id="set-follow-system"
        label={copy.themes.followSystem}
        checked={follow}
        onCheckedChange={(v) => void update('appearance.followSystem', v)}
      />
      {follow ? (
        <>
          <Grid label={copy.themes.whenLight} selected={settings['appearance.lightTheme']} onPick={(id) => undoable({ 'appearance.lightTheme': id })} />
          <Grid label={copy.themes.whenDark} selected={settings['appearance.darkTheme']} onPick={(id) => undoable({ 'appearance.darkTheme': id })} />
        </>
      ) : (
        <Grid
          selected={settings['appearance.theme']}
          // Remember the pick as this person's light or dark favorite too, so
          // the quick Light/Dark switch and "follow my device" use it later.
          // A new theme is a big change, so it comes with Undo.
          onPick={(id) =>
            undoable({
              'appearance.theme': id,
              ...(THEMES[id].scheme === 'dark' ? { 'appearance.darkTheme': id } : { 'appearance.lightTheme': id }),
            })
          }
        />
      )}
    </div>
  );
}
