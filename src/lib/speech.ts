// Voice in and voice out, using what the browser already has (Web Speech
// API). Dictation helps someone who thinks faster than they type; read
// aloud helps someone for whom reading takes effort. Both are optional: if
// the browser lacks them, the buttons simply don't appear.

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

export function speak(text: string, rate: number, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = 'en-US';
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
