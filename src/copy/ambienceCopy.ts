// The words for background sounds (v2.1 F-09): the nine sounds and what
// each is like, the player, and the mini player. Binaural beats get facts
// only, with no health claims. Focus and the Toolkit load these, and the
// mini player loads them when a sound is on, so they stay out of Today's
// first load. Same rules as en.ts.
import type { AmbienceId } from '@/lib/sound/names';

export const ambienceCopy = {
  sounds: 'Sounds',
  backgroundSounds: 'Background sounds',
  names: {
    white: 'White noise',
    pink: 'Pink noise',
    brown: 'Brown noise',
    rain: 'Rain',
    waves: 'Ocean waves',
    fan: 'Fan',
    stream: 'Stream',
    binaural_focus: 'Binaural · Focus',
    binaural_calm: 'Binaural · Calm',
  } satisfies Record<AmbienceId, string>,
  descriptions: {
    white: 'Even hiss across all pitches.',
    pink: 'Softer than white noise. Like steady rain on a window.',
    brown: 'Deep and rumbly, like a distant waterfall.',
    rain: 'Light rain with soft drops.',
    waves: 'Slow waves on a beach.',
    fan: 'A steady fan hum.',
    stream: 'A small stream over stones.',
    binaural_focus: 'Needs headphones. Two close tones (about 14 Hz apart).',
    binaural_calm: 'Needs headphones. Two close tones (about 6 Hz apart).',
  } satisfies Record<AmbienceId, string>,
  playing: 'Playing',
  volume: 'Volume',
  playFor: 'Play for',
  playForOptions: { until_stop: 'Until I stop', focus_end: 'Until focus ends', '15': '15 minutes', '30': '30 minutes', '60': '60 minutes' },
  note: 'Sounds keep playing while you use other parts of Tide. They may stop if your phone locks the screen.',
  headphones: 'Use headphones at a low volume.',
  binauralHelp: 'Some people like binaural beats for focus or calm. Research results are mixed, so try it and see if it helps you.',
  miniPlayer: '{sound} · playing',
  miniPaused: '{sound} · paused',
  stop: 'Stop',
  pause: 'Pause',
  play: 'Play',
  hide: 'Hide',
  playerLabel: 'Background sound',
};
