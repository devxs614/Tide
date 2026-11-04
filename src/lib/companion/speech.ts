// What the companion said last, and the line showing in the caption bar
// (v2.3 Item 3). Every line it shows passes through here, so "What did
// {name} say?" can bring back a bubble that already faded, and the caption
// bar can show lines for people who chose captions over bubbles (or when a
// bubble has nowhere to go without covering something important).
import { useSyncExternalStore } from 'react';
import { now } from '@/lib/clock';
import { MINUTE } from '@/lib/time';

export interface SpokenLine {
  text: string;
  at: number;
  key: number;
}

let last: SpokenLine | null = null;
let caption: SpokenLine | null = null;
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function recordLine(text: string): void {
  if (last?.text === text && now() - last.at < 1000) return;
  last = { text, at: now(), key: ++seq };
  emit();
}

export function showCaption(text: string): void {
  caption = { text, at: now(), key: ++seq };
  last = caption;
  emit();
}

export function clearCaption(key: number): void {
  if (caption?.key !== key) return;
  caption = null;
  emit();
}

// The line from the last ten minutes, if any (older ones are stale).
export function recentLine(): SpokenLine | null {
  return last && now() - last.at <= 10 * MINUTE ? last : null;
}

export const useCaption = () => useSyncExternalStore(subscribe, () => caption, () => null);

export function resetSpeechForTests(): void {
  last = null;
  caption = null;
}
