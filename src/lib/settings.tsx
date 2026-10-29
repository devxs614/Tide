'use client';

// Settings for the whole app: one provider reads the settings table live and
// applies theme, text size, spacing and reduced motion to <html> right away,
// so a change in onboarding or Settings shows up instantly. It also points
// the clock at the demo time when demo mode is on.

// Dexie is the source of truth; a tiny localStorage mirror lets the inline
// script in layout.tsx paint the right theme and size before React loads.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { setDemoClock } from './clock';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { DEFAULT_SETTINGS, setSetting, setSettings, settingsFromRows } from './repo/settings';
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

export function applyToDocument(s: Settings): void {
  const root = document.documentElement;
  const dark = s.theme === 'dark' || (s.theme === 'system' && prefersDark());
  root.classList.toggle('dark', dark);
  root.style.setProperty('--text-scale', String(s.textScale));
  root.dataset.spacing = s.extraSpacing ? 'extra' : 'normal';
  root.dataset.reduceMotion = s.reduceMotion ? 'true' : 'false';
  try {
    localStorage.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({
        theme: s.theme,
        textScale: s.textScale,
        extraSpacing: s.extraSpacing,
        reduceMotion: s.reduceMotion,
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
    if (settings.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyToDocument(settings);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [settings, loaded]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, loaded, update: setSetting, updateMany: setSettings }),
    [settings, loaded],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

// One answer to "should this move?": true if the OS asks for reduced motion
// or Maya turned it on in Settings. Every animation in Tide checks this.
export function useReducedMotionPref(): boolean {
  const os = usePrefersReducedMotion();
  const { settings } = useSettings();
  return Boolean(os) || settings.reduceMotion;
}
