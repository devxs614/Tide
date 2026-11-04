// Words for the v2.3 check-in button (v2.3 spec 7): its description when
// it shows the last check-in, and the one-time press-and-hold tip. Quick
// check-in's own words live in quickCheckInCopy.ts, loaded with its sheet.
export const checkinButtonCopy = {
  lastState: 'Last check-in: {quadrant}, {time}',
  quickTip: 'Tip: press and hold for a quick check-in.',
} as const;
