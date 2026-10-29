// The five /api/ai routes with the Anthropic SDK faked: the reply envelope,
// schema and meaning checks, the missing-key answer and the rate limit.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMOTION_IDS } from '@/data/emotions';

const sdk = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@anthropic-ai/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@anthropic-ai/sdk')>();
  class FakeAnthropic {
    static APIUserAbortError = actual.default.APIUserAbortError;
    static APIConnectionTimeoutError = actual.default.APIConnectionTimeoutError;
    messages = { create: sdk.create };
  }
  return { ...actual, default: FakeAnthropic };
});

import { POST as labelPOST } from './label/route';
import { POST as narratePOST } from './narrate/route';
import { POST as daymodePOST } from './daymode/route';
import { GET as configGET } from '../config/route';
import { resetClientForTests } from '@/lib/ai/client';
import { resetRateLimitForTests } from '@/lib/ai/rateLimit';

const reply = (data: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(data) }], stop_reason: 'end_turn' });
const post = (body: unknown) =>
  new Request('http://localhost/api/ai/x', { method: 'POST', body: JSON.stringify(body), headers: { 'x-forwarded-for': '10.0.0.1' } });

const labelInput = { mode: 'gentle', localTime: 'Thu 3:40 pm', text: 'Heavy and annoyed', vocabulary: EMOTION_IDS };
const good = {
  candidates: [
    { id: 'drained', definition: 'Low battery', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'Too much', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: 'Tired or too much?',
  safetyFlag: false,
};

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  resetClientForTests();
  resetRateLimitForTests();
  sdk.create.mockReset();
});

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.TIDE_RATE_LIMIT_MAX;
});

describe('/api/ai routes', () => {
  it('returns a valid label answer in the envelope, using the prompt files', async () => {
    sdk.create.mockResolvedValueOnce(reply(good));
    const res = await labelPOST(post(labelInput));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: good, source: 'ai' });
    const params = sdk.create.mock.calls[0][0];
    expect(params.system).toContain('You are the suggestion engine inside Tide');
    expect(params.system).toContain('TASK: Help the user find words for how they feel.');
    expect(params.max_tokens).toBe(500);
  });

  it('turns a made-up emotion id (twice) into an error so the browser falls back', async () => {
    const bad = structuredClone(good);
    bad.candidates[0].id = 'melancholic';
    sdk.create.mockResolvedValue(reply(bad));
    const res = await labelPOST(post(labelInput));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_output' });
  });

  it('rejects input that breaks the schema before calling the model', async () => {
    const res = await labelPOST(post({ ...labelInput, text: 'x'.repeat(601) }));
    expect(res.status).toBe(400);
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it('answers missing_key when no key is configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    resetClientForTests();
    const res = await labelPOST(post(labelInput));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: 'missing_key' });
  });

  it('rate limits per IP', async () => {
    process.env.TIDE_RATE_LIMIT_MAX = '1';
    sdk.create.mockResolvedValue(reply(good));
    expect((await labelPOST(post(labelInput))).status).toBe(200);
    const limited = await labelPOST(post(labelInput));
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ ok: false, error: 'rate_limited' });
  });

  it('rejects a Day Mode plan that leaves a task out', async () => {
    const input = {
      mode: 'gentle',
      requestedMode: 'gentle',
      today: '2026-11-05',
      state: { quadrant: 'ebb', energy: -2, pleasantness: -3 },
      energyBudget: 4,
      tasks: [
        { id: 'a', title: 'A', type: 'writing', energyCost: 3, due: null, status: 'in_progress' },
        { id: 'b', title: 'B', type: 'admin', energyCost: 1, due: null, status: 'not_started' },
      ],
      events: [],
    };
    sdk.create.mockResolvedValue(reply({ keep: ['a'], move: [], rationale: 'x' }));
    const res = await daymodePOST(post(input));
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_output' });
  });

  it('swaps a narrated card with an invented number for the template card', async () => {
    const input = {
      mode: 'gentle',
      patterns: [{ key: 'strategyEffect:c-box', kind: 'strategy_effect', facts: { strategyName: 'Box breathing', k: 4, n: 5 } }],
    };
    sdk.create.mockResolvedValueOnce(
      reply({ cards: [{ key: 'strategyEffect:c-box', title: 'Box breathing works', body: 'It helps 90% of the time.', whyText: 'From 5 tries.' }] }),
    );
    const body = await (await narratePOST(post(input))).json();
    expect(body.ok).toBe(true);
    expect(body.data.cards[0].body).not.toContain('90');
    expect(body.data.cards[0].whyText).toContain('you felt better 4 times');
  });

  it('exposes timeouts and whether a key exists, never the key', async () => {
    const body = await (await configGET()).json();
    expect(body).toEqual({ timeoutMs: 8000, demoTimeoutMs: 4000, hasKey: true });
    expect(JSON.stringify(body)).not.toContain('test-key');
  });
});
