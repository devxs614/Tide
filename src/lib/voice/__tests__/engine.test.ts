// The voice engine's fallback order and its one-voice-at-a-time rule (v2
// spec 7.2), with fake engines standing in for clips, cloud and device.
import { describe, expect, it, vi } from 'vitest';
import { attemptsFor, speak, type SpeakRequest } from '../engine';
import { voiceCacheKey } from '../hash';
import type { SpeakEvents } from '../browserEngine';

const REQ: SpeakRequest = { text: 'Hold for 4', engine: 'auto', rate: 1, deviceVoiceURI: null, accent: 'auto', naturalVoice: '', naturalAllowed: true };

type Attempt = (text: string, events: SpeakEvents) => Promise<(() => void) | null>;
const unavailable: Attempt = async () => null;
const fails: Attempt = async (_t, e) => {
  queueMicrotask(() => e.onError?.());
  return () => {};
};
const speaks = (spoken: string[]): Attempt => async (text, e) => {
  spoken.push(text);
  queueMicrotask(() => {
    e.onStart?.();
    e.onEnd?.();
  });
  return () => {};
};

describe('voice engine', () => {
  it('tries clip, then cloud, then device for Auto; nothing for Off', () => {
    expect(attemptsFor(REQ)).toHaveLength(3);
    expect(attemptsFor({ ...REQ, engine: 'natural' })).toHaveLength(2);
    expect(attemptsFor({ ...REQ, engine: 'device' })).toHaveLength(1);
    expect(attemptsFor({ ...REQ, engine: 'off' })).toHaveLength(0);
  });

  it('falls through unavailable and failing engines to one that works, with speech-ready text', async () => {
    const spoken: string[] = [];
    expect(await speak(REQ, [unavailable, fails, speaks(spoken)])).toBe('done');
    expect(spoken).toEqual(['Hold for four.']);
  });

  it('reports failure when nothing could play', async () => {
    expect(await speak(REQ, [unavailable, fails])).toBe('failed');
    expect(await speak({ ...REQ, engine: 'off' })).toBe('failed');
  });

  it('stops the first voice when a second one starts', async () => {
    const stop = vi.fn();
    const slow: Attempt = async (_t, e) => {
      queueMicrotask(() => e.onStart?.());
      return stop;
    };
    const first = speak(REQ, [slow]);
    await new Promise((r) => setTimeout(r, 0));
    const second = speak(REQ, [speaks([])]);
    expect(await first).toBe('stopped');
    expect(stop).toHaveBeenCalled();
    expect(await second).toBe('done');
  });
});

describe('voice cache keys', () => {
  it('are the same for the same request and differ when anything changes', async () => {
    const a = await voiceCacheKey('openai', 'marin', 1, 'Hold for four.');
    expect(await voiceCacheKey('openai', 'marin', 1, 'Hold for four.')).toBe(a);
    expect(await voiceCacheKey('openai', 'cedar', 1, 'Hold for four.')).not.toBe(a);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
