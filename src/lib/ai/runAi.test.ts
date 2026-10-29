import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMOTION_IDS } from '@/data/emotions';
import { resetAiClientStateForTests, runAi } from './runAi';
import type { AiInputs } from './types';

const labelInput: AiInputs['label'] = {
  mode: 'gentle',
  localTime: 'Thu 3:40 pm',
  text: 'Heavy. Annoyed at myself.',
  vocabulary: EMOTION_IDS,
};

const aiAnswer = {
  candidates: [
    { id: 'drained', definition: 'Low battery', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'Too much', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: 'Tired or too much?',
  safetyFlag: false,
};

function mockFetch(handler: (url: string) => unknown) {
  const fn = vi.fn(async (url: string) => {
    if (url === '/api/config') return new Response(JSON.stringify({ timeoutMs: 200, demoTimeoutMs: 100 }));
    const body = handler(url);
    return new Response(JSON.stringify(body));
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => resetAiClientStateForTests());
afterEach(() => vi.unstubAllGlobals());

describe('runAi', () => {
  it('uses the AI answer when it is valid', async () => {
    mockFetch(() => ({ ok: true, data: aiAnswer, source: 'ai' }));
    const result = await runAi('label', labelInput, { aiEnabled: true, demoMode: false });
    expect(result.source).toBe('ai');
    expect(result.data.candidates[0].id).toBe('drained');
  });

  it('falls back when the route reports an error', async () => {
    mockFetch(() => ({ ok: false, error: 'missing_key' }));
    const result = await runAi('label', labelInput, { aiEnabled: true, demoMode: false });
    expect(result.source).toBe('fallback');
    expect(result.data.candidates).toHaveLength(3);
  });

  it('falls back when the answer fails validation in the browser', async () => {
    mockFetch(() => ({ ok: true, data: { ...aiAnswer, candidates: aiAnswer.candidates.slice(0, 2) } }));
    expect((await runAi('label', labelInput, { aiEnabled: true, demoMode: false })).source).toBe('fallback');
  });

  it('makes no network call at all when AI is off', async () => {
    const fn = mockFetch(() => ({ ok: true, data: aiAnswer }));
    const result = await runAi('label', labelInput, { aiEnabled: false, demoMode: false });
    expect(result.source).toBe('fallback');
    expect(fn).not.toHaveBeenCalled();
  });

  it('stops before any AI call when the text sounds like a crisis', async () => {
    const fn = mockFetch(() => ({ ok: true, data: aiAnswer }));
    const result = await runAi('label', { ...labelInput, text: 'I want to die' }, { aiEnabled: true, demoMode: false });
    expect(result.safetyTriggered).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });

  it("treats the model's own safety flag like a keyword hit", async () => {
    mockFetch(() => ({ ok: true, data: { ...aiAnswer, safetyFlag: true } }));
    const result = await runAi('label', labelInput, { aiEnabled: true, demoMode: false });
    expect(result.safetyTriggered).toBe(true);
  });

  it('falls back on a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))));
    const result = await runAi('label', labelInput, { aiEnabled: true, demoMode: false });
    expect(result.source).toBe('fallback');
  });
});
