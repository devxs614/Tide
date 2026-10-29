// Measures the first-load JavaScript of pages on a running production server
// (`npm run build && npx next start -p 3100`), gzipped, the way the v2 budget
// is defined (≤ 300 KB for `/`). Next 16's build output no longer prints it.
// Usage: node scripts/measure-first-load.mjs / /tasks /shore
import zlib from 'node:zlib';

const base = process.env.TIDE_BASE_URL ?? 'http://localhost:3100';
for (const route of process.argv.slice(2)) {
  const html = await (await fetch(base + route)).text();
  // Modern browsers skip <script nomodule> (Next's legacy polyfills), so they don't count.
  const tags = [...html.matchAll(/<script[^>]*>/g)].map((m) => m[0]).filter((t) => !/nomodule/i.test(t));
  const srcs = [...new Set(tags.map((t) => t.match(/src="([^"]+\.js[^"]*)"/)?.[1]).filter(Boolean))];
  let raw = 0;
  let gz = 0;
  for (const src of srcs) {
    const buf = Buffer.from(await (await fetch(base + src)).arrayBuffer());
    raw += buf.length;
    gz += zlib.gzipSync(buf).length;
  }
  console.log(`${route}  scripts ${srcs.length}  raw ${(raw / 1024).toFixed(0)} KB  gzip ${(gz / 1024).toFixed(0)} KB`);
}
