import 'server-only';

// Loads the five system prompts from /prompts, the single source of truth
// that the AI Prompts PDF is also printed from. Reading the Markdown files at
// module load means there is exactly one copy of each prompt; next.config.ts
// makes sure the files ship with the server build.
import fs from 'node:fs';
import path from 'node:path';

export type AiRoute = 'label' | 'unstick' | 'daymode' | 'bridge' | 'narrate' | 'wrapup';

const FILES: Record<AiRoute | 'preamble', string> = {
  preamble: '00-shared-preamble.md',
  label: '01-label.md',
  unstick: '02-unstick.md',
  daymode: '03-daymode.md',
  bridge: '04-bridge.md',
  narrate: '05-narrate.md',
  wrapup: '06-wrapup.md',
};

function read(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'prompts', name), 'utf8').trim();
}

export const PROMPT_TEXT: Record<AiRoute | 'preamble', string> = {
  preamble: read(FILES.preamble),
  label: read(FILES.label),
  unstick: read(FILES.unstick),
  daymode: read(FILES.daymode),
  bridge: read(FILES.bridge),
  narrate: read(FILES.narrate),
  wrapup: read(FILES.wrapup),
};

export const PROMPT_FILES = FILES;

export function systemPrompt(route: AiRoute): string {
  return `${PROMPT_TEXT.preamble}\n\n${PROMPT_TEXT[route]}`;
}
