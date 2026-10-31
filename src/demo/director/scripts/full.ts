// The full tour (v2 spec 16.7), about four minutes at 1×: every chapter
// starts with a setup that puts the app in the right place and time, so
// jumping back to a chapter always works. Captions are the spec's copy.
import { DEMO_CHECKIN_TEXT } from '@/data/demo/cachedResponses';
import { DEMO_JUMP_TIME } from '@/lib/repo/demo';
import { DEMO_START } from '@/lib/clock';
import type { Script, Step } from '../types';

const EVENING = new Date(2026, 10, 5, 20, 35).getTime();

export const CHAPTERS = [
  { id: 'hello', title: 'Hello' },
  { id: 'yours', title: 'Make it yours' },
  { id: 'name', title: 'Name it' },
  { id: 'lighter', title: 'A lighter day' },
  { id: 'unstick', title: 'Unstick and focus' },
  { id: 'switch', title: 'The switch' },
  { id: 'patterns', title: 'What works for her' },
  { id: 'shore', title: 'Your Shore' },
  { id: 'wrap', title: 'Close the day' },
  { id: 'comfort', title: 'Comfortable for every brain' },
  { id: 'safety', title: 'Safety' },
];

const setup = (chapter: string, path: string, ts: number): Step => ({
  id: `${chapter}.setup`,
  chapter,
  action: { kind: 'custom', name: 'setupChapter', args: { path, ts } },
  holdMs: 400,
  presenterPause: true,
});

export const CHECKIN_STEPS: Step[] = [
  setup('name', '/', DEMO_START - 2 * 60_000),
  { id: 'checkin.open', chapter: 'name', target: 'fab-checkin', action: { kind: 'click' }, caption: 'Maya checks in in her own words.', narrate: true },
  { id: 'checkin.type', chapter: 'name', target: 'checkin-text', action: { kind: 'type', text: DEMO_CHECKIN_TEXT } },
  { id: 'checkin.next', chapter: 'name', target: 'checkin-next', action: { kind: 'click' }, caption: 'Tide suggests words. It never decides for her.', holdMs: 1200 },
  { id: 'checkin.drained', chapter: 'name', target: 'checkin-candidate-drained', action: { kind: 'click' }, caption: 'She picks what fits and places it on the map.' },
  { id: 'checkin.frustrated', chapter: 'name', target: 'checkin-candidate-frustrated', action: { kind: 'click' } },
  { id: 'checkin.next2', chapter: 'name', target: 'checkin-next', action: { kind: 'click' } },
  { id: 'checkin.skip', chapter: 'name', target: 'checkin-skip', action: { kind: 'click' } },
  { id: 'checkin.adjust', chapter: 'name', target: 'need-adjust', action: { kind: 'click' }, caption: 'Low energy and unpleasant: Ebb. Lolo stays close.', holdMs: 1200, presenterPause: true },
];

export const LIGHTER_STEPS: Step[] = [
  { id: 'daymode.gentle', chapter: 'lighter', target: 'daymode-gentle', action: { kind: 'click' }, caption: 'Her plan shrinks to fit her energy, but only with her yes.', holdMs: 1500 },
  { id: 'daymode.apply', chapter: 'lighter', target: 'daymode-apply', action: { kind: 'click' }, holdMs: 1200, presenterPause: true },
];

export const UNSTICK_STEPS: Step[] = [
  { id: 'unstick.setup', chapter: 'unstick', action: { kind: 'custom', name: 'stuckTask', args: { title: 'Chemistry lab report' } }, caption: 'Stuck is information, not failure.', holdMs: 900, presenterPause: true },
  { id: 'unstick.reason', chapter: 'unstick', target: 'unstick-reason-dont_know_start', action: { kind: 'click' }, caption: 'Same task, different state, different first step.', holdMs: 2000 },
  { id: 'unstick.start', chapter: 'unstick', target: 'unstick-start', action: { kind: 'click' }, caption: 'Lolo works next to her, like a study buddy.', narrate: true },
  { id: 'focus.start', chapter: 'unstick', target: 'focus-start', action: { kind: 'click' }, holdMs: 600 },
  // Fast-forward through the focus block. The pitch cut holds this for 4
  // seconds, so 400× covers blocks up to 26 minutes (the longest is 25);
  // at 60× a 10-minute block never ended in time and the outcome was skipped.
  { id: 'focus.fast', chapter: 'unstick', action: { kind: 'setSpeed', multiplier: 400 }, holdMs: 5000 },
  { id: 'focus.normal', chapter: 'unstick', action: { kind: 'setSpeed', multiplier: 1 } },
  { id: 'focus.outcome', chapter: 'unstick', target: 'focus-outcome-got_going', action: { kind: 'click' }, caption: 'Celebrations match how she feels. No confetti on a low day.', holdMs: 2000, presenterPause: true },
];

export const SWITCH_STEPS: Step[] = [
  setup('switch', '/', DEMO_JUMP_TIME),
  { id: 'bridge.ready', chapter: 'switch', target: 'bridge-get-ready', action: { kind: 'click' }, caption: 'Ten minutes before class, Tide helps her switch.', holdMs: 1200 },
  { id: 'bridge.park', chapter: 'switch', target: 'bridge-parking', action: { kind: 'type', text: 'methods, paragraph 2' }, caption: 'She parks where she left off, so coming back is easy.' },
  { id: 'bridge.done', chapter: 'switch', target: 'bridge-done', action: { kind: 'click' }, holdMs: 900, presenterPause: true },
];

export const PATTERN_STEPS: Step[] = [
  setup('patterns', '/patterns', DEMO_JUMP_TIME + 10 * 60_000),
  { id: 'patterns.card', chapter: 'patterns', target: 'pattern-card', action: { kind: 'waitFor', timeoutMs: 6000 }, caption: 'Over time, Tide learns what actually works for her.', holdMs: 2500, presenterPause: true },
];

export const SHORE_STEPS: Step[] = [
  setup('shore', '/shore', DEMO_JUMP_TIME + 15 * 60_000),
  { id: 'shore.scene', chapter: 'shore', target: 'shore-scene', action: { kind: 'waitFor' }, caption: 'Every win washes up on her shore. Nothing is ever lost.', narrate: true, holdMs: 3500 },
  { id: 'shore.collection', chapter: 'shore', target: 'shore-collection', action: { kind: 'waitFor' }, caption: 'A collection, not a score. No streaks. No points.', holdMs: 2000, presenterPause: true },
];

export const FULL: Script = {
  id: 'full',
  chapters: CHAPTERS,
  steps: [
    setup('hello', '/', DEMO_START - 2 * 60_000),
    { id: 'hello.say', chapter: 'hello', action: { kind: 'say' }, caption: 'This is Tide: a calm place to plan around how you actually feel.', narrate: true, holdMs: 2500 },
    setup('yours', '/companion', DEMO_START - 2 * 60_000),
    { id: 'yours.species', chapter: 'yours', target: 'companion-hero', action: { kind: 'custom', name: 'cycleSpecies' }, caption: 'Everyone picks a companion, or none at all.', holdMs: 300 },
    { id: 'yours.tap', chapter: 'yours', target: 'companion-hero', action: { kind: 'click' }, caption: 'Lolo is an axolotl, from the canals of Xochimilco.', holdMs: 1500 },
    { id: 'yours.themes', chapter: 'yours', action: { kind: 'navigate', path: '/settings/appearance' } },
    { id: 'yours.cycle', chapter: 'yours', target: 'theme-grid', action: { kind: 'custom', name: 'cycleThemes' }, caption: 'Fifteen themes, every one checked for readable contrast.', holdMs: 800 },
    ...CHECKIN_STEPS,
    ...LIGHTER_STEPS,
    ...UNSTICK_STEPS,
    ...SWITCH_STEPS,
    ...PATTERN_STEPS,
    ...SHORE_STEPS,
    setup('wrap', '/wrap', EVENING),
    { id: 'wrap.start', chapter: 'wrap', target: 'wrap-start', action: { kind: 'click' }, caption: 'In the evening, Lolo helps her close the day.', holdMs: 1200 },
    { id: 'wrap.skip1', chapter: 'wrap', target: 'wrap-skip', action: { kind: 'click' }, holdMs: 400 },
    { id: 'wrap.tide', chapter: 'wrap', target: 'wrap-skip', action: { kind: 'waitFor' }, caption: 'Her day as a tide: heavy at first, calmer by night.', holdMs: 2500, presenterPause: true },
    setup('comfort', '/settings', EVENING + 5 * 60_000),
    { id: 'comfort.low', chapter: 'comfort', target: 'settings-preset-lowSensory', action: { kind: 'click' }, caption: 'One tap for a low-sensory version of the whole app.' },
    { id: 'comfort.apply', chapter: 'comfort', target: 'settings-preset-apply', action: { kind: 'click' }, holdMs: 2200 },
    { id: 'comfort.restore', chapter: 'comfort', action: { kind: 'custom', name: 'restoreCalm' }, holdMs: 600, presenterPause: true },
    setup('safety', '/support?crisis=1&preview=1', EVENING + 6 * 60_000),
    { id: 'safety.say', chapter: 'safety', action: { kind: 'say' }, caption: 'If someone writes about being in danger, coaching stops and real help comes first.', narrate: true, holdMs: 3000 },
    { id: 'end.home', chapter: 'safety', action: { kind: 'navigate', path: '/' }, caption: 'Tide plans for the brain you have right now.', narrate: true, holdMs: 1500 },
  ],
};
