// Turns text written for the screen into text written for the ear (v2 spec
// 7.4). Voices stumble on "·", "→", "4/5", "min" and missing full stops, and
// on a device set to Spanish they read digits in Spanish ("Breathe in for
// cuatro"), so every number becomes an English word too (Tide, D57). The
// result is split into sentence-sized chunks, because Chrome quietly stops
// speaking after about 15 seconds of one long utterance.
import { numberInWords, spokenText } from '@/lib/spokenNumbers';

const DAYS: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};
const MONTHS: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', Jun: 'June', Jul: 'July', Aug: 'August',
  Sep: 'September', Sept: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};

function endWithPunctuation(sentence: string): string {
  const s = sentence.trim();
  if (!s) return s;
  return /[.!?…]$/.test(s) ? s : `${s}.`;
}

function unit(n: string, singular: string): string {
  return `${n} ${Number(n) === 1 ? singular : `${singular}s`}`;
}

export function speechText(input: string | string[]): string {
  let text = Array.isArray(input) ? input.map(endWithPunctuation).filter(Boolean).join(' ') : input;

  text = text
    // Leftovers that should never be read: unfilled {placeholders}, markdown.
    .replace(/\{[a-zA-Z_]+\}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]+/g, '')
    // Emojis and the invisible characters that come with them.
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    // "Tide" in quotes around a single word just reads as Tide.
    .replace(/(?<![\p{L}])["“”'‘’]([\p{L}-]+)["“”'‘’](?![\p{L}])/gu, '$1')
    // Literal mode writes "Ebb (low energy, unpleasant)"; say it as two parts.
    .replace(/\b(Surge|Swell|Ebb|Still) \(([^)]+)\)/g, (_, q: string, rest: string) => `${q}. ${rest.charAt(0).toUpperCase()}${rest.slice(1)}.`)
    // "Tue, Oct 27" → "Tuesday, October 27".
    .replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b,?\s+(?=(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b)/g, (_, d: string) => `${DAYS[d]}, `)
    .replace(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b\.?(?=\s+\d)/g, (m: string) => MONTHS[m.replace('.', '')] ?? m)
    // Symbols voices read aloud or skip.
    .replace(/\s*[·•]\s*/g, ', ')
    .replace(/\s*→\s*/g, ' to ')
    .replace(/\s*≥\s*/g, ' at least ')
    .replace(/\s*≤\s*/g, ' at most ')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\b(\d+)\s*\/\s*(\d+)\b/g, '$1 out of $2')
    // Short units become words, singular when it's one.
    .replace(/\b(\d+)\s?(?:mins?|minutes?)\b/g, (_, n: string) => unit(n, 'minute'))
    .replace(/\b(\d+)\s?(?:secs?|seconds?)\b/g, (_, n: string) => unit(n, 'second'))
    .replace(/\b(\d+)\s?(?:hrs?|hours?)\b/g, (_, n: string) => unit(n, 'hour'))
    // A 24-hour time like 15:40 is read as "3 40 PM".
    .replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b(?!\s*[ap]\.?m\b)/gi, (match: string, h: string, m: string) => {
      const hour = Number(h);
      if (hour < 13 && hour !== 0) return match;
      const twelve = hour % 12 === 0 ? 12 : hour % 12;
      return `${twelve}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    });

  text = spokenText(text)
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,;])\1+/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return endWithPunctuation(text);
}

// Splits text into pieces of at most `max` characters, at sentence ends
// first, then at commas, then between words, so each piece sounds whole.
export function speechChunks(text: string, max = 180): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g) ?? [text];
  const chunks: string[] = [];
  let current = '';
  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };
  const add = (piece: string) => {
    if ((current + piece).length > max) flush();
    current += piece;
  };
  for (const sentence of sentences) {
    if (sentence.length <= max) {
      add(sentence);
      continue;
    }
    for (const part of sentence.split(/(?<=,)\s+/)) {
      if (part.length <= max) {
        add(`${part} `);
        continue;
      }
      for (const word of part.split(/\s+/)) add(`${word} `);
    }
  }
  flush();
  return chunks;
}

export { numberInWords };
