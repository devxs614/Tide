// The layout audit (scripts/audit) visits every Settings page by name; when
// someone adds a section, this fails until the audit visits it too.
import { describe, expect, it } from 'vitest';
import { SECTIONS } from '@/lib/settings/catalog';
import { SETTINGS_SECTIONS, STATES } from '../../scripts/audit/states.ts';

describe('layout audit coverage', () => {
  it('visits every Settings section', () => {
    expect([...SETTINGS_SECTIONS].sort()).toEqual(SECTIONS.map((s) => s.id).sort());
  });

  it('gives every state a unique id', () => {
    const ids = STATES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
