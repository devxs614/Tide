// Scores the voices a device offers, so read-aloud uses the most natural
// one instead of the browser's default (v2 spec 7.3). The default is often
// the worst: a novelty voice on a Mac, a legacy desktop voice on Windows, or
// (as the team found) a Spanish voice reading English on a Spanish-set Mac.
// Tide's additions to the spec's table are marked below and in D67.

export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
  default?: boolean;
}

// Never picked automatically and never offered: novelty voices, and (Tide's
// addition) the Mac's older robotic Eloquence voices.
const NOVELTY = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Good News', 'Jester', 'Organ',
  'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox', 'Fred', 'Junior', 'Ralph', 'Kathy', 'Princess',
  'Deranged', 'Hysterical',
  // Tide: Spanish-language names of the same novelty voices, and Eloquence.
  'Buenas noticias', 'Malas noticias', 'Eddy', 'Flo', 'Grandma', 'Grandpa', 'Reed', 'Rocko', 'Sandy', 'Shelley',
]);

const KNOWN_GOOD = [
  'Ava', 'Samantha', 'Allison', 'Susan', 'Zoe', 'Evan', 'Nathan', 'Tom', 'Serena', 'Daniel', 'Karen', 'Moira',
  'Tessa', 'Aria', 'Jenny', 'Guy', 'Sonia', 'Libby', 'Natasha', 'Emma', 'Brian', 'Andrew',
];

// Tide (D57): when two voices score the same, the softer one wins, because
// the team asked for a gentle voice.
const GENTLE = ['Ava', 'Zoe', 'Allison', 'Susan', 'Samantha', 'Serena', 'Moira', 'Jenny', 'Aria', 'Emma', 'Libby', 'Sonia'];

const LEGACY_DESKTOP = ['Microsoft David Desktop', 'Microsoft Zira Desktop', 'Microsoft Mark'];

function baseName(name: string): string {
  return name.split(' (')[0].trim();
}

function hasWord(name: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, 'i').test(name);
}

export function isEnglish(voice: VoiceLike): boolean {
  return /^en([-_]|$)/i.test(voice.lang);
}

export function scoreVoice(voice: VoiceLike, preferredLocale?: string): number {
  const name = voice.name;
  if (NOVELTY.has(baseName(name))) return -200;
  if (/espeak/i.test(name)) return -100;
  let score = 0;
  if (/natural/i.test(name)) score += 60;
  if (/neural/i.test(name)) score += 50;
  if (/premium/i.test(name)) score += 45;
  // "mejorada" is how a Mac set to Spanish labels Enhanced voices (Tide).
  if (/enhanced|mejorada|améliorée/i.test(name)) score += 40;
  if (/online/i.test(name)) score += 15;
  if (/^google/i.test(name)) score += 25;
  if (KNOWN_GOOD.some((good) => hasWord(name, good))) score += 15;
  if (GENTLE.some((soft) => hasWord(name, soft))) score += 3;
  if (!voice.localService) score += 8;
  if (preferredLocale && voice.lang.replace('_', '-').toLowerCase() === preferredLocale.toLowerCase()) score += 10;
  // Without a preference, US English is the safest default (Tide).
  if (!preferredLocale && /^en[-_]US$/i.test(voice.lang)) score += 5;
  if (/compact/i.test(name)) score -= 30;
  if (LEGACY_DESKTOP.some((legacy) => name.startsWith(legacy))) score -= 25;
  return score;
}

// English voices worth offering, best first. Network voices drop out while
// the device is offline, because they would fail silently.
export function rankVoices<V extends VoiceLike>(voices: V[], opts: { accent?: string; online?: boolean } = {}): V[] {
  const preferred = opts.accent && opts.accent !== 'auto' ? opts.accent : undefined;
  const online = opts.online ?? true;
  return voices
    .filter(isEnglish)
    .filter((v) => online || v.localService)
    .map((voice) => ({ voice, score: scoreVoice(voice, preferred) }))
    .filter(({ score }) => score > -100)
    .sort((a, b) => b.score - a.score)
    .map(({ voice }) => voice);
}

// The voice to use: the one Maya picked if this device has it (and it can
// work right now), otherwise the best-ranked one.
export function pickVoice<V extends VoiceLike>(
  voices: V[],
  opts: { chosenURI?: string | null; accent?: string; online?: boolean } = {},
): V | undefined {
  const ranked = rankVoices(voices, opts);
  if (opts.chosenURI) {
    const chosen = ranked.find((v) => v.voiceURI === opts.chosenURI || v.name === opts.chosenURI);
    if (chosen) return chosen;
  }
  return ranked[0];
}

// "Microsoft Aria Online (Natural) - English (United States)" reads better
// in a list as "Aria (Natural)".
export function cleanVoiceName(name: string): string {
  const quality = name.match(/\((Natural|Premium|Enhanced|mejorada)\)/i)?.[1];
  let base = name.replace(/^(Microsoft|Google|Apple)\s+/i, '').replace(/\s+Online/i, '');
  base = base.replace(/\s*[-–]\s*English.*$/i, '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
  return quality ? `${base} (${quality})` : base;
}
