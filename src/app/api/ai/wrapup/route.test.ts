// /api/ai/wrapup with the Anthropic SDK faked (v2 spec 14.6), like the v1
// route tests: a good answer comes back in the envelope; a judging word
// (twice) becomes an error so the browser uses its template; bad input never
// reaches the model; and the student's own notes are never in the input.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import { WRAPUP_EXAMPLE_INPUT, findCachedResponse } from '@/data/demo/cachedResponses';
import { WrapupInput } from '@/lib/ai/schemas';
import { resetClientForTests } from '@/lib/ai/client';
import { resetRateLimitForTests } from '@/lib/ai/rateLimit';
import { POST } from './route';

const reply = (data: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(data) }], stop_reason: 'end_turn' });
const post = (body: unknown) => new Request('http://localhost/api/ai/wrapup', { method: 'POST', body: JSON.stringify(body), headers: { 'x-forwarded-for': '10.0.0.2' } });
const good = findCachedResponse('wrapup', WRAPUP_EXAMPLE_INPUT)!;

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  resetClientForTests();
  resetRateLimitForTests();
  sdk.create.mockReset();
});
afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe('/api/ai/wrapup', () => {
  it('returns a valid summary using the wrap-up prompt', async () => {
    sdk.create.mockResolvedValueOnce(reply(good));
    const res = await POST(post(WRAPUP_EXAMPLE_INPUT));
    expect(await res.json()).toEqual({ ok: true, data: good, source: 'ai' });
    const params = sdk.create.mock.calls[0][0];
    expect(params.system).toContain('You are the suggestion engine inside Tide');
    expect(params.system).toContain('TASK: Write a short, kind end-of-day summary');
    expect(params.max_tokens).toBe(600);
  });

  it('turns a judging answer (twice) into an error so the browser uses its template', async () => {
    sdk.create.mockResolvedValue(reply({ ...good, summary: 'Not a very productive day.' }));
    const res = await POST(post(WRAPUP_EXAMPLE_INPUT));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_output' });
  });

  it('rejects input that breaks the schema before calling the model', async () => {
    const res = await POST(post({ ...WRAPUP_EXAMPLE_INPUT, companionName: 'x'.repeat(30) }));
    expect(res.status).toBe(400);
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it('has no place for free-text notes in its input', () => {
    expect(Object.keys(WrapupInput.shape.reflection.shape).sort()).toEqual(['hard', 'helped', 'overall']);
  });
});
