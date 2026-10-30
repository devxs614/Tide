// Companion lines (v2 spec 8.6, 21.2, Appendix B): every species has a line
// for every moment, Direct and Literal have shared lines for every moment,
// placeholders always get filled, and the file never picks up the phrases
// that turn a companion into a guilt trip.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SPECIES } from '@/lib/companion/registry';
import { COMPANION_LINES, LINE_CONTEXTS, SHARED_LINES, companionLine } from '../companions';

const asList = (x: string | string[]) => (Array.isArray(x) ? x : [x]);

describe('companion lines', () => {
  it.each(SPECIES)('%s has a line for every moment', (species) => {
    for (const context of LINE_CONTEXTS) {
      const lines = asList(COMPANION_LINES[species][context]);
      expect(lines.length, `${species}.${context}`).toBeGreaterThan(0);
      for (const line of lines) expect(line.trim().length, `${species}.${context}`).toBeGreaterThan(0);
    }
  });

  it('has shared Direct and Literal lines for every moment', () => {
    for (const mode of ['direct', 'literal'] as const) {
      for (const context of LINE_CONTEXTS) expect(asList(SHARED_LINES[mode][context]).length, `${mode}.${context}`).toBeGreaterThan(0);
    }
  });

  it('fills every placeholder, in every mode', () => {
    for (const species of SPECIES) {
      for (const mode of ['gentle', 'direct', 'literal'] as const) {
        for (const context of LINE_CONTEXTS) {
          for (const day of ['2026-10-01', '2026-10-02', '2026-10-03']) {
            const line = companionLine(species, context, mode, { name: 'Maya', quadrant: 'Ebb', m: 10 }, day);
            expect(line, `${species}.${mode}.${context}`).not.toMatch(/[{}]/);
          }
        }
      }
    }
  });

  it('leaves out the name gracefully when there is none', () => {
    for (const context of LINE_CONTEXTS) {
      const line = companionLine('otter', context, 'direct', { m: 10 }, '2026-10-01');
      expect(line).not.toMatch(/ ,|,\s*[.!?]|\s{2}/);
    }
  });

  // Appendix B gives one line per moment today; the date hash only matters
  // once a moment gets several, and then it must not flip between renders.
  it('picks the same line all day', () => {
    const a = companionLine('otter', 'greeting_morning', 'gentle', { name: 'Maya' }, '2026-10-01');
    expect(companionLine('otter', 'greeting_morning', 'gentle', { name: 'Maya' }, '2026-10-01')).toBe(a);
  });

  it('never uses the forbidden phrases anywhere in the file', () => {
    const source = readFileSync(path.join(__dirname, '..', 'companions.ts'), 'utf8').toLowerCase();
    for (const phrase of ['missed you', 'where were you', "haven't", 'havent', "don't forget", 'dont forget', 'should']) {
      expect(source, phrase).not.toContain(phrase);
    }
  });
});
