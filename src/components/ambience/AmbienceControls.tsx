'use client';

// The ambience player's controls (v2.1 F-09), shared by the Sounds sheet in
// Focus and the "Background sounds" section of the Toolkit: nine sound
// tiles (tap to play or switch, tap the playing one to stop), volume, how
// long to play, and plain notes about headphones and phones that lock.
import { AudioLines, CloudRain, Droplets, Fan, Headphones, Mountain, Waves, Wind, type LucideIcon } from 'lucide-react';
import { ambienceCopy as t } from '@/copy/ambienceCopy';
import { useSettings } from '@/lib/settings';
import { useAmbienceState } from '@/lib/sound/ambienceState';
import { AMBIENCE_IDS, isBinaural, type AmbienceId } from '@/lib/sound/names';
import type { Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';

const ICONS: Record<AmbienceId, LucideIcon> = {
  white: AudioLines,
  pink: Wind,
  brown: Mountain,
  rain: CloudRain,
  waves: Waves,
  fan: Fan,
  stream: Droplets,
  binaural_focus: Headphones,
  binaural_calm: Headphones,
};

type PlayFor = Settings['ambience.playFor'];
const player = () => import('@/lib/sound/ambiencePlayer');

function Bars() {
  return (
    <span aria-hidden className="flex h-4 items-end gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="sound-bar w-1 rounded-full bg-current" style={{ animationDelay: `${i * 140}ms` }} />
      ))}
    </span>
  );
}

export function AmbienceControls({ inFocus = false }: { inFocus?: boolean }) {
  const { settings, updateMany } = useSettings();
  const state = useAmbienceState();
  const v2Default = settings['sound.ambience'] === 'none' ? null : settings['sound.ambience'];
  const selected = state.sound ?? settings['ambience.lastSound'] ?? v2Default;
  const volume = settings['ambience.volume'];
  const playFor: PlayFor = !inFocus && settings['ambience.playFor'] === 'focus_end' ? 'until_stop' : settings['ambience.playFor'];
  const options: PlayFor[] = inFocus ? ['until_stop', 'focus_end', '15', '30', '60'] : ['until_stop', '15', '30', '60'];

  const play = (id: AmbienceId, length: PlayFor = playFor) => {
    void player().then((p) =>
      p.playAmbience(id, {
        volume,
        title: t.names[id],
        minutes: ['15', '30', '60'].includes(length) ? Number(length) : undefined,
        untilFocusEnds: length === 'focus_end',
      }),
    );
    void updateMany({ 'ambience.lastSound': id, 'ambience.playFor': length });
  };
  const stop = () => void player().then((p) => p.stopAmbience());

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9em),1fr))] gap-2">
        {AMBIENCE_IDS.map((id) => {
          const Icon = ICONS[id];
          const on = state.sound === id && !state.paused;
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => (on ? stop() : play(id))}
                data-demo-id={`ambience-${id}`}
                className={cn(
                  'flex h-full min-h-24 w-full flex-col items-start gap-1 rounded-card border-2 p-3 text-left',
                  on ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))]' : 'border-line bg-surface hover:bg-surface-2',
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <Icon aria-hidden className="size-5 shrink-0" />
                  {on && (
                    <span className="flex items-center gap-1 text-caption font-bold text-primary">
                      <Bars />
                      {t.playing}
                    </span>
                  )}
                </span>
                <span className="font-bold break-words">{t.names[id]}</span>
                <span className="text-caption break-words text-ink-soft">{t.descriptions[id]}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && isBinaural(selected) && (
        <div className="flex flex-col gap-1 rounded-card bg-surface-2 p-3">
          <p className="flex items-center gap-2 font-bold">
            <Headphones aria-hidden className="size-4 shrink-0" />
            {t.headphones}
          </p>
          <p className="text-caption text-ink-soft">{t.binauralHelp}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span id="ambience-volume" className="font-bold">
          {t.volume}
        </span>
        <Slider
          value={[Math.round(volume * 100)]}
          min={0}
          max={100}
          step={5}
          thumbLabelledBy="ambience-volume"
          valueText={(v) => `${v}%`}
          onValueChange={([v]) => {
            void player().then((p) => p.setAmbienceVolume(v / 100));
            void updateMany({ 'ambience.volume': v / 100 });
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold">{t.playFor}</span>
        <SegmentedControl
          label={t.playFor}
          value={playFor}
          onChange={(v) => (state.sound && !state.paused ? play(state.sound, v as PlayFor) : void updateMany({ 'ambience.playFor': v as PlayFor }))}
          options={options.map((v) => ({ value: v, label: t.playForOptions[v] }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {state.sound && (
          <Button variant="secondary" onClick={stop} data-demo-id="ambience-stop">
            {t.stop}
          </Button>
        )}
        {selected && <ReadAloudButton text={`${t.names[selected]}. ${t.descriptions[selected]}`} />}
      </div>
      <p className="text-caption text-ink-soft">{t.note}</p>
    </div>
  );
}
