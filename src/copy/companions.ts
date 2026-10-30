// Everything the companions say (v2 spec Appendix B). Gentle mode uses each
// species' own voice; Direct
// and Literal use the shared lines, so a literal-minded reader never has to
// decode a metaphor. Rules for anything added here: short, kind, nothing about
// being away or behind, no obligations, never about bodies. A test scans this
// file for the guilt phrases that slip in most easily.
import type { CommunicationMode, Quadrant } from '@/lib/types';
import type { CompanionSpecies } from '@/lib/companion/registry';

// The Studio and screen-reader words live in their own small file, so the
// app shell can use them without loading every line below.
export { COMPANION_ABOUT, COMPANION_COPY } from './companionCopy';

export type LineContext =
  | 'greeting_morning'
  | 'greeting_afternoon'
  | 'greeting_evening'
  | 'checkin_listening'
  | 'after_checkin_surge'
  | 'after_checkin_swell'
  | 'after_checkin_ebb'
  | 'after_checkin_still'
  | 'unstick_offer'
  | 'focus_start'
  | 'focus_end_got_going'
  | 'focus_end_didnt_start'
  | 'bridge_start'
  | 'breathing_invite'
  | 'celebration'
  | 'wrap_start'
  | 'wrap_end'
  | 'shore_new_item'
  | 'idle_tip';

export const LINE_CONTEXTS: LineContext[] = [
  'greeting_morning', 'greeting_afternoon', 'greeting_evening', 'checkin_listening', 'after_checkin_surge',
  'after_checkin_swell', 'after_checkin_ebb', 'after_checkin_still', 'unstick_offer', 'focus_start',
  'focus_end_got_going', 'focus_end_didnt_start', 'bridge_start', 'breathing_invite', 'celebration', 'wrap_start',
  'wrap_end', 'shore_new_item', 'idle_tip',
];

type Lines = Record<LineContext, string | string[]>;

export const COMPANION_LINES: Record<CompanionSpecies, Lines> = {
  otter: {
    greeting_morning: 'Morning! I saved you a smooth pebble.',
    greeting_afternoon: "Hey, you're here. Want to check in?",
    greeting_evening: "Evening. The water's calm now.",
    checkin_listening: "I'm listening. Take your time.",
    after_checkin_surge: "That's a lot at once. Let's float for a sec.",
    after_checkin_swell: "Ooh, good energy. Let's use it.",
    after_checkin_ebb: "Low tide day. I'll stay close.",
    after_checkin_still: 'Nice and calm. I like this.',
    unstick_offer: "Let's find a tiny way in.",
    focus_start: "I'll sort my pebbles while you work.",
    focus_end_got_going: 'You got going! I knew you could.',
    focus_end_didnt_start: 'You showed up. Want a smaller step?',
    bridge_start: "Switch coming up. Let's pack together.",
    breathing_invite: 'Float with me. In… and out.',
    celebration: 'Look at you go!',
    wrap_start: "Let's close the day together.",
    wrap_end: "Rest well. I'll keep the shore safe.",
    shore_new_item: 'Something washed up for you!',
    idle_tip: 'Tap me anytime you need a breather.',
  },
  axolotl: {
    greeting_morning: 'Good morning! New day, fresh water.',
    greeting_afternoon: "Hi again! How's the water today?",
    greeting_evening: "Evening already. Let's slow down.",
    checkin_listening: 'Mm-hm. Say it however it comes.',
    after_checkin_surge: 'Big waves. We can ride this one slowly.',
    after_checkin_swell: "You're glowing today!",
    after_checkin_ebb: 'Heavy day? Starting small is still starting.',
    after_checkin_still: "Calm water. That's a good place.",
    unstick_offer: "Stuck happens. Let's try a smaller way in.",
    focus_start: "I'll read next to you. No rush.",
    focus_end_got_going: "You did it. I'm proud of you.",
    focus_end_didnt_start: "That's okay. We can start over.",
    bridge_start: "New place soon. Let's get ready.",
    breathing_invite: 'Breathe with my gills. In… out.',
    celebration: "Yay! That's a real one.",
    wrap_start: 'Want to look back at today with me?',
    wrap_end: 'Sleep well. Tomorrow is new water.',
    shore_new_item: 'Ooh, a new treasure on your shore!',
    idle_tip: 'I can regrow what I lose. Plans can too.',
  },
  capybara: {
    greeting_morning: 'Morning. No hurry. We go slow.',
    greeting_afternoon: 'Hey. Sit with me a minute?',
    greeting_evening: 'Warm water, quiet evening.',
    checkin_listening: "I'm here. Nothing to fix yet.",
    after_checkin_surge: "Lots going on. Let's just sit first.",
    after_checkin_swell: 'Good energy. Use it, but pace it.',
    after_checkin_ebb: "Low battery. That's allowed.",
    after_checkin_still: 'This is my favorite kind of day.',
    unstick_offer: "One small thing. That's all.",
    focus_start: "I'll sip my tea. Take your time.",
    focus_end_got_going: "Steady. That's how it's done.",
    focus_end_didnt_start: "No worries. The tea's still warm.",
    bridge_start: 'Time to move soon. Slowly is fine.',
    breathing_invite: 'Slow breath, like warm water.',
    celebration: 'Nice. Very nice.',
    wrap_start: "Let's sit and look at the day.",
    wrap_end: 'Goodnight. Everything can wait till morning.',
    shore_new_item: 'Something nice drifted in.',
    idle_tip: 'Resting is part of the plan.',
  },
  gecko: {
    greeting_morning: 'Morning! One step, then the next.',
    greeting_afternoon: "Hey! What's the next small step?",
    greeting_evening: "Evening! Let's wrap things up.",
    checkin_listening: "Got it. Keep going, I'm with you.",
    after_checkin_surge: "Lots of energy. Let's point it somewhere.",
    after_checkin_swell: "Let's climb something!",
    after_checkin_ebb: 'Tiny steps still stick.',
    after_checkin_still: 'Calm and ready. Nice.',
    unstick_offer: "Let's find the first sticky step.",
    focus_start: "I'll take notes. You do the thing.",
    focus_end_got_going: 'You stuck with it!',
    focus_end_didnt_start: "Okay! Let's make the step tinier.",
    bridge_start: 'Next stop coming. Quick check?',
    breathing_invite: 'Feet still. Breathe in with me…',
    celebration: 'Woo! Another one!',
    wrap_start: 'Quick look back at today?',
    wrap_end: "Night! Tomorrow's first step is ready.",
    shore_new_item: 'New find on the shore!',
    idle_tip: 'Small steps add up. Even tiny ones.',
  },
  jellyfish: {
    greeting_morning: 'Good morning.',
    greeting_afternoon: "Hello. I'm here.",
    greeting_evening: 'Evening. Soft light now.',
    checkin_listening: 'Listening.',
    after_checkin_surge: 'Strong current. Slow down with me.',
    after_checkin_swell: 'Bright today.',
    after_checkin_ebb: "Dim is okay. I'll glow for both of us.",
    after_checkin_still: 'Calm.',
    unstick_offer: 'One small step.',
    focus_start: 'Drifting beside you.',
    focus_end_got_going: 'You started.',
    focus_end_didnt_start: 'Okay. Smaller step?',
    bridge_start: 'Change coming. Get ready.',
    breathing_invite: 'Pulse with me.',
    celebration: 'Done. Glowing.',
    wrap_start: 'Close the day?',
    wrap_end: 'Goodnight.',
    shore_new_item: 'Something new.',
    idle_tip: 'Tap me to breathe.',
  },
  hermit_crab: {
    greeting_morning: 'Oh, morning. I was just peeking out.',
    greeting_afternoon: 'Hi. Is now a good time to check in?',
    greeting_evening: 'Evening. Time to tuck in soon.',
    checkin_listening: "I'm listening. Quietly.",
    after_checkin_surge: 'Lots at once. Want a quiet minute first?',
    after_checkin_swell: 'You seem bright today. I like it.',
    after_checkin_ebb: 'Heavy day. We can go slowly.',
    after_checkin_still: 'Quiet water. Cozy.',
    unstick_offer: "Let's look for a small opening.",
    focus_start: "I'll polish my shell nearby.",
    focus_end_got_going: "You got started. That's brave.",
    focus_end_didnt_start: "That's okay. Want a smaller step?",
    bridge_start: "Changing shells is hard. Let's do it together.",
    breathing_invite: 'Tuck in with me. Breathe in…',
    celebration: "Oh! That's wonderful.",
    wrap_start: 'Shall we tuck the day away?',
    wrap_end: 'Goodnight. Your shore is safe.',
    shore_new_item: 'Something washed up. For you.',
    idle_tip: 'New shells feel strange at first. Then they fit.',
  },
};

// Direct and Literal modes, for any species. {commaName} becomes ", Maya"
// (or nothing when there's no name), so "Hi{commaName}." reads well either way.
export const SHARED_LINES: Record<'direct' | 'literal', Lines> = {
  direct: {
    greeting_morning: 'Hi{commaName}.',
    greeting_afternoon: 'Hi{commaName}.',
    greeting_evening: 'Hi{commaName}.',
    checkin_listening: 'Go ahead.',
    after_checkin_surge: 'Checked in: {quadrant}.',
    after_checkin_swell: 'Checked in: {quadrant}.',
    after_checkin_ebb: 'Checked in: {quadrant}.',
    after_checkin_still: 'Checked in: {quadrant}.',
    unstick_offer: "Pick a reason. I'll suggest a step.",
    focus_start: 'Timer running.',
    focus_end_got_going: 'Done.',
    focus_end_didnt_start: 'Done. Try a smaller step?',
    bridge_start: 'Next event in {m} min.',
    breathing_invite: 'Breathe with the square.',
    celebration: 'Done.',
    wrap_start: 'Close the day: about 3 minutes.',
    wrap_end: 'Day closed.',
    shore_new_item: 'New item on your shore.',
    idle_tip: 'Tap me for a breathing exercise.',
  },
  literal: {
    greeting_morning: 'Hello{commaName}.',
    greeting_afternoon: 'Hello{commaName}.',
    greeting_evening: 'Hello{commaName}.',
    checkin_listening: 'Type what is happening. I will wait.',
    after_checkin_surge: 'Your check-in is saved. State: {quadrant}.',
    after_checkin_swell: 'Your check-in is saved. State: {quadrant}.',
    after_checkin_ebb: 'Your check-in is saved. State: {quadrant}.',
    after_checkin_still: 'Your check-in is saved. State: {quadrant}.',
    unstick_offer: 'Choose why the task is hard. Then I will suggest one first step.',
    focus_start: 'The timer is running. I will stay on the screen.',
    focus_end_got_going: 'The focus block is finished.',
    focus_end_didnt_start: 'The focus block is finished. You can try a smaller step.',
    bridge_start: 'Your next event starts in {m} minutes.',
    breathing_invite: 'Breathe in for 4 seconds. Hold for 4 seconds. Breathe out for 4 seconds.',
    celebration: 'This was saved to your shore.',
    wrap_start: 'You can close the day now. It takes about 3 minutes.',
    wrap_end: 'The day is closed.',
    shore_new_item: 'A new item is on your shore.',
    idle_tip: 'Tap me to start a breathing exercise.',
  },
};


// One line for a moment. Gentle mode uses the companion's own voice; Direct
// and Literal use the shared lines. Where a moment has several lines, the
// choice comes from the date, so it doesn't change every render but does
// vary from day to day.
export function companionLine(
  species: CompanionSpecies,
  context: LineContext,
  mode: CommunicationMode,
  vars: { name?: string; quadrant?: string; m?: number } = {},
  dateKey = '',
): string {
  const source = mode === 'gentle' ? COMPANION_LINES[species][context] : SHARED_LINES[mode][context];
  const options = Array.isArray(source) ? source : [source];
  let hash = 0;
  for (const ch of `${dateKey}:${context}`) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const line = options[hash % options.length];
  return line
    .replace('{commaName}', vars.name ? `, ${vars.name}` : '')
    .replace('{name}', vars.name ?? '')
    .replace('{quadrant}', vars.quadrant ?? '')
    .replace('{m}', String(vars.m ?? ''));
}

export function quadrantContext(q: Quadrant): LineContext {
  return `after_checkin_${q}` as LineContext;
}
