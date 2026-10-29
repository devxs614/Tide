// When Today offers a lighter plan, and which tasks count as "today", so the
// banner never nags and a moved task never shows up twice.
import { describe, expect, it } from 'vitest';
import { bannerReason, shouldShowBanner, todaysTasks } from './daymode';
import type { CheckIn, Task } from './types';

const checkIn = (over: Partial<CheckIn>): CheckIn => ({
  id: 'c1',
  ts: 0,
  emotions: [],
  energy: 0,
  pleasantness: 0,
  quadrant: 'swell',
  aiUsed: false,
  ...over,
});

const task = (over: Partial<Task>): Task => ({
  id: over.title ?? 't',
  title: 't',
  type: 'other',
  energyCost: 1,
  status: 'not_started',
  createdAt: 0,
  order: 0,
  ...over,
});

describe('Day Mode banner rules', () => {
  it('recommends a lighter day for Ebb, strong Surge, or a request to adjust', () => {
    expect(bannerReason(checkIn({ quadrant: 'ebb', energy: -1, pleasantness: -1 }))).toBe('ebb');
    expect(bannerReason(checkIn({ quadrant: 'surge', energy: 3, pleasantness: -3 }))).toBe('surge');
    expect(bannerReason(checkIn({ quadrant: 'swell', need: 'adjust' }))).toBe('adjust');
  });

  it('stays quiet for mild Surge, good days and no check-in', () => {
    expect(bannerReason(checkIn({ quadrant: 'surge', energy: 2, pleasantness: -3 }))).toBeNull();
    expect(bannerReason(checkIn({ quadrant: 'still', energy: -2, pleasantness: 3 }))).toBeNull();
    expect(bannerReason(null)).toBeNull();
  });

  it('hides once a lighter plan exists or after "Not now" for this check-in', () => {
    const latestToday = checkIn({ quadrant: 'ebb', energy: -3, pleasantness: -3 });
    const plan = { date: 'x', mode: 'gentle' as const, keptTaskIds: [], movedTaskIds: [], acceptedAt: 0 };
    expect(shouldShowBanner({ latestToday, plan: undefined, dismissedFor: null })).toBe('ebb');
    expect(shouldShowBanner({ latestToday, plan, dismissedFor: null })).toBeNull();
    expect(shouldShowBanner({ latestToday, plan: undefined, dismissedFor: 'c1' })).toBeNull();
  });
});

describe("today's tasks", () => {
  it('includes due today, kept, carried over and in progress; never moved-off or done', () => {
    const plan = { date: '2026-11-05', mode: 'gentle' as const, keptTaskIds: ['kept'], movedTaskIds: [], acceptedAt: 0 };
    const list = todaysTasks(
      [
        task({ id: 'due', title: 'due', due: '2026-11-05' }),
        task({ id: 'kept', title: 'kept', due: '2026-11-09' }),
        task({ id: 'carried', title: 'carried', movedTo: '2026-11-05' }),
        task({ id: 'doing', title: 'doing', status: 'in_progress' }),
        task({ id: 'moved', title: 'moved', due: '2026-11-05', movedFrom: '2026-11-05' }),
        task({ id: 'done', title: 'done', due: '2026-11-05', status: 'done' }),
        task({ id: 'later', title: 'later', due: '2026-11-20' }),
      ],
      plan,
      '2026-11-05',
    );
    expect(list.map((t) => t.id).sort()).toEqual(['carried', 'doing', 'due', 'kept']);
  });
});
