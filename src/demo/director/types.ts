// The shapes of a demo tour (v2 spec 16.4): steps grouped in chapters, each
// with a caption, maybe a target on screen, and one action.
export type CustomActionName = 'setupChapter' | 'cycleSpecies' | 'cycleThemes' | 'stuckTask' | 'restoreCalm';

export type Action =
  | { kind: 'navigate'; path: string }
  | { kind: 'click' }
  | { kind: 'type'; text: string; cps?: number }
  | { kind: 'wait'; ms: number }
  | { kind: 'waitFor'; timeoutMs?: number }
  | { kind: 'setClock'; ts: number }
  | { kind: 'setSpeed'; multiplier: number }
  | { kind: 'say' }
  | { kind: 'custom'; name: CustomActionName; args?: Record<string, unknown> };

export interface Step {
  id: string;
  chapter: string;
  caption?: string;
  narrate?: boolean;
  // data-demo-id of the element to spotlight or act on.
  target?: string;
  action: Action;
  // Time to look at the result before the next step (at 1×).
  holdMs?: number;
  // Presenter mode waits for Next after this step.
  presenterPause?: boolean;
}

export interface Script {
  id: 'full' | 'pitch';
  chapters: Array<{ id: string; title: string }>;
  steps: Step[];
}
