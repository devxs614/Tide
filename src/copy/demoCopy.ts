// Words only the running demo shows (demo fix pack): the seed's calm retry,
// the play/pause button's names and "Paused", the tap narration needs to
// start, and the note when a device has no voice. They live apart from en.ts
// because the demo runtime loads on its own, never with Today.
export const demoCopy = {
  seedFailed: "The demo data couldn't be prepared. Try again.",
  tryAgain: 'Try again',
  playDemo: 'Play demo',
  pauseDemo: 'Pause demo',
  paused: 'Paused',
  // A browser speaks only after someone has tapped the page, and the tour
  // starts on a freshly loaded one.
  tapToStart: 'Narration is on. Press play to start the tour.',
  noNarration: "Narration isn't available on this device. Captions will stay on screen longer.",
  copyLog: 'Copy log',
  logCopied: 'Copied',
  clockLabel: 'Demo clock: {time} at {speed}×',
};
