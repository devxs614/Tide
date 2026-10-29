// The check-in sheet's state in one reducer, so the four steps (and the body
// path and the full word list) share one source of truth and each step
// component stays small. Nothing here touches the database; the sheet saves
// once, at the end, through createCheckIn.
import { getEmotion } from '@/data/emotions';
import { averagePoint } from '@/lib/quadrant';
import type { Cause } from '@/lib/types';
import type { LabelOutputT } from '@/lib/ai/schemas';
import type { MapPoint } from './MoodMap';

export type Step = 'what' | 'body' | 'hearing' | 'all-words' | 'behind' | 'need';

export interface CheckInState {
  step: Step;
  text: string;
  bodyPlaces: string[];
  bodyFeelings: string[];
  energyHint: number;
  comfortHint: number;
  candidates: LabelOutputT['candidates'];
  followUp: string;
  aiUsed: boolean;
  loading: boolean;
  selected: string[]; // emotion ids or 'custom:<word>', at most two
  point: MapPoint;
  mapMoved: boolean; // once Maya moves the dot herself, picks stop moving it
  causes: Cause[];
}

export const initialState: CheckInState = {
  step: 'what',
  text: '',
  bodyPlaces: [],
  bodyFeelings: [],
  energyHint: 0,
  comfortHint: 0,
  candidates: [],
  followUp: '',
  aiUsed: false,
  loading: false,
  selected: [],
  point: { energy: 0, pleasantness: 0 },
  mapMoved: false,
  causes: [],
};

export type Action =
  | { type: 'go'; step: Step }
  | { type: 'text'; text: string }
  | { type: 'toggleBody'; field: 'bodyPlaces' | 'bodyFeelings'; value: string }
  | { type: 'hints'; energyHint?: number; comfortHint?: number }
  | { type: 'loading' }
  | { type: 'candidates'; output: LabelOutputT; aiUsed: boolean }
  | { type: 'skipToMap' }
  | { type: 'select'; ids: string[] }
  | { type: 'move'; point: MapPoint }
  | { type: 'toggleCause'; cause: Cause }
  | { type: 'reset' };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// The dot sits at the average of the picked words (custom words have no
// place, so they don't move it). Before anything is picked it rests on the
// first suggestion, which is a position, not a choice.
function pointFor(selected: string[], candidates: LabelOutputT['candidates']): MapPoint | undefined {
  const fromCandidates = new Map(candidates.map((c) => [c.id, c]));
  const points = selected
    .map((id) => fromCandidates.get(id) ?? getEmotion(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ energy: p.energy, pleasantness: p.pleasantness }));
  if (points.length) return averagePoint(points);
  if (candidates[0]) return { energy: candidates[0].energy, pleasantness: candidates[0].pleasantness };
  return undefined;
}

export function reducer(state: CheckInState, action: Action): CheckInState {
  switch (action.type) {
    case 'go':
      return { ...state, step: action.step };
    case 'text':
      return { ...state, text: action.text.slice(0, 600) };
    case 'toggleBody':
      return { ...state, [action.field]: toggle(state[action.field], action.value) };
    case 'hints':
      return {
        ...state,
        energyHint: action.energyHint ?? state.energyHint,
        comfortHint: action.comfortHint ?? state.comfortHint,
      };
    case 'loading':
      return { ...state, step: 'hearing', loading: true, candidates: [], selected: [], mapMoved: false };
    case 'candidates':
      return {
        ...state,
        loading: false,
        candidates: action.output.candidates,
        followUp: action.output.followUpQuestion,
        aiUsed: action.aiUsed,
        point: pointFor([], action.output.candidates) ?? state.point,
      };
    case 'skipToMap':
      return { ...state, step: 'hearing', loading: false, candidates: [], followUp: '', aiUsed: false, selected: [], mapMoved: false };
    case 'select': {
      const point = state.mapMoved ? state.point : (pointFor(action.ids, state.candidates) ?? state.point);
      return { ...state, selected: action.ids, point };
    }
    case 'move':
      return { ...state, point: action.point, mapMoved: true };
    case 'toggleCause':
      return { ...state, causes: toggle(state.causes, action.cause) };
    case 'reset':
      return initialState;
  }
}

// Body cues as the label route expects them: "chest:tight", plus one cue
// from the energy slider, so there is always at least one cue to send.
export function bodyCues(state: CheckInState): string[] {
  const places = state.bodyPlaces.length ? state.bodyPlaces : ['whole'];
  const pairs = state.bodyFeelings.length
    ? places.flatMap((p) => state.bodyFeelings.map((f) => `${p}:${f}`))
    : state.bodyPlaces.map((p) => `${p}:noticed`);
  const energy = state.energyHint <= -2 ? 'low' : state.energyHint >= 2 ? 'high' : 'medium';
  return [...pairs.slice(0, 7), `energy:${energy}`];
}

export function canLeaveStepTwo(state: CheckInState): boolean {
  return state.selected.length > 0 || state.mapMoved;
}

export function isDirty(state: CheckInState): boolean {
  return state.text.trim().length > 0;
}
