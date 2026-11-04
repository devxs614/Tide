// Static guards from the v2.2 bug sweep (spec 9): each one keeps a bug
// we fixed from coming back by accident in some other file. They read the
// source as text, so they're fast and need no browser.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(__dirname, '..');

function filesUnder(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(full);
    return /\.(ts|tsx|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

// Comments at a fix site name the old rule on purpose ("this used
// `anywhere`"), so they're left out of the search.
const code = (f: string) =>
  fs
    .readFileSync(path.join(SRC, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const offenders = (pattern: RegExp, allow: string[] = []) =>
  filesUnder(SRC)
    .map((f) => path.relative(SRC, f))
    .filter((f) => !allow.includes(f))
    .filter((f) => pattern.test(code(f)));

describe('sweep guards', () => {
  // B-03: `anywhere` and `break-all` let the browser shrink a box to one
  // letter's width, which is how "Toolkit" became "Toolki t". Automatic
  // hyphenation splits words too, and is harder for many dyslexic readers.
  it('never lets ordinary words split mid-word', () => {
    expect(offenders(/overflow-wrap:\s*anywhere|\[overflow-wrap:anywhere\]|wrap-anywhere|break-all|word-break:\s*break-all|hyphens-auto|hyphens:\s*auto/)).toEqual([]);
  });
});
