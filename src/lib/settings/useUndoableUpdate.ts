'use client';

// Changes that could surprise someone (theme, font, motion, companion,
// how Tide talks, presets) are applied at once and offer Undo for six
// seconds (v2 spec 15.1). Undo puts back exactly the keys that changed.
import { useCallback } from 'react';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';

export function useUndoableUpdate() {
  const { settings, updateMany } = useSettings();
  return useCallback(
    (values: Partial<Settings>, message: string = copy.set.changed) => {
      const before: Partial<Settings> = {};
      for (const key of Object.keys(values) as Array<keyof Settings>) Object.assign(before, { [key]: settings[key] });
      void updateMany(values);
      toast(message, { duration: 6000, action: { label: copy.set.undo, onClick: () => void updateMany(before) } });
    },
    [settings, updateMany],
  );
}
