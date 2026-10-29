// Tide's abstract wave, drawn from theme tokens: the logo mark, the empty
// state art when there's no companion, and the "none" alternative in places
// a companion would stand.
export function WaveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden>
      <circle cx="122" cy="26" r="12" fill="var(--accent)" />
      <path d="M8 58c18-14 34-14 52 0s34 14 52 0 34-14 40-8" fill="none" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" />
      <path d="M8 80c18-12 34-12 52 0s34 12 52 0 34-12 40-6" fill="none" stroke="var(--sea)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
