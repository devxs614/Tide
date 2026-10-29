// The wave drawing on the first onboarding screen. Purely decorative (hidden
// from screen readers) and drawn with the theme's colors, so it works in
// light and dark mode.
export function WaveArt() {
  return (
    <svg aria-hidden viewBox="0 0 240 90" className="h-24 w-full max-w-xs text-primary">
      <path d="M0 50 C 30 30, 60 30, 90 50 S 150 70, 180 50 S 220 30, 240 45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M0 70 C 30 55, 60 55, 90 70 S 150 85, 180 70 S 220 55, 240 65" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="5" strokeLinecap="round" />
      <circle cx="196" cy="22" r="10" className="fill-swell" />
    </svg>
  );
}
