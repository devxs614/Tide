// Compares two visual-baseline runs pixel by pixel (v2.2 spec 3.3), at
// pixelmatch's 0.1 color threshold. Every screenshot gets a diff
// percentage; a size change counts as a difference too, since a page that
// grew or shrank changed. Diff images go next to the "after" run so a
// person can look at what moved.
//
// node scripts/visual-compare.ts --from=baseline --to=after
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const from = arg('from') ?? 'baseline';
const to = arg('to') ?? 'after';
const root = path.resolve(import.meta.dirname, '..');
const dirA = path.join(root, 'e2e', '__visual__', from);
const dirB = path.join(root, 'e2e', '__visual__', to);
const diffDir = path.join(root, 'e2e', '__visual__', `diff-${from}-${to}`);
mkdirSync(diffDir, { recursive: true });

interface Row {
  shot: string;
  diffPercent: number | null;
  note: string;
}
const rows: Row[] = [];
for (const file of readdirSync(dirA).filter((f) => f.endsWith('.png')).sort()) {
  const shot = file.replace(/\.png$/, '');
  if (!existsSync(path.join(dirB, file))) {
    rows.push({ shot, diffPercent: null, note: `missing in ${to}` });
    continue;
  }
  const a = PNG.sync.read(readFileSync(path.join(dirA, file)));
  const b = PNG.sync.read(readFileSync(path.join(dirB, file)));
  if (a.width !== b.width || a.height !== b.height) {
    rows.push({ shot, diffPercent: 100, note: `size ${a.width}x${a.height} -> ${b.width}x${b.height}` });
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  if (changed) writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
  rows.push({ shot, diffPercent: Math.round((changed / (a.width * a.height)) * 10000) / 100, note: changed ? `${changed} px` : '' });
}

const changedRows = rows.filter((r) => r.diffPercent !== 0);
writeFileSync(path.join(root, 'e2e', `visual-compare-${from}-${to}.json`), JSON.stringify({ from, to, createdAt: new Date().toISOString(), rows }, null, 2));
console.log(`${rows.length} screenshots compared, ${changedRows.length} with differences`);
for (const r of changedRows) console.log(`  ${r.shot}: ${r.diffPercent === null ? '-' : `${r.diffPercent}%`} ${r.note}`);
