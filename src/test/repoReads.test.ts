// Deleted tasks and events (v2.1 F-03, F-04) only stay hidden everywhere if
// every screen reads them through src/lib/repo/ (taskQueries.ts and
// eventQueries.ts filter them out). This fails on a direct `db.tasks`,
// `db.events` or `db.eventSeries` read anywhere else. src/lib/db.ts only lists
// the table, and tests may set data up directly.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(__dirname, '..');

function filesUnder(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const allowed = (file: string) => file.includes(`${path.sep}lib${path.sep}repo${path.sep}`) || file.endsWith(path.join('lib', 'db.ts'));

describe('reads go through the repo', () => {
  it.each([
    ['tasks', /\bdb\.tasks\b/],
    ['events', /\bdb\.(events|eventSeries)\b/],
  ])('reads %s only in src/lib/repo/', (_, pattern) => {
    const offenders = filesUnder(SRC)
      .filter((f) => !allowed(f) && pattern.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
