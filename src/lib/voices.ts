// Which English voice "Read aloud" uses. Left to itself the browser reads with
// the system default, which on a Mac set to Spanish is Paulina: English in a
// Spanish accent. So Tide ranks the English voices itself, softest first, and
// Settings can name one (D56, D57).

// The Mac's novelty voices (Bubbles, Zarvox…) and older robotic ones (Eddy,
// Fred…) are English but tiring to listen to, so they are never offered.
const UNCLEAR = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Buenas noticias', 'Good News', 'Cellos',
  'Jester', 'Organ', 'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox', 'Junior', 'Ralph', 'Fred',
  'Kathy', 'Eddy', 'Flo', 'Grandma', 'Grandpa', 'Reed', 'Rocko', 'Sandy', 'Shelley',
]);
// Soft, warm voices first: they suit breathing steps and a heavy afternoon.
const GENTLE = ['Ava', 'Zoe', 'Allison', 'Susan', 'Samantha', 'Serena', 'Moira', 'Joelle', 'Noelle', 'Jenny', 'Aria'];
// Clear voices that sound a little brisker; still far better than the default.
const CLEAR = ['Evan', 'Nathan', 'Daniel', 'Karen', 'Tessa', 'Guy', 'Google US English', 'Google UK English Female'];

function isReadable(voice: SpeechSynthesisVoice): boolean {
  return /^en[-_]/i.test(voice.lang) && !UNCLEAR.has(voice.name.split(' (')[0]);
}

function score(voice: SpeechSynthesisVoice): number {
  // Downloaded high-quality voices beat everything; their names say so, in
  // English or in the system's language ("Samantha (mejorada)").
  let points = /premium|enhanced|mejorada|natural|neural/i.test(voice.name) ? 40 : 0;
  if (GENTLE.some((name) => voice.name.includes(name))) points += 25;
  else if (CLEAR.some((name) => voice.name.includes(name))) points += 20;
  if (/^en[-_]US$/i.test(voice.lang)) points += 10;
  // A voice on the device keeps working offline.
  if (voice.localService) points += 5;
  return points;
}

// Every English voice worth offering, best first.
export function readableEnglishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices
    .filter(isReadable)
    .map((voice) => ({ voice, points: score(voice) }))
    .sort((a, b) => b.points - a.points)
    .map(({ voice }) => voice);
}

export function clearestEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return readableEnglishVoices(voices)[0];
}

// The voice Maya chose in Settings, if this device still has it; otherwise
// the best one here (a chosen voice may not exist on her other devices).
export function voiceFor(voices: SpeechSynthesisVoice[], chosenName: string): SpeechSynthesisVoice | undefined {
  return (chosenName && voices.find((v) => v.name === chosenName)) || clearestEnglishVoice(voices);
}
