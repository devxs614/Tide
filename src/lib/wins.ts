// The words for Maya's proof log. Wins are only ever added, never taken away,
// and they are phrased as plain facts about what she did. The repo functions
// call these when a task is finished, a switch goes okay, a strategy helps or
// a stuck task gets going (Section 8.3 of the spec).

export function finishedTaskWin(title: string): string {
  return `Finished: ${title}`;
}

export function transitionWin(fromLabel: string, toLabel: string): string {
  return `Got through: ${fromLabel} → ${toLabel}`;
}

export function strategyWin(strategyName: string): string {
  return `Felt better after: ${strategyName}`;
}

export function unstuckWin(title: string): string {
  return `Got unstuck: ${title}`;
}

// The Today win card quotes a win mid-sentence ("You still finished: lab
// outline."), so the whole thing goes lower case there.
export function winInSentence(text: string): string {
  return text.toLowerCase();
}
