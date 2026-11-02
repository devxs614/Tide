// The plain rules behind the focus alert (v2.1 F-06): v2's end-sound switch
// still silences the end, the warning lead, the tab's countdown, and the
// end time after a pause and a resume.
import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MINUTE } from '@/lib/time';
import { useFocusTimer } from '@/components/focus/useFocusTimer';
import { alertLevel, countdownTitle, repeatOffsets, warnLeadMs } from './alertPlan';

afterEach(() => vi.useRealTimers());

describe('alert rules', () => {
  it('keeps a v2 user who turned the end sound off silent', () => {
    expect(alertLevel({ 'focus.endAlert': 'sound_visual', 'focus.endSound': true })).toBe('sound_visual');
    expect(alertLevel({ 'focus.endAlert': 'sound_visual', 'focus.endSound': false })).toBe('visual');
    expect(alertLevel({ 'focus.endAlert': 'off', 'focus.endSound': true })).toBe('off');
  });

  it('repeats at most three times, warns 1 or 2 minutes ahead, and titles the tab', () => {
    expect(repeatOffsets('once')).toEqual([0]);
    expect(repeatOffsets('gentle_repeat')).toEqual([0, 20, 40]);
    expect(warnLeadMs('off')).toBe(0);
    expect(warnLeadMs('2')).toBe(2 * MINUTE);
    expect(countdownTitle(9 * MINUTE + 41_000, 'Lab report')).toBe('9:41 · Lab report · Tide');
  });

  it('moves the end time by exactly the paused time', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = new Date(2026, 10, 5, 15, 0).getTime();
    vi.setSystemTime(t0);
    const { result } = renderHook(() => useFocusTimer(5, () => {}));
    act(() => result.current.start());
    expect(result.current.endsAt).toBe(t0 + 5 * MINUTE);
    vi.setSystemTime(t0 + MINUTE);
    act(() => result.current.pause());
    expect(result.current.endsAt).toBeNull();
    vi.setSystemTime(t0 + 3 * MINUTE);
    act(() => result.current.resume());
    expect(result.current.endsAt).toBe(t0 + 7 * MINUTE);
    expect(result.current.remaining).toBe(4 * MINUTE);
  });
});
