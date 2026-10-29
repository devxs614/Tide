// Pre-generates natural-voice clips for Tide's fixed texts (v2 spec 7.7):
// every strategy step, the breathing cues, the companion lines and the demo
// captions that exist, so the demo sounds natural even offline. Run it by
// hand with a provider key in .env.local:   npm run voice:clips
// It writes public/voice/<voice>/<sha>.mp3 and public/voice/manifest.json;
// `npm run voice:clips -- --dry-run` only counts what it would make.
// public/voice/ is git-ignored; commit the audio only if the team decides to.
import { createServer } from 'vite';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// Load .env.local without adding a dependency.
for (const file of ['.env.local', '.env']) {
  const full = path.join(root, file);
  if (!existsSync(full)) continue;
  for (const line of readFileSync(full, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const dryRun = process.argv.includes('--dry-run');
const provider = process.env.TIDE_TTS_PROVIDER === 'elevenlabs' ? 'elevenlabs' : 'openai';
const key = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.ELEVENLABS_API_KEY;
const configured = process.env.TIDE_TTS_PROVIDER === 'openai' || process.env.TIDE_TTS_PROVIDER === 'elevenlabs';
if (!dryRun && (!configured || !key)) {
  console.log('Set TIDE_TTS_PROVIDER (openai or elevenlabs) and its key in .env.local first. Nothing was generated.');
  console.log('To see what would be generated, run: npm run voice:clips -- --dry-run');
  process.exit(0);
}

// Vite loads the app's TypeScript modules with the @/ alias, so the script
// uses exactly the same speech text and hashing as the browser.
const vite = await createServer({
  root,
  logLevel: 'silent',
  server: { middlewareMode: true },
  resolve: { alias: { '@': path.join(root, 'src') } },
});
const load = (p) => vite.ssrLoadModule(p).catch(() => null);
const { speechText } = await load('/src/lib/voice/speechText.ts');
const { sha256Hex } = await load('/src/lib/voice/hash.ts');
const { requestSpeech } = await load('/src/lib/voice/ttsProviders.ts');
const { DEFAULT_CLOUD_VOICE } = await load('/src/data/voices.ts');
const strategies = await load('/src/data/strategies.ts');
const en = await load('/src/copy/en.ts');
const companions = await load('/src/copy/companions.ts');
const captions = await load('/src/demo/director/captions.ts');

const texts = new Set();
for (const s of strategies?.STRATEGIES ?? []) for (const step of s.steps) texts.add(step);
for (const cue of Object.values(en?.copy?.voice?.breath ?? {})) texts.add(cue);
const collect = (value) => {
  if (typeof value === 'string') texts.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
};
if (companions?.COMPANION_LINES) collect(companions.COMPANION_LINES);
for (const c of captions?.NARRATED_CAPTIONS ?? []) texts.add(c);

const voice = process.env.TIDE_TTS_CLIP_VOICE || DEFAULT_CLOUD_VOICE[provider];
const items = [...texts].filter((t) => !t.includes('{')).map((t) => speechText(t));
const estimateKb = items.reduce((sum, t) => sum + t.length, 0); // roughly 1 KB of mp3 per character
console.log(`${items.length} clips for voice "${voice}" (${provider}). Estimated size: about ${(estimateKb / 1024).toFixed(1)} MB.`);
if (dryRun) {
  await vite.close();
  process.exit(0);
}

const outDir = path.join(root, 'public', 'voice');
mkdirSync(path.join(outDir, voice), { recursive: true });
const manifestPath = path.join(outDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { voice, clips: {} };
if (manifest.voice !== voice) Object.assign(manifest, { voice, clips: {} });

let made = 0;
for (const text of items) {
  const sha = await sha256Hex(text);
  const rel = `${voice}/${sha}.mp3`;
  if (manifest.clips[sha] && existsSync(path.join(outDir, rel))) continue;
  const res = await requestSpeech(provider, key, { text, voice, speed: 1 }, process.env);
  if (!res.ok) {
    console.log(`Skipped one clip (provider answered ${res.status}).`);
    continue;
  }
  writeFileSync(path.join(outDir, rel), Buffer.from(await res.arrayBuffer()));
  manifest.clips[sha] = rel;
  made += 1;
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
const total = Object.values(manifest.clips).reduce((sum, rel) => sum + (existsSync(path.join(outDir, rel)) ? statSync(path.join(outDir, rel)).size : 0), 0);
console.log(`Made ${made} new clips. public/voice now holds ${(total / 1024 / 1024).toFixed(1)} MB.`);
await vite.close();
