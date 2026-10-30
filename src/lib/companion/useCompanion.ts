'use client';

// The companion profile from settings (v2 spec 8.9): which species, its
// name, look, size, how much it talks and where it appears. "none" and
// "not chosen yet" both mean no character is drawn.
import { useMemo } from 'react';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import { COMPANIONS, SIZES, type CompanionSpecies } from './registry';

export interface CompanionProfile {
  species: CompanionSpecies | null;
  isNone: boolean;
  chosen: boolean;
  name: string;
  variant: string;
  accessory: Settings['companion.accessory'];
  size: number;
  talkativeness: Settings['companion.talkativeness'];
  placements: Settings['companion.placements'];
  faceStyle: Settings['companion.faceStyle'];
  mirrorState: boolean;
  voice: string;
}

export function companionProfile(settings: Settings): CompanionProfile {
  const raw = settings['companion.species'];
  const species = raw && raw !== 'none' ? raw : null;
  return {
    species,
    isNone: species === null,
    chosen: raw !== null,
    name: species ? settings['companion.name'] || COMPANIONS[species].defaultName : '',
    variant: settings['companion.variant'],
    accessory: settings['companion.accessory'],
    size: SIZES[settings['companion.size']],
    talkativeness: settings['companion.talkativeness'],
    placements: settings['companion.placements'],
    faceStyle: settings['companion.faceStyle'],
    mirrorState: settings['companion.mirrorState'],
    voice: settings['companion.voice'],
  };
}

// Memoized on the settings object, so callbacks that depend on the profile
// stay stable until a setting actually changes.
export function useCompanion(): CompanionProfile {
  const { settings } = useSettings();
  return useMemo(() => companionProfile(settings), [settings]);
}

// Whether a companion is drawn in this place right now. Screens that change
// their layout around it (the breathing square grows to fit one) ask first.
export function useCompanionShown(placement: keyof Settings['companion.placements']): boolean {
  const profile = useCompanion();
  return !!profile.species && profile.placements[placement];
}
