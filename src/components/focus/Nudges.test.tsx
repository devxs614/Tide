// Flow tests for refocus nudges (v2.1 F-07, spec 11.6), with the clock
// moved by hand and the audio engine as spies: a 25-minute block nudges at
// 10:00 and 20:00 and not in the first or last 2 minutes; "I drifted"
// shows the first step; a 2-minute break pauses and resumes; "Welcome
// back" after Tide was hidden; the hidden-tab sound is cancelled on
// return; with nudges off (the default) nothing appears; and the demo
// tour's cue shows one card.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { now } from '@/lib/clock';
import { DEMO_NUDGE_EVENT } from '@/lib/focus/nudgePlan';
import { MINUTE } from '@/lib/time';
import { addTask } from '@/lib/repo/tasks';
import { renderApp, resetApp } from '@/test/utils';
import type { Settings } from '@/lib/types';
import { FocusScreen } from './FocusScreen';

const engine = vi.hoisted(() => ({
  unlockAlertAudio: vi.fn(),
  scheduleEndAlert: vi.fn(),
  cancelEndAlert: vi.fn(),
  settleEndAlert: vi.fn(),
  scheduleWarning: vi.fn(),
  cancelWarning: vi.fn(),
  scheduleNudgeSound: vi.fn(),
  cancelNudgeSound: vi.fn(),
  playTone: vi.fn(),
}));
vi.mock('@/lib/focus/alertEngine', () => engine);

let t0 = 0;
const at = (minutes: number) => act(() => vi.setSystemTime(new Date(t0 + minutes * MINUTE)));
// The nudge check runs once a real second.
const tick = () => new Promise((r) => setTimeout(r, 1200));

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

async function block(settings: Partial<Settings> = {}) {
  await resetApp({ name: 'Maya', 'focus.refocusNudge': 'visual', 'focus.nudgeCoachSeen': true, ...settings });
  const task = await addTask({ title: 'Lab report', type: 'writing', energyCost: 2, status: 'in_progress' });
  const { db } = await import('@/lib/db');
  await db.tasks.update(task.id, { firstStep: 'Write the title and date' });
  const { user } = await renderApp(<FocusScreen taskId={task.id} suggestedMinutes={25} />);
  await screen.findByRole('button', { name: '25 min' });
  vi.useFakeTimers({ toFake: ['Date'] });
  t0 = now();
  await user.click(screen.getByRole('button', { name: 'Start' }));
  return user;
}

beforeEach(() => Object.values(engine).forEach((fn) => fn.mockReset()));
afterEach(() => {
  vi.useRealTimers();
  setHidden(false);
});

describe('refocus nudges', () => {
  it('nudge at 10:00 and 20:00 only; "I drifted" shows the first step', async () => {
    const user = await block();
    at(1);
    await tick();
    expect(screen.queryByText('Earth to Maya! Still on Lab report?')).not.toBeInTheDocument();

    at(10);
    expect(await screen.findByText('Earth to Maya! Still on Lab report?', {}, { timeout: 3000 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Yes, still on it' }));
    expect(screen.queryByText('Earth to Maya! Still on Lab report?')).not.toBeInTheDocument();

    at(20);
    expect(await screen.findByText('Earth to Maya! Still on Lab report?', {}, { timeout: 3000 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'I drifted' }));
    expect(screen.getByText('Your first step: Write the title and date')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pick up from here' }));

    at(23.5);
    await tick();
    expect(screen.queryByText('Earth to Maya! Still on Lab report?')).not.toBeInTheDocument();
  }, 20_000);

  it('a 2-minute break pauses the block, and "Back to it" resumes it', async () => {
    const user = await block();
    at(10);
    await screen.findByText('Earth to Maya! Still on Lab report?', {}, { timeout: 3000 });
    await user.click(screen.getByRole('button', { name: 'Take a 2-minute break' }));
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A 2-minute break' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to it' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  }, 20_000);

  it('welcomes back after 30 seconds away, and cancels the hidden-tab sound', async () => {
    await block({ 'focus.refocusNudge': 'visual_sound', 'focus.nudgeHiddenAfter': '2' });
    at(5);
    act(() => setHidden(true));
    await waitFor(() => expect(engine.scheduleNudgeSound).toHaveBeenCalled());
    expect(engine.scheduleNudgeSound.mock.calls[0][0]).toBe(120);
    at(5.75);
    act(() => setHidden(false));
    expect(engine.cancelNudgeSound).toHaveBeenCalled();
    expect(await screen.findByText('Welcome back! Still on Lab report?')).toBeInTheDocument();
  }, 20_000);

  it('"Stop nudges for this block" and the default (off) keep things quiet', async () => {
    const user = await block();
    at(10);
    await screen.findByText('Earth to Maya! Still on Lab report?', {}, { timeout: 3000 });
    await user.click(screen.getByRole('button', { name: 'Stop nudges for this block' }));
    at(20);
    await tick();
    expect(screen.queryByText('Earth to Maya! Still on Lab report?')).not.toBeInTheDocument();
  }, 20_000);

  it('does nothing with nudges off', async () => {
    await block({ 'focus.refocusNudge': 'off' });
    at(10);
    await tick();
    expect(screen.queryByText(/Still on Lab report\?/)).not.toBeInTheDocument();
  }, 20_000);

  it("shows one card on the demo tour's cue, even with nudges off, silently", async () => {
    await block({ 'focus.refocusNudge': 'off' });
    at(1);
    act(() => void window.dispatchEvent(new Event(DEMO_NUDGE_EVENT)));
    await screen.findByText('Earth to Maya! Still on Lab report?');
    expect(engine.playTone).not.toHaveBeenCalled();
  }, 20_000);
});
