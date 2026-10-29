'use client';

// The English voices this device offers, ranked best first and kept up to
// date, because browsers often load their voice list a moment after the page
// opens. Used by the voice picker in Settings.
import { useSyncExternalStore } from 'react';
import { browserVoicesSupported } from './browserEngine';
import { rankVoices } from './voiceRanking';

const NONE: SpeechSynthesisVoice[] = [];
let cachedKey = '';
let cached: SpeechSynthesisVoice[] = NONE;

// getVoices() returns a new array every call; React needs the same array
// back until the list really changes.
function snapshot(): SpeechSynthesisVoice[] {
  if (!browserVoicesSupported()) return NONE;
  const all = window.speechSynthesis.getVoices();
  const key = all.map((v) => v.voiceURI).join('|');
  if (key !== cachedKey) {
    cachedKey = key;
    cached = all;
  }
  return cached;
}

function subscribe(onChange: () => void): () => void {
  if (!browserVoicesSupported()) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener('voiceschanged', onChange);
  return () => synth.removeEventListener('voiceschanged', onChange);
}

export function useDeviceVoices(accent: string, limit = 8): SpeechSynthesisVoice[] {
  const all = useSyncExternalStore(subscribe, snapshot, () => NONE);
  return rankVoices(all, { accent }).slice(0, limit);
}
