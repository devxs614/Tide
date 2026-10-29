// The server-side model call: one retry with the validation error, the
// timeout, refusals and the missing key, all without a real network call.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

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

import { AiError, callJson, extractJson, resetClientForTests } from './client';

const Schema = z.object({ word: z.string() });
const reply = (text: string, stop_reason = 'end_turn') => ({ content: [{ type: 'text', text }], stop_reason });

const base = {
  model: 'claude-haiku-5-5',
  system: 'system',
  input: { text: 'hi' },
  schema: Schema,
  maxTokens: 100,
  timeoutMs: 1000,
};

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
  resetClientForTests();
  sdk.create.mockReset();
});

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe('callJson', () => {
  it('returns validated data on a good first answer, with thinking off for Haiku', async () => {
    sdk.create.mockResolvedValueOnce(reply('{"word":"calm"}'));
    await expect(callJson(base)).resolves.toEqual({ ok: true, data: { word: 'calm' } });
    const params = sdk.create.mock.calls[0][0];
    expect(params.thinking).toEqual({ type: 'disabled' });
    expect(params).not.toHaveProperty('temperature');
    expect(params.messages[0].content).toContain('INPUT (JSON):');
  });

  it('retries once with the validation error, then accepts a fixed answer', async () => {
    sdk.create.mockResolvedValueOnce(reply('{"wrong":1}')).mockResolvedValueOnce(reply('```json\n{"word":"ok"}\n```'));
    await expect(callJson(base)).resolves.toEqual({ ok: true, data: { word: 'ok' } });
    const retry = sdk.create.mock.calls[1][0].messages;
    expect(retry).toHaveLength(3);
    expect(retry[2].content).toMatch(/That output was invalid/);
  });

  it('gives up after two invalid answers', async () => {
    sdk.create.mockResolvedValue(reply('not json'));
    await expect(callJson(base)).rejects.toMatchObject({ code: 'invalid_output' });
    expect(sdk.create).toHaveBeenCalledTimes(2);
  });

  it('retries when the semantic check fails, not only the shape', async () => {
    sdk.create.mockResolvedValueOnce(reply('{"word":"melancholic"}')).mockResolvedValueOnce(reply('{"word":"calm"}'));
    const check = (o: { word: string }) => (o.word === 'calm' ? null : 'not in vocabulary');
    await expect(callJson({ ...base, check })).resolves.toEqual({ ok: true, data: { word: 'calm' } });
  });

  it('turns a slow answer into a timeout', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    sdk.create.mockImplementation(
      (_params: unknown, opts: { signal: AbortSignal }) =>
        new Promise((_, reject) => opts.signal.addEventListener('abort', () => reject(new Anthropic.APIUserAbortError()))),
    );
    await expect(callJson({ ...base, timeoutMs: 20 })).rejects.toMatchObject({ code: 'timeout' });
  });

  it('treats a refusal as a provider error so the app falls back', async () => {
    sdk.create.mockResolvedValueOnce(reply('', 'refusal'));
    await expect(callJson(base)).rejects.toMatchObject({ code: 'provider_error' });
  });

  it('reports a missing key clearly without calling the API', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    resetClientForTests();
    const error = await callJson(base).catch((e) => e);
    expect(error).toBeInstanceOf(AiError);
    expect(error.code).toBe('missing_key');
    expect(sdk.create).not.toHaveBeenCalled();
  });
});

describe('extractJson', () => {
  it('pulls the object out of fences and stray sentences', () => {
    expect(extractJson('Sure! ```json {"a":1} ``` Hope that helps')).toEqual({ a: 1 });
    expect(() => extractJson('no braces here')).toThrow();
  });
});
