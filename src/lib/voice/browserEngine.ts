// Read-aloud with the device's own voices (Web Speech synthesis), with the
// fixes from v2 spec 7.5. It waits for the voice list (it loads late in
// Chrome), picks the best voice, reads sentence-sized chunks one after
// another so Chrome's ~15-second cut-off never triggers, and pokes Chromium
// every 10 seconds so long text keeps going. Pitch is always 1: changing it
// is what makes voices sound synthetic.
import { pickVoice } from './voiceRanking';

export interface BrowserSpeakOptions {
  rate: number;
  chosenURI: string | null;
  accent: string;
}

export interface SpeakEvents {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

// A slightly unhurried pace sounds calmer; Settings' rate scales from it
// (the team asked for a gentler voice, D57).
const GENTLE_PACE = 0.9;
const START_TIMEOUT_MS = 2000;

export function browserVoicesSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (!browserVoicesSupported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener?.('voiceschanged', done);
      resolve(synth.getVoices());
    };
    synth.addEventListener?.('voiceschanged', done);
    window.setTimeout(done, timeoutMs);
  });
}

function isChromium(): boolean {
  return typeof navigator !== 'undefined' && /Chrome\//.test(navigator.userAgent);
}

// Chrome can garbage-collect an utterance nothing points to and then never
// say it ended, so the one being read is kept here.
let current: SpeechSynthesisUtterance | null = null;

// Speaks the chunks in order. Returns a function that stops reading.
export async function speakWithBrowser(chunks: string[], opts: BrowserSpeakOptions, events: SpeakEvents = {}): Promise<() => void> {
  if (!browserVoicesSupported() || chunks.length === 0) {
    events.onError?.();
    return () => {};
  }
  const synth = window.speechSynthesis;
  const voice = pickVoice(await loadVoices(), {
    chosenURI: opts.chosenURI,
    accent: opts.accent,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
  });
  synth.cancel();

  let index = 0;
  let started = false;
  let stopped = false;
  let keepAlive = 0;
  const finish = (ok: boolean) => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(noStart);
    window.clearInterval(keepAlive);
    current = null;
    if (ok) events.onEnd?.();
    else events.onError?.();
  };
  // No sound within two seconds: give up, so the engine can try another way.
  const noStart = window.setTimeout(() => {
    if (!started) {
      synth.cancel();
      finish(false);
    }
  }, START_TIMEOUT_MS);

  const next = () => {
    if (stopped) return;
    if (index >= chunks.length) return finish(true);
    const utterance = new SpeechSynthesisUtterance(chunks[index++]);
    if (voice) utterance.voice = voice as SpeechSynthesisVoice;
    utterance.lang = voice?.lang ?? 'en-US';
    utterance.rate = opts.rate * GENTLE_PACE;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (started) return;
      started = true;
      window.clearTimeout(noStart);
      events.onStart?.();
    };
    utterance.onend = next;
    utterance.onerror = (e) => {
      // A cancel from our own stop() isn't a failure.
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      finish(started);
    };
    current = utterance;
    synth.speak(utterance);
  };

  if (isChromium()) {
    keepAlive = window.setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10_000);
  }
  next();

  return () => {
    stopped = true;
    window.clearTimeout(noStart);
    window.clearInterval(keepAlive);
    current = null;
    synth.cancel();
  };
}

export function currentUtteranceForTests(): SpeechSynthesisUtterance | null {
  return current;
}
