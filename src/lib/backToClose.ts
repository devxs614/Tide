'use client';

// Browser and Android back close the top sheet or dialog instead of leaving
// the page (v2.1 F-08, spec 12.4). While anything is open, one history
// entry with the same URL (a marker) sits above the page. Back pops it, and
// the top overlay is asked to close through its own onOpenChange, so its
// "Leave without saving?" rule still applies; the marker goes straight back.
// Closing never steps back through history by itself: flows often close a
// sheet and navigate at once (Unstick → Focus), and a programmatic back
// step raced that navigation (D176). The marker a closed overlay leaves is
// handled on Maya's next Back instead, which carries on to where she meant
// to go. None of these pops reach the Next.js router (a capture listener
// stops them), and the URL never changes.
import { useEffect, useId, useRef } from 'react';

interface Entry {
  id: string;
  close: () => void;
}

const stack: Entry[] = [];
// v2.3 Item 3: whether any sheet or dialog is open, for the companion's
// page bubbles, which step aside as soon as one opens.
const stackListeners = new Set<() => void>();
const notifyStack = () => stackListeners.forEach((l) => l());
export function subscribeOpenOverlays(l: () => void): () => void {
  stackListeners.add(l);
  return () => stackListeners.delete(l);
}
export const anyOverlayOpen = () => stack.length > 0;
// The marker is the current entry, as far as we know, and its URL.
let marker: { url: string } | null = null;

const atMarker = () => !!(window.history.state as { tideOverlay?: unknown } | null)?.tideOverlay;

function ensureMarker() {
  if (!atMarker()) window.history.pushState({ ...(window.history.state ?? {}), tideOverlay: true }, '');
  marker = { url: window.location.href };
}

function onPop(event: PopStateEvent) {
  // history.state is already the entry Back arrived at.
  const intoMarker = atMarker();
  const leftMarker = marker !== null && !intoMarker && window.location.href === marker.url;
  marker = intoMarker ? { url: window.location.href } : null;
  const top = stack.at(-1);
  if (top) {
    event.stopImmediatePropagation();
    ensureMarker();
    top.close();
    return;
  }
  if (leftMarker || intoMarker) {
    // Back from (or into) a marker a closed overlay left behind: it's the
    // same page underneath, so carry this press on.
    event.stopImmediatePropagation();
    marker = null;
    window.history.back();
  }
}

if (typeof window !== 'undefined') window.addEventListener('popstate', onPop, { capture: true });

export function useBackToClose(open: boolean | undefined, onClose: (() => void) | undefined): void {
  const id = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  const enabled = !!open && !!onClose;
  useEffect(() => {
    if (!enabled) return;
    const entry: Entry = { id, close: () => closeRef.current?.() };
    stack.push(entry);
    ensureMarker();
    notifyStack();
    return () => {
      stack.splice(stack.indexOf(entry), 1);
      notifyStack();
    };
  }, [enabled, id]);
}
