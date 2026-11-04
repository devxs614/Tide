// The demo tour's control bar sits above sheets and dialogs, outside them.
// Radix treats a press there as a press outside the sheet and closes it, so
// pressing Pause during the check-in closed the check-in (demo fix pack,
// D-5). Sheets and dialogs pass their outside-press events through this;
// outside the demo there is no bar, so nothing changes.
export function keepOpenForDemoControls(event: { target: EventTarget | null; preventDefault: () => void }): void {
  if ((event.target as Element | null)?.closest?.('[data-demo-hud]')) event.preventDefault();
}
