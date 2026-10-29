'use client';

// The mood map: a square with energy up and down and pleasantness left to
// right, split into Surge, Swell, Ebb and Still. Maya can drag the dot, tap
// anywhere, or use the arrow keys (up/down for energy, left/right for
// pleasantness). Screen readers hear "Energy 2, pleasantness minus 3, Surge".
// Anyone who finds dragging awkward can switch to two plain sliders.
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { copy, fill, quadrantLabel } from '@/copy/en';
import { clampCoord, toQuadrant } from '@/lib/quadrant';
import { QUADRANT_STYLES } from '@/lib/quadrantStyles';
import { useReducedMotionPref, useSettings } from '@/lib/settings';
import type { Quadrant } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MapPoint {
  energy: number;
  pleasantness: number;
}

function spoken(n: number): string {
  return n < 0 ? `minus ${Math.abs(n)}` : String(n);
}

const CORNERS: Array<{ q: Quadrant; place: string }> = [
  { q: 'surge', place: 'left-2 top-2' },
  { q: 'swell', place: 'right-2 top-2 text-right' },
  { q: 'ebb', place: 'bottom-2 left-2' },
  { q: 'still', place: 'bottom-2 right-2 text-right' },
];

export function MoodMap({ value, onChange }: { value: MapPoint; onChange: (p: MapPoint) => void }) {
  const { settings } = useSettings();
  const reduce = useReducedMotionPref();
  const [useSliders, setUseSliders] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Keyboard changes are spoken through aria-valuetext on the focused dot;
  // this live region only speaks after a drag or tap, so nothing is said twice.
  const [pointerAnnouncement, setPointerAnnouncement] = useState('');
  const areaRef = useRef<HTMLDivElement>(null);
  const quadrant = toQuadrant(value.energy, value.pleasantness);
  const name = quadrantLabel(quadrant, settings.communicationMode);
  const valueText = fill(copy.moodMap.announce, {
    energy: spoken(value.energy),
    pleasantness: spoken(value.pleasantness),
    quadrant: name,
  });

  const pointFromPointer = (e: PointerEvent<HTMLDivElement>): MapPoint => {
    const rect = areaRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { pleasantness: clampCoord(x * 10 - 5), energy: clampCoord(5 - y * 10) };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(pointFromPointer(e));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) onChange(pointFromPointer(e));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, MapPoint> = {
      ArrowUp: { energy: 1, pleasantness: 0 },
      ArrowDown: { energy: -1, pleasantness: 0 },
      ArrowRight: { energy: 0, pleasantness: 1 },
      ArrowLeft: { energy: 0, pleasantness: -1 },
    };
    const d = step[e.key];
    if (!d) return;
    e.preventDefault();
    onChange({ energy: clampCoord(value.energy + d.energy), pleasantness: clampCoord(value.pleasantness + d.pleasantness) });
  };

  return (
    <div className="flex flex-col gap-3">
      {useSliders ? (
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
          <SliderRow label={copy.moodMap.energy} value={value.energy} onChange={(energy) => onChange({ ...value, energy })} />
          <SliderRow
            label={copy.moodMap.pleasantness}
            value={value.pleasantness}
            onChange={(pleasantness) => onChange({ ...value, pleasantness })}
          />
          <p className="flex items-center gap-2 font-bold">
            <span aria-hidden className={cn('size-3 rounded-full', QUADRANT_STYLES[quadrant].dot)} />
            {name}
          </p>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[320px]">
          <p className="text-center text-caption text-ink-soft">{copy.moodMap.moreEnergy}</p>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 -rotate-180 text-caption text-ink-soft [writing-mode:vertical-rl]">{copy.moodMap.unpleasant}</span>
            <div
              ref={areaRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => {
                setDragging(false);
                setPointerAnnouncement(valueText);
              }}
              onPointerCancel={() => setDragging(false)}
              className="relative grid aspect-square w-full touch-none grid-cols-2 grid-rows-2 overflow-hidden rounded-card border border-line"
            >
              {CORNERS.map(({ q, place }) => (
                <div key={q} className={cn('relative', QUADRANT_STYLES[q].tint)}>
                  <span className={cn('absolute text-caption font-bold text-ink', place)}>{copy.quadrants[q].name}</span>
                </div>
              ))}
              <div
                role="slider"
                tabIndex={0}
                aria-label={copy.moodMap.dotLabel}
                aria-valuemin={-5}
                aria-valuemax={5}
                aria-valuenow={value.energy}
                aria-valuetext={valueText}
                aria-describedby="mood-map-hint"
                onKeyDown={onKeyDown}
                className={cn(
                  'absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-ink',
                  !reduce && !dragging && 'transition-[left,top] duration-200 ease-out',
                )}
                style={{ left: `${((value.pleasantness + 5) / 10) * 100}%`, top: `${((5 - value.energy) / 10) * 100}%` }}
              />
            </div>
            <span className="w-4 shrink-0 text-caption text-ink-soft [writing-mode:vertical-rl]">{copy.moodMap.pleasant}</span>
          </div>
          <p className="text-center text-caption text-ink-soft">{copy.moodMap.lessEnergy}</p>
          <p id="mood-map-hint" className="sr-only">
            {copy.moodMap.keyboardHint}
          </p>
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {pointerAnnouncement}
      </p>
      <Button variant="link" size="inline" className="self-center" onClick={() => setUseSliders((s) => !s)}>
        {useSliders ? copy.moodMap.useMap : copy.moodMap.useSliders}
      </Button>
    </div>
  );
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="font-bold">{label}</span>
        <span className="text-ink-soft">{value}</span>
      </div>
      <Slider
        min={-5}
        max={5}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        thumbLabel={label}
        valueText={(v) => `${label} ${spoken(v)}`}
      />
    </div>
  );
}
