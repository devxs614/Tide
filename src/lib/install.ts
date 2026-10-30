'use client';

// "Install Tide" (v2 spec 17.3). Chromium browsers fire
// `beforeinstallprompt` once, soon after the page loads, and only a page
// that caught it can show the install dialog later. So we catch it as early
// as the app starts (providers import this file), keep it, and use it only
// when someone presses the button. We never prompt on our own.
// iOS Safari has no such event; there the button shows instructions.
import { useSyncExternalStore } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallState = 'available' | 'ios' | 'installed' | 'unavailable';

let saved: InstallPromptEvent | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Stops Chrome's own mini bar on phones; the choice stays with Maya.
    e.preventDefault();
    saved = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    saved = null;
    justInstalled = true;
    notify();
  });
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

// iPads ask for the desktop site, so they say "Macintosh"; touch gives them away.
function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

export function installState(): InstallState {
  if (justInstalled || isStandalone()) return 'installed';
  if (saved) return 'available';
  if (isIos()) return 'ios';
  return 'unavailable';
}

export async function promptInstall(): Promise<boolean> {
  if (!saved) return false;
  const event = saved;
  await event.prompt();
  const { outcome } = await event.userChoice;
  // A prompt event can only be used once.
  saved = null;
  notify();
  return outcome === 'accepted';
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, installState, () => 'unavailable');
}
