// What's on each Settings page (v2 spec 15.1–15.2), as data: the sections in
// order, and for each one its controls (a switch, a choice, a time, a short
// text, or a bigger piece like the theme grid). The section pages draw from
// this, "Reset this section" resets these keys, and search indexes the
// labels plus the words people actually type ("dark mode", "pet", "font").
import { copy } from '@/copy/en';
import type { Settings } from '@/lib/types';

export type SectionId = keyof typeof copy.set.sections;
type Key = keyof Settings;

export interface Option {
  value: string;
  label: string;
}

export type Entry =
  | { kind: 'switch'; key: Key; label: string; help?: string; keywords?: string[] }
  | { kind: 'choice'; key: Key; label: string; help?: string; options: Option[]; numeric?: boolean; undo?: boolean; keywords?: string[] }
  | { kind: 'time'; key: Key; label: string; keywords?: string[] }
  | { kind: 'text'; key: Key; label: string; help?: string; max: number; keywords?: string[] }
  | { kind: 'custom'; id: CustomId; label: string; keys?: Key[]; keywords?: string[] };

export type CustomId = 'companion' | 'theme' | 'textSize' | 'sound' | 'voice' | 'mode' | 'showDismissed' | 'ai' | 'data' | 'backup' | 'people' | 'shortcutsList' | 'demo' | 'about';

const L = copy.set.labels;
const H = copy.set.help;
const opts = (labels: Record<string, string>): Option[] => Object.entries(labels).map(([value, label]) => ({ value, label }));

export const SECTIONS: Array<{ id: SectionId; entries: Entry[] }> = [
  {
    id: 'profile',
    entries: [
      { kind: 'text', key: 'name', label: copy.settings.nameLabel, max: 40, keywords: ['name', 'call me', 'profile'] },
      { kind: 'text', key: 'pronouns', label: L.pronouns, help: H.pronouns, max: 20, keywords: ['pronouns', 'she', 'he', 'they'] },
    ],
  },
  { id: 'companion', entries: [{ kind: 'custom', id: 'companion', label: copy.set.sections.companion, keywords: ['companion', 'mascot', 'pet', 'animal', 'buddy', 'otter', 'axolotl', 'capybara', 'gecko', 'jellyfish', 'crab'] }] },
  {
    id: 'appearance',
    entries: [
      { kind: 'custom', id: 'theme', label: copy.settings.theme, keys: ['appearance.theme', 'appearance.followSystem', 'appearance.lightTheme', 'appearance.darkTheme', 'theme'], keywords: ['dark mode', 'night mode', 'light mode', 'colors', 'colours', 'theme', 'contrast'] },
      { kind: 'choice', key: 'appearance.font', label: copy.appearance.font, undo: true, options: Object.entries(copy.appearance.fonts).map(([value, f]) => ({ value, label: f.name })), keywords: ['font', 'dyslexia', 'typeface', 'letters', 'reading'] },
      { kind: 'custom', id: 'textSize', label: copy.settings.textSize, keys: ['textScale'], keywords: ['text size', 'bigger', 'zoom', 'large text'] },
      { kind: 'switch', key: 'extraSpacing', label: copy.settings.extraSpacing, keywords: ['spacing', 'line height'] },
      { kind: 'switch', key: 'appearance.boldText', label: L.boldText, keywords: ['bold', 'weight'] },
      { kind: 'choice', key: 'appearance.density', label: L.density, options: opts(L.densities), keywords: ['density', 'compact'] },
      { kind: 'choice', key: 'appearance.roundness', label: L.roundness, options: opts(L.roundnesses), keywords: ['corners', 'rounded', 'square'] },
      { kind: 'choice', key: 'appearance.quadrantPalette', label: L.palette, options: opts(L.palettes), keywords: ['color blind', 'colorblind', 'palette'] },
      { kind: 'switch', key: 'appearance.showQuadrantShapes', label: L.shapes, help: H.shapes, keywords: ['shapes', 'icons', 'color blind'] },
    ],
  },
  {
    id: 'motion',
    entries: [
      { kind: 'choice', key: 'motion.level', label: L.motionLevel, undo: true, options: opts(L.motionLevels), keywords: ['animation', 'motion', 'reduce motion', 'movement', 'still'] },
      { kind: 'choice', key: 'motion.celebrations', label: L.celebrations, options: opts(L.celebrationLevels), keywords: ['celebration', 'confetti', 'party'] },
      { kind: 'switch', key: 'motion.confetti', label: L.confetti, keywords: ['confetti'] },
      { kind: 'switch', key: 'motion.pageTransitions', label: L.pageTransitions, keywords: ['transitions', 'page animation'] },
      { kind: 'switch', key: 'motion.companionIdle', label: L.companionIdle, keywords: ['companion moving', 'idle'] },
      { kind: 'switch', key: 'motion.shoreWaves', label: L.shoreWaves, keywords: ['waves'] },
    ],
  },
  {
    id: 'sound',
    entries: [
      { kind: 'custom', id: 'sound', label: copy.sound.title, keys: ['sound.enabled', 'sound.volume', 'sound.ui', 'sound.celebrations', 'sound.companion', 'sound.ambience', 'haptics.enabled', 'vibration'], keywords: ['sound', 'audio', 'mute', 'vibrate', 'vibration', 'haptics', 'rain', 'brown noise', 'ambience'] },
      { kind: 'choice', key: 'sound.ambienceVolume', label: L.ambienceVolume, numeric: true, options: ['0.1', '0.3', '0.5', '0.8'].map((v) => ({ value: v, label: `${Math.round(Number(v) * 100)}%` })), keywords: ['background volume'] },
    ],
  },
  { id: 'voice', entries: [{ kind: 'custom', id: 'voice', label: copy.voice.title, keys: ['voice.engine', 'voice.rate', 'voice.deviceVoiceURI', 'voice.naturalVoice', 'voice.accent', 'voice.autoReadAi', 'voice.readCompanion', 'voice.breathingCues'], keywords: ['voice', 'speak', 'read aloud', 'read', 'speech', 'accent', 'speed'] }] },
  {
    id: 'language',
    entries: [
      { kind: 'custom', id: 'mode', label: copy.settings.howTideTalks, keys: ['communicationMode'], keywords: ['tone', 'literal', 'direct', 'gentle', 'how tide talks'] },
      { kind: 'choice', key: 'language.readingLevel', label: L.readingLevel, options: opts(L.readingLevels), keywords: ['simple words', 'reading level'] },
      { kind: 'choice', key: 'language.timeFormat', label: L.timeFormat, options: opts(L.timeFormats), keywords: ['24 hour', 'clock', 'time format'] },
      { kind: 'choice', key: 'language.dateStyle', label: L.dateStyle, options: opts(L.dateStyles), keywords: ['date format'] },
    ],
  },
  {
    id: 'checkin',
    entries: [
      { kind: 'choice', key: 'checkin.defaultPath', label: L.defaultPath, options: opts(L.defaultPaths), keywords: ['check in start', 'body'] },
      { kind: 'choice', key: 'checkin.vocabulary', label: L.vocabulary, help: H.vocabulary, options: opts(L.vocabularies), keywords: ['emotion words', 'feelings', 'vocabulary'] },
      { kind: 'switch', key: 'checkin.showCauses', label: L.showCauses, keywords: ['causes'] },
      { kind: 'switch', key: 'checkin.showFollowUp', label: L.showFollowUp, keywords: ['follow up question'] },
      { kind: 'choice', key: 'checkin.mapStyle', label: L.mapStyle, options: opts(L.mapStyles), keywords: ['sliders', 'mood map'] },
    ],
  },
  {
    id: 'day',
    entries: [
      { kind: 'time', key: 'day.start', label: L.dayStart, keywords: ['wake', 'morning'] },
      { kind: 'time', key: 'day.end', label: L.dayEnd, keywords: ['bedtime', 'night'] },
      { kind: 'time', key: 'day.wrapTime', label: L.wrapTime, keywords: ['close the day', 'evening'] },
      { kind: 'choice', key: 'day.transitionLead', label: L.transitionLead, numeric: true, options: ['5', '10', '15'].map((v) => ({ value: v, label: `${v} min` })), keywords: ['bridge', 'switch warning'] },
      { kind: 'choice', key: 'day.gentleBudget', label: L.gentleBudget, numeric: true, options: ['2', '3', '4', '5', '6', '8'].map((v) => ({ value: v, label: v })), keywords: ['day mode', 'budget'] },
      { kind: 'choice', key: 'day.minimumBudget', label: L.minimumBudget, numeric: true, options: ['1', '2', '3', '4'].map((v) => ({ value: v, label: v })), keywords: ['day mode', 'budget'] },
      { kind: 'switch', key: 'day.dayModeSuggestions', label: L.dayModeSuggestions, help: H.dayModeSuggestions, keywords: ['day mode', 'banner'] },
      { kind: 'switch', key: 'day.showMoved', label: L.showMoved, keywords: ['moved tasks'] },
      { kind: 'switch', key: 'day.morningCard', label: L.morningCard, keywords: ['morning'] },
      { kind: 'switch', key: 'day.wrapCard', label: L.wrapCard, keywords: ['evening', 'close the day'] },
    ],
  },
  {
    id: 'focus',
    entries: [
      { kind: 'choice', key: 'focus.defaultMinutes', label: L.focusMinutes, options: [{ value: 'auto', label: L.focusAuto }, ...['5', '10', '15', '25'].map((v) => ({ value: v, label: `${v} min` }))], keywords: ['timer', 'pomodoro', 'minutes'] },
      { kind: 'switch', key: 'focus.companionActivity', label: L.companionActivity, keywords: ['body doubling'] },
      { kind: 'switch', key: 'focus.endSound', label: L.endSound, keywords: ['alarm', 'end sound'] },
      { kind: 'switch', key: 'focus.keepAwake', label: L.keepAwake, help: H.keepAwake, keywords: ['screen on', 'wake lock', 'sleep'] },
    ],
  },
  {
    id: 'patterns',
    entries: [
      { kind: 'switch', key: 'patterns.enabled', label: L.patternsEnabled, keywords: ['patterns', 'insights'] },
      { kind: 'choice', key: 'patterns.minEvidence', label: L.minEvidence, help: H.minEvidence, numeric: true, options: opts(L.minEvidences), keywords: ['evidence'] },
      { kind: 'choice', key: 'patterns.defaultPeriod', label: L.defaultPeriod, numeric: true, options: opts(L.periods), keywords: ['week', 'month'] },
      { kind: 'custom', id: 'showDismissed', label: L.showDismissed, keywords: ['dismissed', 'not true'] },
    ],
  },
  {
    id: 'shore',
    entries: [
      { kind: 'choice', key: 'shore.sky', label: L.shoreSky, options: opts(L.shoreSkies), keywords: ['sky', 'sunset', 'beach'] },
      { kind: 'switch', key: 'shore.showLabels', label: L.shoreLabels, keywords: ['labels', 'names'] },
    ],
  },
  {
    id: 'privacy',
    entries: [
      { kind: 'custom', id: 'ai', label: copy.settings.useAi, keys: ['aiEnabled'], keywords: ['ai', 'suggestions', 'privacy'] },
      { kind: 'switch', key: 'privacy.naturalVoiceAllowed', label: L.naturalAllowed, keywords: ['cloud voice'] },
      { kind: 'custom', id: 'data', label: copy.settings.yourData, keywords: ['export', 'delete', 'download', 'data'] },
      { kind: 'custom', id: 'backup', label: L.importBackup, keywords: ['import', 'backup', 'restore', 'settings file'] },
    ],
  },
  { id: 'people', entries: [{ kind: 'custom', id: 'people', label: copy.settings.people, keywords: ['contacts', 'trusted', 'campus', 'support', 'counselor'] }] },
  {
    id: 'shortcuts',
    entries: [
      { kind: 'switch', key: 'shortcuts.enabled', label: L.shortcuts, help: H.shortcuts, keywords: ['keyboard', 'keys', 'hotkeys', 'shortcuts'] },
      { kind: 'custom', id: 'shortcutsList', label: copy.shortcuts.title, keywords: ['keyboard', 'keys'] },
    ],
  },
  { id: 'demo', entries: [{ kind: 'custom', id: 'demo', label: copy.settings.demo, keywords: ['demo', 'example', 'maya', 'tour'] }] },
  { id: 'about', entries: [{ kind: 'custom', id: 'about', label: copy.settings.about, keywords: ['version', 'credits', 'about', "what's new"] }] },
];

export function sectionById(id: string) {
  return SECTIONS.find((s) => s.id === id);
}

export function anchorFor(entry: Entry): string {
  return entry.kind === 'custom' ? `setting-${entry.id}` : `setting-${String(entry.key).replace(/\./g, '-')}`;
}

// The keys a section owns, for "Reset this section".
export function keysOf(sectionId: SectionId): Key[] {
  const section = sectionById(sectionId);
  if (!section) return [];
  return section.entries.flatMap((e) => (e.kind === 'custom' ? (e.keys ?? []) : [e.key]));
}
