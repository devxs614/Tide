// The voice engine every read-aloud goes through (v2 spec 7.2). It turns the
// text into speech-ready text, then tries, in order: a pre-generated clip, a
// natural cloud voice (if the team set one up, the device is online and Maya
// allows it), and the best voice on the device. Only one thing speaks at a
// time: starting something new stops the old one.
import { browserVoicesSupported, speakWithBrowser, type SpeakEvents } from './browserEngine';
import { findClip } from './clipsEngine';
import { playAudio } from './audioPlayer';
import { speakWithCloud, ttsStatus } from './cloudEngine';
import { speechChunks, speechText } from './speechText';

export type VoiceEngineSetting = 'auto' | 'natural' | 'device' | 'off';

export interface SpeakRequest {
  text: string | string[];
  engine: VoiceEngineSetting;
  rate: number;
  deviceVoiceURI: string | null;
  accent: string;
  // The cloud voice to use ('' = the provider's default).
  naturalVoice: string;
  naturalAllowed: boolean;
}

export type SpeakOutcome = 'done' | 'stopped' | 'failed';

type Attempt = (text: string, events: SpeakEvents) => Promise<(() => void) | null>;

let stopCurrent: (() => void) | null = null;
let token = 0;
// Who asked for the current speech, so only that button says "Stop reading".
let owner: string | null = null;
const listeners = new Set<(speaking: boolean, owner: string | null) => void>();

function setSpeaking(on: boolean) {
  listeners.forEach((l) => l(on, owner));
}

export function onSpeakingChange(listener: (speaking: boolean, owner: string | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function currentSpeaker(): string | null {
  return owner;
}

export function stopSpeaking(): void {
  token += 1;
  stopCurrent?.();
  stopCurrent = null;
  setSpeaking(false);
  owner = null;
}

function online(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine;
}

const clip: Attempt = async (text, events) => {
  const url = await findClip(text);
  return url ? playAudio(url, events) : null;
};

const cloud =
  (req: SpeakRequest): Attempt =>
  async (text, events) => {
    if (!req.naturalAllowed || !online()) return null;
    const s = await ttsStatus();
    if (!s.available) return null;
    return speakWithCloud(text, { voice: req.naturalVoice || s.voices[0]?.id || '', speed: req.rate }, events);
  };

const device =
  (req: SpeakRequest): Attempt =>
  async (text, events) => {
    if (!browserVoicesSupported()) return null;
    return speakWithBrowser(speechChunks(text), { rate: req.rate, chosenURI: req.deviceVoiceURI, accent: req.accent }, events);
  };

export function attemptsFor(req: SpeakRequest): Attempt[] {
  if (req.engine === 'off') return [];
  if (req.engine === 'device') return [device(req)];
  if (req.engine === 'natural') return [cloud(req), device(req)];
  return [clip, cloud(req), device(req)];
}

// Speaks and resolves when it's done, stopped, or nothing could play.
export async function speak(req: SpeakRequest, attempts: Attempt[] = attemptsFor(req), by: string | null = null): Promise<SpeakOutcome> {
  stopSpeaking();
  const mine = ++token;
  owner = by;
  const text = speechText(req.text);
  for (const attempt of attempts) {
    const outcome = await new Promise<SpeakOutcome | 'next'>((resolve) => {
      let started = false;
      attempt(text, {
        onStart: () => {
          started = true;
          if (mine === token) setSpeaking(true);
        },
        onEnd: () => resolve('done'),
        // A failure before any sound means "try the next way"; after
        // sound started, it just ends.
        onError: () => resolve(started ? 'done' : 'next'),
      })
        .then((stop) => {
          if (!stop) return resolve('next');
          if (mine !== token) {
            stop();
            return resolve('stopped');
          }
          stopCurrent = () => {
            stop();
            resolve('stopped');
          };
        })
        .catch(() => resolve(started ? 'done' : 'next'));
    });
    if (outcome === 'next') continue;
    if (mine === token) {
      stopCurrent = null;
      setSpeaking(false);
    }
    return outcome;
  }
  if (mine === token) setSpeaking(false);
  return 'failed';
}
