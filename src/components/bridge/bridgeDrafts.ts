// A Bridge in progress, kept in memory per upcoming event. When Maya taps
// "Start" on a strategy, the runner records the use against this draft's id
// and sends her back to `/?bridge=<id>`; this map finds the same switch, her
// typed note and her ticked prep items again.
export interface BridgeDraft {
  transitionId: string;
  eventId: string;
  note?: string;
  checked: string[];
}

const byEvent = new Map<string, BridgeDraft>();

export function draftFor(eventId: string): BridgeDraft {
  let draft = byEvent.get(eventId);
  if (!draft) {
    draft = { transitionId: crypto.randomUUID(), eventId, checked: [] };
    byEvent.set(eventId, draft);
  }
  return draft;
}

export function eventForTransition(transitionId: string): string | undefined {
  for (const draft of byEvent.values()) if (draft.transitionId === transitionId) return draft.eventId;
  return undefined;
}

export function updateDraft(eventId: string, changes: Partial<Pick<BridgeDraft, 'note' | 'checked'>>): void {
  byEvent.set(eventId, { ...draftFor(eventId), ...changes });
}
