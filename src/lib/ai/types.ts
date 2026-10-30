// Route names and the input/output types for each, so useAi('unstick') is
// typed end to end: the input you pass and the data you get back.
import type {
  BridgeInputT,
  BridgeOutputT,
  DayModeInputT,
  DayModeOutputT,
  LabelInputT,
  LabelOutputT,
  NarrateInputT,
  NarrateOutputT,
  UnstickInputT,
  UnstickOutputT,
  WrapupInputT,
  WrapupOutputT,
} from './schemas';

export type AiRouteName = 'label' | 'unstick' | 'daymode' | 'bridge' | 'narrate' | 'wrapup';

export interface AiInputs {
  label: LabelInputT;
  unstick: UnstickInputT;
  daymode: DayModeInputT;
  bridge: BridgeInputT;
  narrate: NarrateInputT;
  wrapup: WrapupInputT;
}

export interface AiOutputs {
  label: LabelOutputT;
  unstick: UnstickOutputT;
  daymode: DayModeOutputT;
  bridge: BridgeOutputT;
  narrate: NarrateOutputT;
  wrapup: WrapupOutputT;
}

// 'demo-cache' is for debugging and Settings → About suggestions only; the
// cards themselves never say where an answer came from.
export type AiSource = 'ai' | 'fallback' | 'demo-cache';

export interface AiResult<R extends AiRouteName> {
  data: AiOutputs[R];
  source: AiSource;
  // True when the safety layer fired, either the keyword pre-check or the
  // model's own safetyFlag. The caller must show the crisis screen.
  safetyTriggered: boolean;
}
