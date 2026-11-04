// Reads the tour's captions aloud (demo fix pack, D-2). Before, only the
// seven captions marked `narrate` were read, none of them reliably: the
// tour starts right after a page reload, and a browser won't speak on a
// page nobody has tapped yet (every one failed with "not-allowed"). The
// director also moved on after a fixed time while the voice was still
// talking, and the next caption cut it off.
// Now every caption goes through here, one at a time, through the same
// voice engine as the rest of Tide (speech-friendly text, sentence chunks,
// clip → natural → device), and `say` resolves only when the last chunk is
// done. Around it, the fixes for what browsers do to speech:
// - the utterances being read are kept here until they end (Chrome can
//   garbage-collect one nothing points to and then never say it ended);
// - after any cancel it waits 120 ms before speaking again (Chrome can
//   drop an utterance spoken right after a cancel);
// - no start within 1.5 s: one retry the next way (natural → device, or
//   another device voice), then 'skipped', and the caption simply stays up
//   for its reading time;
// - no end by twice the expected length plus 2 s: 'done' anyway, so the
//   tour can never hang on a voice;
// - the step's abort signal (pause, Next, exit) stops it at once.
import { realNow } from '@/lib/clock';
import { attemptsFor, onSpeakingChange, speak as engineSpeak, stopSpeaking, type SpeakRequest } from '@/lib/voice/engine';
import { browserVoicesSupported, loadVoices } from '@/lib/voice/browserEngine';
import { pickVoice } from '@/lib/voice/voiceRanking';
import { prefetchCloudVoice, ttsStatus } from '@/lib/voice/cloudEngine';
import { wait } from './abortable';

export type NarrationResult = 'done' | 'skipped' | 'aborted';

export const NARRATOR = 'demo-narrator';
export const START_WATCHDOG_MS = 1500;
export const CANCEL_GAP_MS = 120;

export interface NarratorOptions {
  // The person's voice settings, read each time a caption is spoken (or
  // given with `settingsChanged`).
  request?: () => SpeakRequest;
  log?: (message: string) => void;
  // Stand-ins for the voice engine, for tests.
  speak?: typeof engineSpeak;
  stop?: typeof stopSpeaking;
  onSpeaking?: typeof onSpeakingChange;
}

// How long a caption takes to say: about 2.3 words a second at rate 1, a
// little slower with Tide's gentle pace.
export function expectedMs(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1200, (words / (2.3 * rate)) * 1000);
}

export class Narrator {
  // The utterances being read right now (see above).
  held: SpeechSynthesisUtterance[] = [];
  // No voice at all on this device: captions only.
  unavailable = false;
  private voiceURI: string | null = null;
  private otherVoiceURI: string | null = null;
  private lastCancel = -Infinity;
  private latest: SpeakRequest | null = null;
  private readonly opts: NarratorOptions;

  constructor(opts: NarratorOptions) {
    this.opts = opts;
  }

  settingsChanged(request: SpeakRequest): void {
    this.latest = request;
  }

  private settings(): SpeakRequest {
    return this.opts.request?.() ?? this.latest ?? { text: '', engine: 'auto', rate: 1, deviceVoiceURI: null, accent: '', naturalVoice: '', naturalAllowed: false };
  }

  private log(message: string) {
    this.opts.log?.(message);
  }

  // Called inside the tap or key press that starts the tour, before any
  // await: Safari only lets a page speak from inside such a handler, and a
  // silent first utterance there unlocks speech for the rest of the run.
  prime(): void {
    if (!browserVoicesSupported()) return;
    try {
      const utterance = new SpeechSynthesisUtterance(' ');
      utterance.volume = 0;
      this.held.push(utterance);
      const release = () => (this.held = this.held.filter((u) => u !== utterance));
      utterance.onend = release;
      utterance.onerror = release;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech isn't there; warmUp will notice.
    }
  }

  // Once per run, right after the tap: wait for the device's voices (they
  // load late in Chrome), choose one and keep it for the whole tour, and
  // fetch the first natural-voice clips if a natural voice is set up.
  async warmUp(firstCaptions: string[]): Promise<void> {
    const req = this.settings();
    const voices = await loadVoices(1500);
    const online = typeof navigator === 'undefined' ? true : navigator.onLine;
    const chosen = pickVoice(voices, { chosenURI: req.deviceVoiceURI, accent: req.accent, online });
    this.voiceURI = chosen?.voiceURI ?? null;
    this.otherVoiceURI = voices.find((v) => v.voiceURI !== this.voiceURI && v.lang?.startsWith('en'))?.voiceURI ?? null;
    const cloud = req.naturalAllowed && online && req.engine !== 'device' ? (await ttsStatus()).available : false;
    this.unavailable = voices.length === 0 && !cloud;
    this.log(`voices: ${voices.length}${chosen ? `, using ${chosen.name}` : ''}${cloud ? ', natural voice ready' : ''}`);
    if (cloud) for (const text of firstCaptions.slice(0, 5)) void prefetchCloudVoice(text, { voice: req.naturalVoice, speed: req.rate });
  }

  prefetch(text: string): void {
    const req = this.settings();
    if (req.naturalAllowed && req.engine !== 'device') void prefetchCloudVoice(text, { voice: req.naturalVoice, speed: req.rate });
  }

  // The request for this run: the person's settings, the voice chosen in
  // warmUp, and the pause after a cancel. "Off" in Settings means Tide
  // doesn't read things to her unasked; narration was asked for in the
  // launcher, so it uses the automatic choice instead.
  private request(): SpeakRequest {
    const req = this.settings();
    return { ...req, engine: req.engine === 'off' ? 'auto' : req.engine, deviceVoiceURI: this.voiceURI ?? req.deviceVoiceURI, afterCancelMs: CANCEL_GAP_MS };
  }

  private fallback(req: SpeakRequest): SpeakRequest {
    if (req.engine !== 'device') return { ...req, engine: 'device' };
    return { ...req, deviceVoiceURI: this.otherVoiceURI };
  }

  private cancel() {
    (this.opts.stop ?? stopSpeaking)();
    this.lastCancel = realNow();
  }

  async say(text: string, { signal }: { signal?: AbortSignal } = {}): Promise<NarrationResult> {
    const first = this.request();
    for (const req of [first, this.fallback(first)]) {
      if (signal?.aborted) return 'aborted';
      const gap = CANCEL_GAP_MS - (realNow() - this.lastCancel);
      if (gap > 0) {
        try {
          await wait(gap, signal);
        } catch {
          return 'aborted';
        }
      }
      const result = await this.once(text, req, signal);
      if (result !== 'no-start') return result;
      this.log(req === first ? `narration: no sound, trying ${this.fallback(first).engine === 'device' && first.engine !== 'device' ? 'the device voice' : 'another voice'}` : 'narration: skipped');
    }
    return 'skipped';
  }

  private once(text: string, req: SpeakRequest, signal?: AbortSignal): Promise<NarrationResult | 'no-start'> {
    const speak = this.opts.speak ?? engineSpeak;
    const onSpeaking = this.opts.onSpeaking ?? onSpeakingChange;
    return new Promise((resolve) => {
      let started = false;
      let settled = false;
      let endTimer = 0;
      const finish = (result: NarrationResult | 'no-start') => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        window.clearTimeout(endTimer);
        off();
        signal?.removeEventListener('abort', onAbort);
        this.held = [];
        resolve(result);
      };
      const off = onSpeaking((on, owner) => {
        if (!on || owner !== NARRATOR || started) return;
        started = true;
        window.clearTimeout(watchdog);
        this.log('narration: speaking');
        endTimer = window.setTimeout(() => {
          this.log('narration: no end heard, moving on');
          this.cancel();
          finish('done');
        }, expectedMs(text, req.rate) * 2 + 2000);
      });
      const watchdog = window.setTimeout(() => {
        if (started) return;
        this.cancel();
        finish('no-start');
      }, START_WATCHDOG_MS);
      const onAbort = () => {
        this.cancel();
        this.log('narration: stopped');
        finish('aborted');
      };
      if (signal?.aborted) return onAbort();
      signal?.addEventListener('abort', onAbort, { once: true });
      const full = { ...req, text };
      speak(full, attemptsFor(full), NARRATOR, { onUtterance: (u) => this.held.push(u) }).then(
        (outcome) => {
          if (outcome === 'failed') finish('no-start');
          else if (outcome === 'stopped') finish(signal?.aborted ? 'aborted' : 'done');
          else finish('done');
        },
        () => finish('no-start'),
      );
    });
  }
}
