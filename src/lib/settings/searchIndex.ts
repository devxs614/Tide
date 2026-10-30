// Settings search (v2 spec 15.4): every control's label, help and the words
// people actually type ("dark mode", "pet", "dyslexia"), scored on whole
// words, then prefixes, then parts of words. Small on purpose; no library.
import { copy } from '@/copy/en';
import { SECTIONS, anchorFor, type SectionId } from './catalog';

export interface SearchHit {
  section: SectionId;
  sectionLabel: string;
  anchor: string;
  label: string;
}

interface Doc extends SearchHit {
  words: string[];
  phrases: string[];
}

const tokens = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const DOCS: Doc[] = SECTIONS.flatMap((section) =>
  section.entries.map((entry) => {
    const sectionLabel = copy.set.sections[section.id];
    const help = 'help' in entry && entry.help ? entry.help : '';
    const keywords = entry.keywords ?? [];
    return {
      section: section.id,
      sectionLabel,
      anchor: anchorFor(entry),
      label: entry.label,
      words: tokens([entry.label, help, sectionLabel, ...keywords].join(' ')),
      phrases: keywords.map((k) => k.toLowerCase()),
    };
  }),
);

function score(doc: Doc, query: string, parts: string[]): number {
  let total = doc.phrases.includes(query) ? 10 : 0;
  for (const part of parts) {
    if (doc.words.includes(part)) total += 3;
    else if (doc.words.some((w) => w.startsWith(part))) total += 2;
    else if (part.length >= 3 && doc.words.some((w) => w.includes(part))) total += 1;
    else return 0;
  }
  return total;
}

export function searchSettings(raw: string, limit = 8): SearchHit[] {
  const query = raw.trim().toLowerCase();
  const parts = tokens(query);
  if (parts.length === 0) return [];
  return DOCS.map((doc) => ({ doc, s: score(doc, query, parts) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ doc }) => ({ section: doc.section, sectionLabel: doc.sectionLabel, anchor: doc.anchor, label: doc.label }));
}
