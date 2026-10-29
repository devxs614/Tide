// The shapes of everything Tide stores on the device.
// These mirror Section 8.1 of the build spec; the Dexie tables in db.ts and
// the repo functions in lib/repo/ are typed against them.

export type Quadrant = 'surge' | 'swell' | 'ebb' | 'still';
export type CommunicationMode = 'gentle' | 'direct' | 'literal';
export type TaskType = 'writing' | 'studying' | 'admin' | 'social' | 'chores' | 'other';
export type TaskStatus = 'not_started' | 'in_progress' | 'stuck' | 'done';
export type StuckReason =
  | 'dont_know_start'
  | 'too_big'
  | 'boring'
  | 'worried_result'
  | 'place_noise'
  | 'no_energy';
export type EventKind = 'class' | 'lab' | 'work' | 'social' | 'self_care' | 'other';
export type Need = 'keep' | 'adjust' | 'regulate' | 'talk';
export type StrategyFamily = 'move' | 'calm' | 'connect' | 'create' | 'think';
export type RecheckResult = 'better' | 'same' | 'worse';
export type DayMode = 'full' | 'gentle' | 'minimum';
export type FocusMinutes = 5 | 10 | 15 | 25;
export type FocusOutcome = 'got_going' | 'a_little' | 'didnt_start';
export type StrategyContext = 'unstick' | 'bridge' | 'toolkit';
export type TransitionRating = 'easy' | 'okay' | 'hard';
export type Cause = 'sleep' | 'food' | 'people' | 'noise_place' | 'task' | 'body' | 'not_sure';

export interface CheckIn {
  id: string;
  ts: number; // epoch ms (from clock.now())
  text?: string; // the user's own words; stored locally only
  bodyCues?: string[]; // wordless path selections, e.g. ['chest:tight','energy:low']
  emotions: string[]; // 0–2 emotion ids from data/emotions.ts, or 'custom:<word>'
  energy: number; // -5..5
  pleasantness: number; // -5..5
  quadrant: Quadrant;
  causes?: Cause[];
  need?: Need;
  aiUsed: boolean; // whether AI candidates were shown
  safetyTriggered?: boolean; // true if the safety layer fired (text is NOT stored then)
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  energyCost: 1 | 2 | 3;
  status: TaskStatus;
  due?: string; // 'YYYY-MM-DD'
  stuckReason?: StuckReason;
  firstStep?: string; // latest suggested or accepted first step
  parkingNote?: string; // "where I left off"
  movedFrom?: string; // 'YYYY-MM-DD' the day Day Mode moved it from
  movedTo?: string; // 'YYYY-MM-DD' the day it was moved to
  createdAt: number;
  startedAt?: number;
  doneAt?: number;
  order: number; // ordering within its column
}

export interface CalendarEvent {
  id: string;
  title: string;
  kind: EventKind;
  start: number;
  end: number;
  place?: string;
  prep?: string[];
}

export interface FocusBlock {
  id: string;
  taskId: string;
  ts: number; // when the block started
  minutes: FocusMinutes;
  completed: boolean; // the timer reached the end (vs ended early)
  outcome?: FocusOutcome;
}

export interface StrategyUse {
  id: string;
  strategyId: string;
  ts: number;
  context: StrategyContext;
  checkInId?: string; // latest check-in at the time
  taskId?: string;
  transitionId?: string;
  result?: RecheckResult;
}

export interface Transition {
  id: string;
  ts: number; // when the bridge was shown
  fromTaskId?: string;
  fromEventId?: string;
  toEventId: string;
  parkingNote?: string;
  strategyUseId?: string;
  rating?: TransitionRating;
  ratedAt?: number;
}

export interface Win {
  id: string;
  ts: number;
  text: string;
  source: 'task' | 'transition' | 'strategy' | 'manual';
  refId?: string;
}

export interface Reward {
  id: string;
  text: string; // a user-defined micro-reward, e.g. "10 minutes of my game"
}

export interface DismissedPattern {
  key: string; // stable pattern key, e.g. 'strategyBeforeTask:m-walk-3:writing'
  ts: number;
  reason?: string;
}

export interface DayPlan {
  date: string; // 'YYYY-MM-DD'
  mode: DayMode;
  keptTaskIds: string[];
  movedTaskIds: string[];
  rationale?: string;
  acceptedAt: number;
}

export interface TrustedContact {
  id: string;
  name: string;
  // A phone number gets Call and Message buttons; anything else (an
  // Instagram handle, an email) is shown so Maya can reach out herself.
  method: 'phone' | 'email' | 'handle';
  value: string;
}

export interface CampusSupport {
  name: string;
  phone?: string;
  url?: string;
}

export interface DemoClock {
  base: number; // the demo time shown when the clock started
  startedAt: number; // the real time it started
}

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  textScale: 1 | 1.15 | 1.3 | 1.5;
  extraSpacing: boolean;
  reduceMotion: boolean;
  vibration: boolean;
  communicationMode: CommunicationMode;
  aiEnabled: boolean;
  readAloudRate: 0.8 | 1 | 1.2;
  // The name of a voice on this device, or '' to let Tide pick (D57).
  readAloudVoice: string;
  demoMode: boolean;
  onboarded: boolean;
  trustedContacts: TrustedContact[];
  campusSupport: CampusSupport | null;
  name: string;
  demoClock: DemoClock | null;
  // "Not now" on the Day Mode banner hides it until the next check-in.
  dayModeBannerDismissedFor: string | null;
}
