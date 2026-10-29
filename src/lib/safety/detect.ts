// The safety pre-check that runs on any free text before it goes near the
// AI: check-in words, brain dumps, parking notes, typed wins. If it fires,
// Tide shows people Maya can reach instead of coaching her, and the text is
// not saved. It runs in the browser, so it works offline and with AI off.
import { SAFETY_PHRASES } from './keywords';

// Lower case, accents removed ("daño" → "dano"), apostrophes dropped, and
// everything else that isn't a letter or digit turned into a space, so
// "Self-harm", "self harm" and "SELF  HARM!" all look the same.
export function normalizeForSafety(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const NORMALIZED_PHRASES = Array.from(new Set(SAFETY_PHRASES.map(normalizeForSafety))).filter(Boolean);

export function detectCrisis(text: string | undefined | null): boolean {
  if (!text) return false;
  // Padding with spaces makes every phrase match only on whole words:
  // "matarme" fires, but "suicidesquad" or "rematarmelo" would not.
  const haystack = ` ${normalizeForSafety(text)} `;
  return NORMALIZED_PHRASES.some((phrase) => haystack.includes(` ${phrase} `));
}
