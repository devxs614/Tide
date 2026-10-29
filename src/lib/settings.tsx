'use client';

// Settings for the whole app: one provider reads the settings table live and
// applies the theme, text size, spacing, font and motion level to <html>
// right away, so a change in onboarding or Settings shows up instantly. It
// also points the clock at the demo time when demo mode is on.

// Dexie is the source of truth; a tiny localStorage mirror lets the inline
// script in layout.tsx paint the right theme and size before React loads.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { setDemoClock } from './clock';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { DEFAULT_SETTINGS, setSetting, setSettings, settingsFromRows } from './repo/settings';
import { shouldSaveMigration, v2MigrationPatch } from './settings/migrate';
import { crossfadeFrom, paintFor, writePaint } from './theme/applyTheme';
import { resolveMotionLevel } from './motion/resolve';
import type { Settings } from './types';

interface SettingsContextValue {
  settings: Settings;
  loaded: boolean;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  updateMany: (values: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  update: async () => {},
  updateMany: async () => {},
});

export const PREFS_STORAGE_KEY = 'tide-prefs';

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyToDocument(s: Settings): void {
  const root = document.documentElement;
  const motion = resolveMotionLevel(s, prefersReducedMotion());
  const paint = paintFor(s, prefersDark(), motion);
  const previous = root.dataset.theme;
  if (previous && previous !== paint.attrs.theme && motion !== 'off') {
    crossfadeFrom(getComputedStyle(root).getPropertyValue('--bg').trim());
  }
  writePaint(root, paint);
  try {
    // With "follow my device", keep the other scheme's colors too, so the
    // first paint is right even if the device switched while Tide was shut.
    const other = s['appearance.followSystem'] ? paintFor(s, !prefersDark(), motion) : null;
    localStorage.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({
        v: 2,
        vars: paint.vars,
        attrs: paint.attrs,
        dark: paint.dark,
        alt: other && { vars: other.vars, dark: other.dark },
        // v1 fields, so an older tab still paints something sensible.
        theme: s.theme,
        textScale: s.textScale,
        extraSpacing: s.extraSpacing,
        reduceMotion: motion === 'off',
      }),
    );
  } catch {
    // Private browsing can block storage; the Dexie copy still applies.
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const rows = useLiveQuery(() => db.settings.toArray(), []);
  const loaded = rows !== undefined;
  const settings = useMemo(() => (rows ? settingsFromRows(rows) : DEFAULT_SETTINGS), [rows]);

  // The clock has to be right before children render times, so this runs
  // during render rather than in an effect. It only sets a module variable.
  setDemoClock(settings.demoMode ? settings.demoClock : null);

  useEffect(() => {
    if (!loaded) return;
    applyToDocument(settings);
    // Follow the device when Maya asked to, and notice the device's
    // reduced-motion switch when she hasn't picked a motion level herself.
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => applyToDocument(settings);
    scheme.addEventListener('change', onChange);
    motion.addEventListener('change', onChange);
    return () => {
      scheme.removeEventListener('change', onChange);
      motion.removeEventListener('change', onChange);
    };
  }, [settings, loaded]);

  // Write the v1 → v2 migration down once, for people already onboarded.
  useEffect(() => {
    if (!rows || !shouldSaveMigration(rows)) return;
    void setSettings({ ...v2MigrationPatch(rows), schemaVersion: 2 });
  }, [rows]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, loaded, update: setSetting, updateMany: setSettings }),
    [settings, loaded],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

// One answer to "should this move?", kept from v1 so its callers don't
// change: true when the motion level resolves to Off (her choice, v1's
// Reduce motion switch, or the device setting when she hasn't chosen).
export function useReducedMotionPref(): boolean {
  const os = usePrefersReducedMotion();
  const { settings } = useSettings();
  return resolveMotionLevel(settings, Boolean(os)) === 'off';
}
