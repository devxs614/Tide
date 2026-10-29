// Guard tests for two project rules that are easy to break by accident:
// only lib/clock.ts may read the system clock (so demo mode can't drift), and
// components never use raw hex colors (so dark mode and the tokens stay the
// single source of color).
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(__dirname, '..');

function filesUnder(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('project rules', () => {
  it('reads the system clock only inside lib/clock.ts', () => {
    const needle = ['Date', 'now('].join('.');
    const offenders = filesUnder(SRC)
      .filter((f) => !f.endsWith(path.join('lib', 'clock.ts')))
      .filter((f) => fs.readFileSync(f, 'utf8').includes(needle))
      .map((f) => path.relative(SRC, f));
    expect(offenders).toEqual([]);
  });

  it('keeps raw hex colors out of components', () => {
    const hex = /#[0-9a-fA-F]{3,8}\b/;
    const offenders = filesUnder(path.join(SRC, 'components'))
      .filter((f) => hex.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
