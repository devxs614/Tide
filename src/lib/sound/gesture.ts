// Browsers only let a page make sound after the person has touched or typed
// something, and an AudioContext created too early starts muted. Tide also
// never wants to surprise anyone with sound on load. So the engine waits for
// the first real gesture, which this little module notices.
let gestured = false;

if (typeof window !== 'undefined') {
  const mark = () => {
    gestured = true;
  };
  window.addEventListener('pointerdown', mark, { capture: true, once: true });
  window.addEventListener('keydown', mark, { capture: true, once: true });
}

export function hasUserGesture(): boolean {
  return gestured;
}

export function markUserGestureForTests(value: boolean): void {
  gestured = value;
}
