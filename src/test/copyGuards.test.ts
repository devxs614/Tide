// The copy pass from Phase V11, kept as a test so later strings follow it
// too: no emojis anywhere in Tide's words (icons always come with text
// instead), and none of the guilt phrases that creep into productivity apps.
// "Stuck is information, not failure" is the one sentence allowed to say
// "failure", because it says the opposite.
import { describe, expect, it } from 'vitest';
import { copy } from '@/copy/en';
import { COMPANION_COPY } from '@/copy/companionCopy';
import * as companions from '@/copy/companions';
import { onboardingCopy } from '@/copy/onboardingCopy';
import { settingsCopy } from '@/copy/settingsCopy';
import { screenHelpCopy } from '@/copy/screenHelpCopy';
import { toolsCopy } from '@/copy/toolsCopy';
import { eventEditCopy } from '@/copy/eventEditCopy';
import { doneCopy } from '@/copy/doneCopy';
import { focusAlertCopy } from '@/copy/focusAlertCopy';
import { nudgeCopy } from '@/copy/nudgeCopy';

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const ALL = [...strings(copy), ...strings(onboardingCopy), ...strings(settingsCopy), ...strings(screenHelpCopy), ...strings(toolsCopy),
  ...strings(eventEditCopy), ...strings(doneCopy), ...strings(focusAlertCopy), ...strings(nudgeCopy), ...strings(COMPANION_COPY), ...strings(companions)];
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

  // v2.1 F-07: drifting is normal. Nudges never call it a distraction or a
  // failure, never say "again", and every mode has its own wording.
  it('keeps refocus nudges kind, in every mode', () => {
    const NUDGE_WORDS = [/distracted/i, /lost focus/i, /fail/i, /again\?/i];
    expect(strings(nudgeCopy).filter((s) => NUDGE_WORDS.some((re) => re.test(s)))).toEqual([]);
    for (const variants of [nudgeCopy.title, nudgeCopy.returnTitle]) {
      expect(Object.keys(variants).sort()).toEqual(['direct', 'gentle', 'literal']);
      expect(new Set(Object.values(variants)).size).toBe(3);
    }
  });
});
