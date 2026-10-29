import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEMO_START, demoClockAt, now, setDemoClock } from './clock';
import { formatLongDate, formatTime } from './time';

afterEach(() => {
  setDemoClock(null);
  vi.useRealTimers();
});

describe('clock', () => {
  it('returns real time when demo mode is off', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 28, 9, 0));
    expect(now()).toBe(new Date(2026, 9, 28, 9, 0).getTime());
  });

  it('starts the demo at Thursday 3:40 pm and lets time run forward from there', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 28, 9, 0));
    setDemoClock(demoClockAt(DEMO_START));
    expect(formatTime(now())).toBe('3:40 pm');
    expect(formatLongDate(now())).toBe('Thursday, November 5');

    vi.advanceTimersByTime(90_000);
    expect(now()).toBe(DEMO_START + 90_000);
  });
});
