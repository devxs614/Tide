// Every setting, validated (v2 spec 15.2, 15.5). Used when importing a
// settings file or a backup: each key is checked on its own, so one bad
// value falls back to its default instead of throwing the whole file away,
// and keys Tide doesn't know are ignored.
import { z } from 'zod';
import { ACCESSORIES, PLACEMENTS, SPECIES } from '@/lib/companion/registry';
import { THEME_IDS } from '@/lib/theme/themes';
import { DEFAULT_SETTINGS } from '@/lib/repo/settings';
import type { Settings } from '@/lib/types';

const theme = z.enum(THEME_IDS as [string, ...string[]]);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const flag = z.boolean();

export const SettingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  textScale: z.union([z.literal(1), z.literal(1.15), z.literal(1.3), z.literal(1.5)]),
  extraSpacing: flag,
  reduceMotion: flag,
  vibration: flag,
  communicationMode: z.enum(['gentle', 'direct', 'literal']),
  aiEnabled: flag,
  readAloudRate: z.union([z.literal(0.8), z.literal(1), z.literal(1.2)]),
  readAloudVoice: z.string().max(200),
  demoMode: flag,
  onboarded: flag,
  trustedContacts: z.array(z.object({ id: z.string(), name: z.string().max(80), method: z.enum(['phone', 'email', 'handle']), value: z.string().max(120) })).max(20),
  campusSupport: z.object({ name: z.string().max(80), phone: z.string().max(40).optional(), url: z.string().max(200).optional() }).nullable(),
  name: z.string().max(40),
  demoClock: z.object({ base: z.number(), startedAt: z.number() }).nullable(),
  dayModeBannerDismissedFor: z.string().nullable(),
  schemaVersion: z.number().int(),
  'appearance.theme': theme,
  'appearance.followSystem': flag,
  'appearance.lightTheme': theme,
  'appearance.darkTheme': theme,
  'appearance.font': z.enum(['playful', 'hyperlegible', 'lexend', 'system']),
  'appearance.boldText': flag,
  'appearance.density': z.enum(['comfortable', 'compact']),
  'appearance.roundness': z.enum(['round', 'soft', 'square']),
  'appearance.quadrantPalette': z.enum(['theme', 'colorblind']),
  'appearance.showQuadrantShapes': flag,
  'motion.level': z.enum(['auto', 'off', 'calm', 'lively']),
  'motion.celebrations': z.enum(['full', 'gentle', 'off']),
  'motion.confetti': flag,
  'motion.pageTransitions': flag,
  'motion.companionIdle': flag,
  'motion.shoreWaves': flag,
  'haptics.enabled': flag,
  'sound.enabled': flag,
  'sound.volume': z.number().min(0).max(1),
  'sound.ui': flag,
  'sound.celebrations': flag,
  'sound.companion': flag,
  'sound.ambience': z.enum(['none', 'waves', 'rain', 'brown']),
  'sound.ambienceVolume': z.number().min(0).max(1),
  'voice.engine': z.enum(['auto', 'natural', 'device', 'off']),
  'voice.rate': z.number().min(0.8).max(1.2),
  'voice.deviceVoiceURI': z.string().max(300).nullable(),
  'voice.naturalVoice': z.string().max(80),
  'voice.accent': z.enum(['auto', 'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN', 'en-IE', 'en-ZA']),
  'voice.autoReadAi': flag,
  'voice.readCompanion': flag,
  'voice.breathingCues': flag,
  'privacy.naturalVoiceAllowed': flag,
  'companion.species': z.enum(['none', ...SPECIES]).nullable(),
  'companion.name': z.string().max(16),
  'companion.variant': z.string().max(40),
  'companion.accessory': z.enum(ACCESSORIES),
  'companion.size': z.enum(['sm', 'md', 'lg']),
  'companion.talkativeness': z.enum(['quiet', 'some', 'chatty']),
  'companion.placements': z.object(Object.fromEntries(PLACEMENTS.map((p) => [p, flag])) as Record<string, typeof flag>),
  'companion.faceStyle': z.enum(['dots', 'none']),
  'companion.mirrorState': flag,
  'companion.voice': z.string().max(80),
  'onboarding.step': z.number().int().min(1).max(12),
  'whatsNew.seen': flag,
  'today.companionCardDismissed': flag,
  firsts: z.partialRecord(z.enum(['checkin', 'unstick', 'focus', 'bridge', 'strategy', 'wrap', 'bottle']), z.number()),
  'language.readingLevel': z.enum(['standard', 'simple']),
  'language.timeFormat': z.enum(['12h', '24h']),
  'language.dateStyle': z.enum(['long', 'short']),
  pronouns: z.string().max(20),
  'day.start': hhmm,
  'day.end': hhmm,
  'day.wrapTime': hhmm,
  'day.transitionLead': z.union([z.literal(5), z.literal(10), z.literal(15)]),
  'day.gentleBudget': z.number().int().min(2).max(8),
  'day.minimumBudget': z.number().int().min(1).max(4),
  'day.dayModeSuggestions': flag,
  'day.showMoved': flag,
  'day.morningCard': flag,
  'day.wrapCard': flag,
  'checkin.defaultPath': z.enum(['words', 'body', 'map']),
  'checkin.vocabulary': z.enum(['simple', 'full']),
  'checkin.showCauses': flag,
  'checkin.showFollowUp': flag,
  'checkin.mapStyle': z.enum(['map', 'sliders']),
  'focus.defaultMinutes': z.union([z.literal('auto'), z.literal(5), z.literal(10), z.literal(15), z.literal(25)]),
  'focus.companionActivity': flag,
  'focus.endSound': flag,
  'focus.keepAwake': flag,
  'shortcuts.enabled': flag,
  'patterns.enabled': flag,
  'patterns.minEvidence': z.union([z.literal(3), z.literal(5)]),
  'patterns.defaultPeriod': z.union([z.literal(7), z.literal(28)]),
  'shore.sky': z.enum(['time', 'theme', 'static']),
  'shore.showLabels': flag,
  'shore.lastSeenAt': z.number(),
  'wrap.eveningHiddenFor': z.string().nullable(),
  'wrap.morningHiddenFor': z.string().nullable(),
});

const SHAPE = SettingsSchema.shape as Record<string, z.ZodType>;

// Checks a settings object key by key. Good values are kept; bad ones are
// listed (they'll stay at their current value); unknown keys are skipped.
export function validateSettings(raw: unknown): { values: Partial<Settings>; invalid: string[] } {
  const values: Record<string, unknown> = {};
  const invalid: string[] = [];
  if (!raw || typeof raw !== 'object') return { values: {}, invalid: ['settings'] };
  for (const [key, value] of Object.entries(raw)) {
    if (!(key in SHAPE)) continue;
    if (SHAPE[key].safeParse(value).success) values[key] = value;
    else invalid.push(key);
  }
  return { values: values as Partial<Settings>, invalid };
}

// Every default must pass its own schema (a test checks this).
export const DEFAULTS_VALID = (): boolean => SettingsSchema.safeParse(DEFAULT_SETTINGS).success;
