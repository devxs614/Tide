// Crisis phrases that stop all AI coaching and open the support screen.
// They live in one file so the team can review them with the Challenge
// Partner. Matching is by whole phrase, ignoring case, accents and
// apostrophes ("cant go on" matches "can't go on").
//
// Deliberately NOT on the list: everyday idioms like "this deadline is
// killing me", "I'm dying to see it" or "dead tired". Catching those would
// send someone to a crisis screen for venting about homework, which teaches
// them to stop writing honestly. "kill myself" stays, even though it is
// sometimes used as a joke: a false alarm there is the safer mistake.

export const SAFETY_PHRASES_EN: string[] = [
  'kill myself',
  'killing myself',
  'suicide',
  'suicidal',
  'end my life',
  'want to die',
  'wish i was dead',
  'wish i were dead',
  'better off dead',
  'hurt myself',
  'harm myself',
  'self harm',
  'self-harm',
  'cut myself',
  'no reason to live',
  "can't go on",
  'end it all',
  'take my own life',
  "don't want to live",
  "don't want to be alive",
];

export const SAFETY_PHRASES_ES: string[] = [
  'matarme',
  'suicidarme',
  'suicidio',
  'quiero morir',
  'me quiero morir',
  'no quiero vivir',
  'quitarme la vida',
  'hacerme daño',
  'cortarme',
  'no tiene sentido vivir',
  'acabar con mi vida',
  'no quiero estar vivo',
  'no quiero estar viva',
];

export const SAFETY_PHRASES = [...SAFETY_PHRASES_EN, ...SAFETY_PHRASES_ES];
