// Companion names (v2 spec 8.7): 1 to 16 characters of letters, spaces,
// hyphens and apostrophes, trimmed. "Letters" means any alphabet's, so
// "Zoë", "Ñoño" and "Mochi-San" are all fine; digits and emoji are not.
export type NameProblem = 'empty' | 'long' | 'chars';

const MAX = 16;
// \p{L} is any letter, \p{M} the accents some letters are typed with. Both
// straight and curly apostrophes, since phones insert the curly one.
const ALLOWED = /^[\p{L}\p{M}' ’-]+$/u;

export function cleanCompanionName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function companionNameProblem(raw: string): NameProblem | null {
  const name = cleanCompanionName(raw);
  if (!name) return 'empty';
  if ([...name].length > MAX) return 'long';
  if (!ALLOWED.test(name)) return 'chars';
  return null;
}
