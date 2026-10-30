// The shapes of everything Tide stores on the device.
// These mirror Section 8.1 of the build spec; the Dexie tables in db.ts and
// the repo functions in lib/repo/ are typed against them.
import type { ThemeId } from './theme/themes';
import type { AccessoryId, CompanionSpecies, Placement } from './companion/registry';

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

// v2 (spec 18.1): what kind of win this is, so the Shore can wash up the
// right thing. Optional; older wins get it inferred.
export type WinKind =
  | 'task_done' | 'transition' | 'strategy_better' | 'unstuck'
  | 'manual' | 'wrap' | 'bottle' | 'first_time' | 'welcome';

export interface Win {
  id: string;
  ts: number;
  text: string;
  source: 'task' | 'transition' | 'strategy' | 'manual';
  refId?: string;
  kind?: WinKind;
}

// The features whose first use is celebrated once (v2 spec 10.2).
export type FirstFeature = 'checkin' | 'unstick' | 'focus' | 'bridge' | 'strategy' | 'wrap' | 'bottle';

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

  // v2 (v2 spec Section 15.2). The dotted names keep each area together and
  // never clash with the v1 keys above, which keep their v1 meaning.
  // 2 once the v1 → v2 settings migration has run for this database.
  schemaVersion: number;
  'appearance.theme': ThemeId;
  'appearance.followSystem': boolean;
  'appearance.lightTheme': ThemeId;
  'appearance.darkTheme': ThemeId;
  'appearance.font': AppearanceFont;
  'appearance.boldText': boolean;
  'appearance.density': 'comfortable' | 'compact';
  'appearance.roundness': 'round' | 'soft' | 'square';
  'appearance.quadrantPalette': 'theme' | 'colorblind';
  'appearance.showQuadrantShapes': boolean;
  // 'auto' means "not chosen": the device setting, then Calm (spec 5.2).
  'motion.level': 'auto' | 'off' | 'calm' | 'lively';
  'motion.celebrations': 'full' | 'gentle' | 'off';
  'motion.confetti': boolean;
  'motion.pageTransitions': boolean;
  'motion.companionIdle': boolean;
  'motion.shoreWaves': boolean;
  'haptics.enabled': boolean;
  'sound.enabled': boolean;
  'sound.volume': number;
  'sound.ui': boolean;
  'sound.celebrations': boolean;
  'sound.companion': boolean;
  'sound.ambience': 'none' | 'waves' | 'rain' | 'brown';
  'sound.ambienceVolume': number;
  'voice.engine': 'auto' | 'natural' | 'device' | 'off';
  'voice.rate': number;
  'voice.deviceVoiceURI': string | null;
  // A cloud voice id from src/data/voices.ts; '' means the provider's default.
  'voice.naturalVoice': string;
  'voice.accent': VoiceAccent;
  'voice.autoReadAi': boolean;
  'voice.readCompanion': boolean;
  'voice.breathingCues': boolean;
  'privacy.naturalVoiceAllowed': boolean;
  // null until chosen: existing users meet the companions in "What's new";
  // new users choose in onboarding (Lolo if they skip, v2 spec 11.2).
  'companion.species': CompanionSpecies | 'none' | null;
  // '' means the species' own name (Pebble, Lolo…).
  'companion.name': string;
  'companion.variant': string;
  'companion.accessory': AccessoryId;
  'companion.size': 'sm' | 'md' | 'lg';
  'companion.talkativeness': 'quiet' | 'some' | 'chatty';
  'companion.placements': Record<Placement, boolean>;
  'companion.faceStyle': 'dots' | 'none';
  'companion.mirrorState': boolean;
  // A cloud voice id; '' means the species' own default voice.
  'companion.voice': string;
  // Onboarding 2.0 (spec 11): the step to resume at.
  'onboarding.step': number;
  // Existing users see "What's new" once; the Today card asks once.
  'whatsNew.seen': boolean;
  'today.companionCardDismissed': boolean;
  // When each feature was first used. Kept here rather than as wins, so the
  // proof log's v1 behavior (one win per real event) is unchanged (D92).
  firsts: Partial<Record<FirstFeature, number>>;
  'language.readingLevel': 'standard' | 'simple';
  // 'HH:MM', 24-hour, whatever the display clock is.
  'day.start': string;
  'day.wrapTime': string;
  'day.transitionLead': 5 | 10 | 15;
  'day.clock': '12h' | '24h';
  'shore.sky': 'time' | 'theme' | 'static';
  'focus.keepAwake': boolean;
}

export type VoiceAccent = 'auto' | 'en-US' | 'en-GB' | 'en-AU' | 'en-CA' | 'en-IN' | 'en-IE' | 'en-ZA';

export type AppearanceFont = 'playful' | 'hyperlegible' | 'lexend' | 'system';
