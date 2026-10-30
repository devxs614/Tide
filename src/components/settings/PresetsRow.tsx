'use client';

// Quick presets on the Settings index (v2 spec 15.3): one tap shows what a
// preset will change ("theme → Sandbar, motion → Off…"), Apply changes only
// those keys, and Undo puts every one of them back.
import { useState } from 'react';
import { copy, fill } from '@/copy/en';
import { hapticsSupported } from '@/lib/haptics';
import { useSettings } from '@/lib/settings';
import { PRESET_IDS, presetValues, type PresetId } from '@/lib/settings/presets';
import { useUndoableUpdate } from '@/lib/settings/useUndoableUpdate';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';

function describe(values: Record<string, unknown>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key.split('.').pop()} → ${String(value)}`)
    .join(', ');
}

export function PresetsRow() {
  const { settings } = useSettings();
  const undoable = useUndoableUpdate();
  const [open, setOpen] = useState<PresetId | null>(null);
  const values = open ? presetValues(open, hapticsSupported()) : null;
  // Only list what would actually change.
  const changes = values ? Object.fromEntries(Object.entries(values).filter(([k, v]) => settings[k as keyof typeof settings] !== v)) : {};

  return (
    <section aria-labelledby="presets" className="flex flex-col gap-2">
      <h2 id="presets" className="text-h3 font-extrabold">
        {copy.set.presetsTitle}
      </h2>
      <div className="flex flex-wrap gap-2">
        {PRESET_IDS.map((id) => (
          <span key={id} data-demo-id={`settings-preset-${id}`}>
            <Chip label={copy.ob.presets[id].name} pressed={open === id} onToggle={() => setOpen(open === id ? null : id)} />
          </span>
        ))}
      </div>
      {open && values && (
        <div className="card flex flex-col gap-2 p-3" aria-live="polite">
          <p className="text-small">{fill(copy.set.presetConfirm, { list: describe(changes) || '—' })}</p>
          <Button
            className="self-start"
            data-demo-id="settings-preset-apply"
            onClick={() => {
              undoable(values, fill(copy.set.presetApplied, { name: copy.ob.presets[open].name }));
              setOpen(null);
            }}
          >
            {copy.set.applyPreset}
          </Button>
        </div>
      )}
    </section>
  );
}
