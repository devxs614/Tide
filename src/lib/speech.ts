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

// Left to itself the browser reads with the system's default voice, which on
// a Mac set to Spanish is Paulina: English words in a Spanish accent, hard to
// follow. So Tide picks an English voice itself, and skips the Mac's novelty
// voices (Bubbles, Zarvox…) and the older robotic ones (Eddy, Fred…), which
// are English but tiring to listen to.
const UNCLEAR = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Buenas noticias', 'Good News', 'Cellos',
  'Jester', 'Organ', 'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox', 'Junior', 'Ralph', 'Fred',
  'Kathy', 'Eddy', 'Flo', 'Grandma', 'Grandpa', 'Reed', 'Rocko', 'Sandy', 'Shelley',
]);
// Voices that read naturally on common systems (macOS, Windows, Chrome).
const CLEAR = [
  'Ava', 'Samantha', 'Allison', 'Susan', 'Zoe', 'Evan', 'Nathan', 'Joelle', 'Noelle', 'Serena', 'Daniel',
  'Karen', 'Moira', 'Tessa', 'Aria', 'Jenny', 'Guy', 'Google US English', 'Google UK English Female',
];

export function clearestEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -1;
  for (const voice of voices) {
    if (!/^en[-_]/i.test(voice.lang) || UNCLEAR.has(voice.name.split(' (')[0])) continue;
    // Downloaded high-quality voices beat everything; their names say so,
    // in English or in the system's language ("Samantha (mejorada)").
    let score = /premium|enhanced|mejorada|natural|neural/i.test(voice.name) ? 40 : 0;
    if (CLEAR.some((name) => voice.name.includes(name))) score += 25;
    if (/^en[-_]US$/i.test(voice.lang)) score += 10;
    // A voice on the device keeps working offline.
    if (voice.localService) score += 5;
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

// Some browsers load their voice list only after the first request, so the
// buttons ask early and the list is ready by the time Maya taps one.
export function primeVoices(): void {
  if (isSpeechSupported()) window.speechSynthesis.getVoices();
}

export function speak(text: string, rate: number, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = 'en-US';
  const voice = clearestEnglishVoice(window.speechSynthesis.getVoices());
  if (voice) utterance.voice = voice;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
