// Voice in and voice out, using what the browser already has (Web Speech
// API). Dictation helps someone who thinks faster than they type; read
// aloud helps someone for whom reading takes effort. Both are optional: if
// the browser lacks them, the buttons simply don't appear.
import { spokenText } from './spokenNumbers';
import { voiceFor } from './voices';

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionCtor = new () => RecognitionLike;

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isDictationSupported(): boolean {
  return Boolean(recognitionCtor());
}

// Starts listening and calls onText with the full transcript of this session
// each time it changes. Returns a function that stops listening.
export function startDictation(opts: { onText: (text: string) => void; onEnd: () => void }): () => void {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    opts.onEnd();
    return () => {};
  }
  const recognition = new Ctor();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((r) => r[0]?.transcript ?? '')
      .join(' ');
    opts.onText(text.trim());
  };
  recognition.onend = opts.onEnd;
  recognition.onerror = opts.onEnd;
  recognition.start();
  return () => recognition.stop();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Some browsers load their voice list only after the first request, so the
// buttons ask early and the list is ready by the time Maya taps one.
export function primeVoices(): void {
  if (isSpeechSupported()) window.speechSynthesis.getVoices();
}

// Chrome can garbage-collect an utterance nothing else points to and then
// never report that it ended, so the one being read is kept here.
let current: SpeechSynthesisUtterance | null = null;
const START_TIMEOUT_MS = 3000;
// A slightly unhurried pace sounds calmer, which matters most for breathing
// steps. Settings' Slower, Normal and Faster scale from here.
const GENTLE_PACE = 0.9;

export interface SpeakOptions {
  rate: number;
  // A voice name chosen in Settings; empty means "pick the best one here".
  voiceName: string;
}

export function speak(text: string, { rate, voiceName }: SpeakOptions, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenText(text));
  utterance.rate = rate * GENTLE_PACE;
  utterance.lang = 'en-US';
  const voice = voiceFor(window.speechSynthesis.getVoices(), voiceName);
  if (voice) utterance.voice = voice;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(noStart);
    if (current === utterance) current = null;
    onEnd?.();
  };
  // If the device never starts talking (a stalled voice engine, a muted
  // tab), the button goes back to "Read aloud" instead of waiting forever.
  const noStart = window.setTimeout(finish, START_TIMEOUT_MS);
  utterance.onstart = () => window.clearTimeout(noStart);
  utterance.onend = finish;
  utterance.onerror = finish;
  current = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
