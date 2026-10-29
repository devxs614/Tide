'use client';

// The English voices this device offers, best first, kept up to date because
// browsers often load their voice list a moment after the page opens.
import { useSyncExternalStore } from 'react';
import { isSpeechSupported } from './speech';
import { readableEnglishVoices } from './voices';

const NONE: SpeechSynthesisVoice[] = [];
let cachedKey = '';
let cached: SpeechSynthesisVoice[] = NONE;

// getVoices() returns a new array every call; React needs the same array
// back until the list really changes, or it would render forever.
function snapshot(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return NONE;
  const all = window.speechSynthesis.getVoices();
  const key = all.map((v) => v.voiceURI).join('|');
  if (key !== cachedKey) {
    cachedKey = key;
    cached = readableEnglishVoices(all);
  }
  return cached;
}

function subscribe(onChange: () => void): () => void {
  if (!isSpeechSupported()) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener('voiceschanged', onChange);
  return () => synth.removeEventListener('voiceschanged', onChange);
}

export function useEnglishVoices(): SpeechSynthesisVoice[] {
  return useSyncExternalStore(subscribe, snapshot, () => NONE);
}
