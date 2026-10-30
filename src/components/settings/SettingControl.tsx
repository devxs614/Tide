'use client';

// One setting from the catalog, drawn the way its kind asks: a switch, a
// row of choices, a time, or a short text. Each has an anchor so search can
// jump to it, and the surprising ones offer Undo.
import { useState } from 'react';
import { useSettings } from '@/lib/settings';
import { useUndoableUpdate } from '@/lib/settings/useUndoableUpdate';
import { anchorFor, type Entry } from '@/lib/settings/catalog';
import type { Settings } from '@/lib/types';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SwitchRow } from '@/components/ui/switch';

export function SettingControl({ entry }: { entry: Exclude<Entry, { kind: 'custom' }> }) {
  const { settings, update, updateMany } = useSettings();
  const undoable = useUndoableUpdate();
  const id = anchorFor(entry);
  const key = entry.key;
  const value = settings[key];
  // Text fields keep their own copy while typing (saving is asynchronous).
  const [draft, setDraft] = useState(typeof value === 'string' ? value : '');

  if (entry.kind === 'switch') {
    return (
      <div id={id} className="setting-target rounded-card">
        <SwitchRow id={`${id}-input`} label={entry.label} description={entry.help} checked={!!value} onCheckedChange={(v) => void update(key, v as never)} />
      </div>
    );
  }
  if (entry.kind === 'choice') {
    const choose = (raw: string) => {
      const next = (entry.numeric || (key === 'focus.defaultMinutes' && raw !== 'auto') ? Number(raw) : raw) as Settings[typeof key];
      // Motion Off also sets v1's reduceMotion, which older parts still read.
      const values = { [key]: next, ...(key === 'motion.level' && { reduceMotion: next === 'off' }) } as Partial<Settings>;
      if (entry.undo) undoable(values);
      else void updateMany(values);
    };
    return (
      <div id={id} className="setting-target flex flex-col gap-2 rounded-card">
        <span className="font-display font-extrabold">{entry.label}</span>
        <SegmentedControl label={entry.label} value={String(value)} onChange={choose} options={entry.options} />
        {entry.help && <p className="text-small text-ink-soft">{entry.help}</p>}
      </div>
    );
  }
  return (
    <div id={id} className="setting-target flex flex-col gap-2 rounded-card">
      <label htmlFor={`${id}-input`} className="font-display font-extrabold">
        {entry.label}
      </label>
      <input
        id={`${id}-input`}
        type={entry.kind === 'time' ? 'time' : 'text'}
        maxLength={entry.kind === 'text' ? entry.max : undefined}
        value={entry.kind === 'time' ? String(value) : draft}
        onChange={(e) => {
          if (entry.kind === 'time') return e.target.value && void update(key, e.target.value as never);
          setDraft(e.target.value);
          void update(key, e.target.value as never);
        }}
        className="min-h-12 rounded-input border-2 border-line bg-surface px-3 text-body"
      />
      {entry.kind === 'text' && entry.help && <p className="text-small text-ink-soft">{entry.help}</p>}
    </div>
  );
}
