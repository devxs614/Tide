// The words for refocus nudges (v2.1 F-07): "Earth to {name}", the welcome
// back, and what to do next. Drifting is normal, so nothing here counts it,
// calls it a failure or says "again". A copy test checks for the words
// that slip in most easily. The Focus screen loads these, not Today.
export const nudgeCopy = {
  title: {
    gentle: 'Earth to {name}! Still on {task}?',
    direct: 'Still on {task}?',
    literal: 'Are you still working on {task}?',
  },
  titleNoName: 'Earth to you! Still on {task}?',
  returnTitle: {
    gentle: 'Welcome back! Still on {task}?',
    direct: 'Back. Still on {task}?',
    literal: 'You returned to Tide. Are you still working on {task}?',
  },
  yes: 'Yes, still on it',
  drifted: 'I drifted',
  pickUp: 'Pick up from here',
  firstStep: 'Your first step: {step}',
  youWereAt: 'You were at: {note}',
  takeBreak: 'Take a 2-minute break',
  backToIt: 'Back to it',
  stop: 'Stop nudges for this block',
  pill: 'Still on it?',
  notify: 'Earth to {name}: your focus block on {task} is still running.',
  notifyNoName: 'Earth to you: your focus block on {task} is still running.',
  breakTitle: 'A 2-minute break',
  breakLeft: '{time} left',
  breakIdea: 'An idea: {strategy}. {summary}',
  menuLabel: 'Focus options',
  nudgesLabel: 'Nudges',
  levels: { off: 'Off', visual: 'Visual', visual_sound: 'Visual + sound' },
  coach: 'Want a gentle "Earth to {name}" check-in now and then? You can turn it on here.',
  coachNoName: 'Want a gentle "Earth to you" check-in now and then? You can turn it on here.',
  gotIt: 'Got it',
};
