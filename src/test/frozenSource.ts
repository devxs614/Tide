// Pulls the exact source text of a top-level declaration out of a file, for
// the dictation freeze test. It is deliberately simple: a declaration runs
// from its keyword to the first line that is just "}" (or to the ";" of a
// one-line type alias), which is how every frozen piece is written.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');

export function readSource(file: string): string {
  return readFileSync(path.join(root, file), 'utf8');
}

export function declarationSource(source: string, name: string): string {
  const start = source.search(new RegExp(`^(export )?(interface|type|function) ${name}\\b`, 'm'));
  if (start < 0) throw new Error(`${name} not found`);
  const rest = source.slice(start);
  if (/^(export )?type /.test(rest)) return rest.slice(0, rest.indexOf(';') + 1);
  const end = rest.search(/^\}$/m);
  if (end < 0) throw new Error(`end of ${name} not found`);
  return rest.slice(0, end + 1);
}

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}
