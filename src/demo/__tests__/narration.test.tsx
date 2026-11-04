// Narration after the demo fix pack (D-2): every caption of both tours is
// read, once, in order; the tour waits for the voice; with narration off
// nothing is read; a voice that never starts is retried once and then
// skipped; one that never ends is let go; a pause stops it; the utterance
// is held until it ends; and speech waits 120 ms after a cancel. The voice
// engine and speechSynthesis are stand-ins.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { director, type DirectorDeps } from '../director/engine';
import { CANCEL_GAP_MS, Narrator, NARRATOR, START_WATCHDOG_MS, expectedMs } from '../director/narrator';
import { FULL } from '../director/scripts/full';
import { PITCH } from '../director/scripts/pitch';
import type { Script } from '../director/types';
import { stopSpeaking, type SpeakRequest } from '@/lib/voice/engine';
import { realNow } from '@/lib/clock';

const REQUEST: SpeakRequest = { text: '', engine: 'auto', rate: 1, deviceVoiceURI: null, accent: 'en-US', naturalVoice: '', naturalAllowed: false };

function stage(script: Script) {
  const typed = new Set(script.steps.filter((s) => s.action.kind === 'type').map((s) => s.target));
  document.body.innerHTML = [...new Set(script.steps.map((s) => s.target).filter(Boolean))]
    .map((id) => (typed.has(id) ? `<textarea data-demo-id="${id}"></textarea>` : `<button data-demo-id="${id}">${id}</button>`))
    .join('');
}

function deps(over: Partial<DirectorDeps> = {}): DirectorDeps {
  return { navigate: () => {}, speak: async () => 'done', custom: async () => {}, setClock: async () => {}, setSpeed: async () => {}, ...over };
}

afterEach(() => {
  director.exit();
  stopSpeaking();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('the director with narration', () => {
  for (const script of [FULL, PITCH]) {
    it(`reads every caption of the ${script.id} tour once, in order`, async () => {
      vi.useFakeTimers();
      stage(script);
      const spoken: string[] = [];
      director.start(script, 'full', deps({ speak: async (text) => (spoken.push(text), 'done') }), { narration: true });
      await vi.advanceTimersByTimeAsync(20 * 60_000);
      expect(director.getState().status).toBe('finished');
      expect(spoken).toEqual(script.steps.flatMap((s) => (s.caption ? [s.caption] : [])));
    }, 30_000);
  }

  it('waits for the voice before the next step', async () => {
    vi.useFakeTimers();
    let finish: (v: string) => void = () => {};
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One.', holdMs: 500 }, { id: 'two', chapter: 'a', action: { kind: 'say' } }] };
    director.start(script, 'full', deps({ speak: () => new Promise((r) => (finish = r)) }), { narration: true });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(director.getState().index).toBe(0);
    finish('done');
    await vi.advanceTimersByTimeAsync(10);
    expect(director.getState().index).toBe(1);
  });

  it('reads nothing with narration off', async () => {
    vi.useFakeTimers();
    stage(PITCH);
    const speak = vi.fn(async () => 'done');
    director.start(PITCH, 'pitch', deps({ speak }), { narration: false });
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(director.getState().status).toBe('finished');
    expect(speak).not.toHaveBeenCalled();
  });

  it('waits for a tap when the page has none, and primes the voice inside it', async () => {
    vi.useFakeTimers();
    const order: string[] = [];
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One.' }] };
    director.start(
      script,
      'full',
      deps({ speak: async () => (order.push('say'), 'done'), prime: () => order.push('prime'), warmUp: async () => (order.push('warm'), true) }),
      { narration: true, waitForTap: true },
    );
    await vi.advanceTimersByTimeAsync(30_000);
    expect(director.getState()).toMatchObject({ status: 'starting', needsTap: true, caption: 'Narration is on. Press play to start the tour.' });
    expect(order).toEqual([]);
    director.toggle();
    expect(order).toEqual(['prime', 'warm']);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(order).toEqual(['prime', 'warm', 'say']);
    expect(director.getState().status).toBe('finished');
  });

  it('shows a one-time line when the device has no voice, and carries on', async () => {
    vi.useFakeTimers();
    const script: Script = { id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One.', holdMs: 5000 }] };
    director.start(script, 'full', deps({ warmUp: async () => false, speak: async () => 'skipped' }), { narration: true, waitForTap: true });
    director.play();
    await vi.advanceTimersByTimeAsync(100);
    expect(director.getState().notice).toBe("Narration isn't available on this device. Captions will stay on screen longer.");
    await vi.advanceTimersByTimeAsync(10_000);
    expect(director.getState().status).toBe('finished');
  });
});

// A stand-in voice engine: `start` makes it say it began, `end` that it
// finished; without either it just never does.
function fakeEngine() {
  const listeners = new Set<(on: boolean, owner: string | null) => void>();
  const calls: SpeakRequest[] = [];
  let resolve: (o: 'done' | 'stopped' | 'failed') => void = () => {};
  const stop = vi.fn(() => resolve('stopped'));
  return {
    calls,
    stop,
    start: () => listeners.forEach((l) => l(true, NARRATOR)),
    end: () => resolve('done'),
    options: {
      request: () => REQUEST,
      stop,
      onSpeaking: (l: (on: boolean, owner: string | null) => void) => {
        listeners.add(l);
        return () => listeners.delete(l);
      },
      speak: (req: SpeakRequest) => {
        calls.push(req);
        return new Promise<'done' | 'stopped' | 'failed'>((r) => (resolve = r));
      },
    },
  };
}

describe('the narrator', () => {
  it('reads the whole caption and resolves when it ends', async () => {
    vi.useFakeTimers();
    const engine = fakeEngine();
    const said = new Narrator(engine.options).say('Maya checks in in her own words.');
    await vi.advanceTimersByTimeAsync(1);
    expect(engine.calls[0]).toMatchObject({ text: 'Maya checks in in her own words.', afterCancelMs: CANCEL_GAP_MS });
    engine.start();
    engine.end();
    expect(await said).toBe('done');
  });

  it('retries a voice that never starts once, the other way, then skips it', async () => {
    vi.useFakeTimers();
    const engine = fakeEngine();
    const log: string[] = [];
    const said = new Narrator({ ...engine.options, log: (m) => log.push(m) }).say('One.');
    await vi.advanceTimersByTimeAsync(START_WATCHDOG_MS + 10);
    expect(engine.calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(CANCEL_GAP_MS + 10);
    expect(engine.calls).toHaveLength(2);
    expect(engine.calls[1].engine).toBe('device');
    await vi.advanceTimersByTimeAsync(START_WATCHDOG_MS + 10);
    expect(await said).toBe('skipped');
    expect(log.some((l) => l.includes('trying the device voice'))).toBe(true);
  });

  it('lets go of a voice that never says it ended', async () => {
    vi.useFakeTimers();
    const engine = fakeEngine();
    let result = '';
    void new Narrator(engine.options).say('Stuck is information, not failure.').then((r) => (result = r));
    await vi.advanceTimersByTimeAsync(1);
    engine.start();
    await vi.advanceTimersByTimeAsync(expectedMs('Stuck is information, not failure.') * 2 + 1000);
    expect(result).toBe('');
    await vi.advanceTimersByTimeAsync(1100);
    expect(result).toBe('done');
    expect(engine.stop).toHaveBeenCalled();
  });

  it('stops at once when the step is called off', async () => {
    vi.useFakeTimers();
    const engine = fakeEngine();
    const controller = new AbortController();
    const said = new Narrator(engine.options).say('One.', { signal: controller.signal });
    await vi.advanceTimersByTimeAsync(1);
    engine.start();
    controller.abort();
    expect(await said).toBe('aborted');
    expect(engine.stop).toHaveBeenCalled();
  });
});

describe('the narrator on the real voice engine', () => {
  it('holds each utterance until it ends, and waits 120 ms after a cancel before speaking', async () => {
    vi.useFakeTimers();
    const events: Array<[string, number]> = [];
    const spoken: Array<{ text: string; onstart?: () => void; onend?: () => void }> = [];
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        voice = null;
        lang = '';
        rate = 1;
        pitch = 1;
        volume = 1;
        onstart?: () => void;
        onend?: () => void;
        onerror?: () => void;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
    vi.stubGlobal('speechSynthesis', {
      speaking: false,
      paused: false,
      getVoices: () => [{ name: 'Samantha', lang: 'en-US', voiceURI: 'samantha', localService: true, default: true }],
      cancel: () => events.push(['cancel', realNow()]),
      speak: (u: { text: string }) => {
        events.push(['speak', realNow()]);
        spoken.push(u);
      },
      pause: () => {},
      resume: () => {},
    });
    const narrator = new Narrator({ request: () => ({ ...REQUEST, engine: 'device' }) });
    const said = narrator.say('Same task, different state, different first step.');
    await vi.advanceTimersByTimeAsync(CANCEL_GAP_MS + 50);
    expect(spoken).toHaveLength(1);
    const cancel = events.findLast(([e]) => e === 'cancel')![1];
    const speak = events.find(([e]) => e === 'speak')![1];
    expect(speak - cancel).toBeGreaterThanOrEqual(CANCEL_GAP_MS);
    expect(narrator.held).toContain(spoken[0]);
    spoken[0].onstart?.();
    spoken[0].onend?.();
    expect(await said).toBe('done');
    expect(narrator.held).toEqual([]);
  });
});
