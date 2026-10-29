// Every speech-friendly text rule from v2 spec 7.4, input → output, plus
// Tide's numbers-in-words rule and the 180-character chunking.
import { describe, expect, it } from 'vitest';
import { speechChunks, speechText } from '../speechText';

describe('speechText', () => {
  it.each([
    ['Ebb · Drained, Frustrated · 3:41 pm', 'Ebb, Drained, Frustrated, three forty-one pm.'],
    ['Chemistry lab → Calculus', 'Chemistry lab to Calculus.'],
    ['Energy ≥ 3 and ≤ 5', 'Energy at least three and at most five.'],
    ['Walks & breathing', 'Walks and breathing.'],
    ['Helped 4/5 times', 'Helped four out of five times.'],
    ['Try a 5 min block', 'Try a five minutes block.'],
    ['Try a 1 min reset', 'Try a one minute reset.'],
    ['Wait 30 sec, then 2 hrs', 'Wait thirty seconds, then two hours.'],
    ['Class at 15:40', 'Class at three forty PM.'],
    ['Class at 3:40 pm', 'Class at three forty pm.'],
    ['Tue, Oct 27', 'Tuesday, October twenty-seven.'],
    ['Nice work 🎉', 'Nice work.'],
    ['**Bold** and `code`', 'Bold and code.'],
    ['Say "Tide" out loud', 'Say Tide out loud.'],
    ["Don't stop", "Don't stop."],
    ['Hello {name}', 'Hello.'],
    ['Current state: Ebb (low energy, unpleasant)', 'Current state: Ebb. Low energy, unpleasant.'],
    ['Breathe in for 4', 'Breathe in for four.'],
    ['5-4-3-2-1 senses', 'five, four, three, two, one senses.'],
  ])('%s', (input, output) => {
    expect(speechText(input)).toBe(output);
  });

  it('joins list items as sentences', () => {
    expect(speechText(['Breathe in', 'Hold', 'Breathe out.'])).toBe('Breathe in. Hold. Breathe out.');
  });
});

describe('speechChunks', () => {
  const long =
    'Today started heavy, and starting things was hard. You still emailed your TA, and the switch from lab to calculus went okay. Box breathing and a person helped. Rest well, tomorrow is new water, and the first step is ready for you.';

  it('keeps every chunk at 180 characters or fewer, split at sentence ends', () => {
    const chunks = speechChunks(long);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c) => expect(c.length).toBeLessThanOrEqual(180));
    expect(chunks[0].endsWith('.')).toBe(true);
    expect(chunks.join(' ')).toBe(long);
  });

  it('splits a single very long sentence at commas', () => {
    const sentence = Array.from({ length: 12 }, (_, i) => `part number ${i} of a long list`).join(', ') + '.';
    const chunks = speechChunks(sentence);
    chunks.forEach((c) => expect(c.length).toBeLessThanOrEqual(180));
  });

  it('leaves short text as one chunk', () => {
    expect(speechChunks('Hold for four.')).toEqual(['Hold for four.']);
  });
});
