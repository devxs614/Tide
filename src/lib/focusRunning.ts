// Which task has a focus block running right now (v2.1 F-03), so "Delete"
// can say it will also end the timer. It lives in localStorage because the
// block runs on its own full screen: the only way to delete its task
// meanwhile is from another tab. A mark older than a few hours is a tab
// that closed mid-block, not a block that's still going.
import { now } from './clock';
import { HOUR } from './time';

const KEY = 'tide.focusRunning';
const STALE = 4 * HOUR;

export function markFocusRunning(taskId: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ taskId, since: now() }));
  } catch {
    // Private windows can refuse storage; the dialog just won't mention it.
  }
}

export function clearFocusRunning(taskId: string): void {
  try {
    if (focusRunningTask() === taskId) localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear when storage is off.
  }
}

export function focusRunningTask(at = now()): string | null {
  try {
    const mark = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { taskId: string; since: number } | null;
    return mark && at - mark.since < STALE ? mark.taskId : null;
  } catch {
    return null;
  }
}
