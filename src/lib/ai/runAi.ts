// Every AI suggestion in the browser goes through runAi, so the safety check
// and the fallback can never be skipped by a screen.

// What happens when a screen asks for a suggestion, in order:
// 1. Safety pre-check on any free text: if it fires, no AI call is made.
// 2. AI switched off in Settings: answer from the built-in fallback.
// 3. Demo mode with a saved answer for this exact input: race the live call
//    against the saved answer (which arrives after 900 ms).
// 4. Otherwise call /api/ai/<route> with a timeout, and validate the reply.
// 5. Any failure at all: the built-in fallback. Maya is never left waiting.
import { detectCrisis } from '@/lib/safety/detect';
import { findCachedResponse } from '@/data/demo/cachedResponses';
import {
  BridgeOutput,
  DayModeOutput,
  LabelOutput,
  NarrateOutput,
  WrapupOutput,
  checkWrapupOutput,
  UnstickOutput,
  checkBridgeOutput,
  checkDayModeOutput,
  checkLabelOutput,
  checkNarrateKeys,
  checkUnstickOutput,
} from './schemas';
import { bridgeFallback, dayModeFallback, labelFallback, narrateFallback, unstickFallback, wrapupFallback } from './fallbacks';
import type { AiInputs, AiOutputs, AiResult, AiRouteName, AiSource } from './types';

export const DEMO_CACHE_DELAY_MS = 900;

// The autoplay tour uses only the saved demo answers (v2 spec 16.3), so it
// plays the same way every time and works with no network at all.
let forceCache = false;
export function setDemoForceCache(on: boolean): void {
  forceCache = on;
}

interface ClientConfig {
  timeoutMs: number;
  demoTimeoutMs: number;
}

const DEFAULT_CONFIG: ClientConfig = { timeoutMs: 8000, demoTimeoutMs: 4000 };
let configPromise: Promise<ClientConfig> | null = null;

function loadConfig(): Promise<ClientConfig> {
  configPromise ??= fetch('/api/config')
    .then((r) => (r.ok ? r.json() : DEFAULT_CONFIG))
    .then((c) => ({
      timeoutMs: Number(c?.timeoutMs) || DEFAULT_CONFIG.timeoutMs,
      demoTimeoutMs: Number(c?.demoTimeoutMs) || DEFAULT_CONFIG.demoTimeoutMs,
    }))
    .catch(() => DEFAULT_CONFIG);
  return configPromise;
}

export function resetAiClientStateForTests(): void {
  configPromise = null;
  recentSources.length = 0;
}

export function fallbackFor<R extends AiRouteName>(route: R, input: AiInputs[R]): AiOutputs[R] {
  const table = {
    label: () => labelFallback(input as AiInputs['label']),
    unstick: () => unstickFallback(input as AiInputs['unstick']),
    daymode: () => dayModeFallback(input as AiInputs['daymode']),
    bridge: () => bridgeFallback(input as AiInputs['bridge']),
    narrate: () => narrateFallback(input as AiInputs['narrate']),
    wrapup: () => wrapupFallback(input as AiInputs['wrapup']),
  };
  return table[route]() as AiOutputs[R];
}

// The free text each route carries, for the safety pre-check.
function freeText(route: AiRouteName, input: unknown): Array<string | undefined> {
  if (route === 'label') return [(input as AiInputs['label']).text];
  if (route === 'unstick') return [(input as AiInputs['unstick']).parkingNote];
  return [];
}

// The browser re-checks every answer with the same rules as the server, so
// a stale deployment or a proxy can't slip a malformed answer through.
function acceptable<R extends AiRouteName>(route: R, input: AiInputs[R], data: unknown): data is AiOutputs[R] {
  const checks = {
    label: () => LabelOutput.safeParse(data).success && !checkLabelOutput(input as AiInputs['label'], data as AiOutputs['label']),
    unstick: () => UnstickOutput.safeParse(data).success && !checkUnstickOutput(input as AiInputs['unstick'], data as AiOutputs['unstick']),
    daymode: () => DayModeOutput.safeParse(data).success && !checkDayModeOutput(input as AiInputs['daymode'], data as AiOutputs['daymode']),
    bridge: () => BridgeOutput.safeParse(data).success && !checkBridgeOutput(input as AiInputs['bridge'], data as AiOutputs['bridge']),
    narrate: () => NarrateOutput.safeParse(data).success && !checkNarrateKeys(input as AiInputs['narrate'], data as AiOutputs['narrate']),
    wrapup: () => WrapupOutput.safeParse(data).success && !checkWrapupOutput(input as AiInputs['wrapup'], data as AiOutputs['wrapup']),
  };
  return checks[route]();
}

async function callRoute<R extends AiRouteName>(route: R, input: AiInputs[R], timeoutMs: number): Promise<AiOutputs[R] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`/api/ai/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const body = await res.json();
    return body?.ok && acceptable(route, input, body.data) ? body.data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Where recent answers came from, for Settings → About suggestions.
const recentSources: AiSource[] = [];

export function recentAiSources(): AiSource[] {
  return [...recentSources];
}

function finish<R extends AiRouteName>(route: R, data: AiOutputs[R], source: AiSource, safety = false): AiResult<R> {
  recentSources.unshift(source);
  recentSources.length = Math.min(recentSources.length, 10);
  const flagged = route === 'label' && (data as AiOutputs['label']).safetyFlag;
  return { data, source, safetyTriggered: safety || flagged };
}

export async function runAi<R extends AiRouteName>(
  route: R,
  input: AiInputs[R],
  opts: { aiEnabled: boolean; demoMode: boolean },
): Promise<AiResult<R>> {
  if (freeText(route, input).some((t) => detectCrisis(t))) {
    return finish(route, fallbackFor(route, input), 'fallback', true);
  }
  if (!opts.aiEnabled) return finish(route, fallbackFor(route, input), 'fallback');

  const config = await loadConfig();
  const cached = opts.demoMode ? findCachedResponse(route, input) : undefined;
  if (cached && forceCache) {
    await sleep(DEMO_CACHE_DELAY_MS);
    return finish(route, cached, 'demo-cache');
  }
  const live = callRoute(route, input, opts.demoMode ? config.demoTimeoutMs : config.timeoutMs);
  if (cached) {
    // A failed live call never wins the race; the saved answer arrives anyway.
    const winner = await Promise.race([
      live.then((data) => (data ? data : new Promise<never>(() => {}))),
      sleep(DEMO_CACHE_DELAY_MS).then(() => null),
    ]);
    return winner ? finish(route, winner, 'ai') : finish(route, cached, 'demo-cache');
  }

  const data = await live;
  return data ? finish(route, data, 'ai') : finish(route, fallbackFor(route, input), 'fallback');
}
