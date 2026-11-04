// Quick check-in's words (v2.3 Item 1). Only its sheet uses them, and the
// sheet loads the first time it opens, so they stay out of Today's first
// load; the check-in button keeps its two lines in checkinButtonCopy.ts.
export const quickCheckInCopy = {
  quick: 'Quick check-in',
  quickTitle: { gentle: "How's the water?", direct: 'How are you?', literal: 'Choose how you feel right now.' },
  quickWords: 'Pick a word, or skip.',
  skip: 'Skip',
  addMore: 'Add more?',
  back: 'Back',
} as const;
