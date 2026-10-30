'use client';

// The celebration being shown right now, and when celebrations must wait.
// useCelebrate puts a celebration here; CelebrationHost (mounted once for
// the whole app) draws it. Celebrations never happen on the support pages
// (the crisis screen lives there), during box breathing, or while Maya is
// typing (v2 spec 10.4).
import { useSyncExternalStore } from 'react';
import { onCompanionEvent } from '@/lib/companion/bus';
import type { Decision } from './matrix';

export interface CelebrationView {
  id: number;
  decision: Decision;
  // Where the win happened on screen, if the caller knows; otherwise the
  // effect plays just above the toasts.
  anchor: { x: number; y: number } | null;
  title: string;
  message: string;
  announce: string;
}

let current: CelebrationView | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function showCelebration(view: Omit<CelebrationView, 'id'>): void {
  current = { ...view, id: nextId++ };
  notify();
}

export function clearCelebration(id: number): void {
  if (current?.id !== id) return;
  current = null;
  notify();
}

export function useCelebrationView(): CelebrationView | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}

let holds = 0;
let typing = false;
if (typeof window !== 'undefined') {
  onCompanionEvent((e) => {
    if (e.type === 'typing') typing = e.active;
  });
}

// Box breathing and the support pages hold celebrations while they're open.
export function holdCelebrations(): () => void {
  holds += 1;
  return () => {
    holds = Math.max(0, holds - 1);
  };
}

export function celebrationsBlocked(): boolean {
  const onSupport = typeof window !== 'undefined' && window.location.pathname.startsWith('/support');
  return holds > 0 || typing || onSupport;
}
