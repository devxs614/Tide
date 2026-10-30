// The copy pass from Phase V11, kept as a test so later strings follow it
// too: no emojis anywhere in Tide's words (icons always come with text
// instead), and none of the guilt phrases that creep into productivity apps.
// "Stuck is information, not failure" is the one sentence allowed to say
// "failure", because it says the opposite.
import { describe, expect, it } from 'vitest';
import { copy } from '@/copy/en';
import { COMPANION_COPY } from '@/copy/companionCopy';
import * as companions from '@/copy/companions';

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const ALL = [...strings(copy), ...strings(COMPANION_COPY), ...strings(companions)];
const GUILT = [/missed you/i, /you failed/i, /\bstreak/i, /overdue/i, /\blazy\b/i, /should have/i, /fall(ing|en)? behind/i, /don't break/i, /\bfailure\b/i];
const ALLOWED = ['Stuck is information, not failure.'];

describe('copy rules', () => {
  it('has words to check', () => {
    expect(ALL.length).toBeGreaterThan(500);
  });

  it('uses no emojis', () => {
    expect(ALL.filter((s) => /\p{Extended_Pictographic}/u.test(s))).toEqual([]);
  });

  it('never uses guilt phrases', () => {
    const offenders = ALL.filter((s) => GUILT.some((re) => re.test(s)) && !ALLOWED.some((ok) => s.includes(ok)));
    expect(offenders).toEqual([]);
  });
});
