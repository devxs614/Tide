'use client';

// Whether the current theme reads as light or dark, for the few pieces that
// need to know in JavaScript (the toast library, the shore's night sky).
// Everything else just uses the CSS variables.
import { useSyncExternalStore } from 'react';
import { useSettings } from '@/lib/settings';
import { resolveThemeId } from './applyTheme';
import { THEMES } from './themes';

const QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function useThemeScheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const systemDark = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  return THEMES[resolveThemeId(settings, systemDark)]?.scheme ?? 'light';
}
