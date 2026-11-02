// Flow tests for the focus end alert (v2.1 F-06, spec 10.5). The audio
// engine is replaced with spies; the clock is moved by hand. A 5-minute
// block with sound off everywhere still schedules its end sound; it ends
// while the page is hidden, the tab says "Time's up", the notification
// goes out once, and coming back shows the outcome question and puts the
// tab back. An early end never plays anything.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { now } from '@/lib/clock';
import { MINUTE } from '@/lib/time';
import { addTask } from '@/lib/repo/tasks';
import { DONE_FAVICON } from '@/lib/focus/tabSignals';
import { renderApp, resetApp } from '@/test/utils';
import { FocusScreen } from './FocusScreen';

const engine = vi.hoisted(() => ({
  unlockAlertAudio: vi.fn(),
  scheduleEndAlert: vi.fn(),
  cancelEndAlert: vi.fn(),
  settleEndAlert: vi.fn(),
  scheduleWarning: vi.fn(),
  cancelWarning: vi.fn(),
  playTone: vi.fn(),
}));
vi.mock('@/lib/focus/alertEngine', () => engine);

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(async () => {
  Object.values(engine).forEach((fn) => fn.mockReset());
  document.title = 'Tide';
  document.head.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = '/icons/icon.svg';
  document.head.appendChild(icon);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  setHidden(false);
});

async function startBlock(settings = {}) {
  await resetApp({ 'sound.enabled': false, ...settings });
  const task = await addTask({ title: 'Lab report', type: 'writing', energyCost: 2, status: 'in_progress' });
  const { user } = await renderApp(<FocusScreen taskId={task.id} suggestedMinutes={5} />);
  await user.click(await screen.findByRole('button', { name: 'Start' }));
  return user;
}

describe('the focus end alert', () => {
  it('signals the end of a hidden block once, then puts the tab back', async () => {
    const notified: Array<{ title: string; body?: string }> = [];
    vi.stubGlobal(
      'Notification',
      Object.assign(
        function Notification(this: unknown, title: string, opts: { body?: string }) {
          notified.push({ title, body: opts.body });
        },
        { permission: 'granted' },
      ),
    );
    vi.useFakeTimers({ toFake: ['Date'] });
    await startBlock({ 'focus.notifyAtEnd': true });
    expect(engine.unlockAlertAudio).toHaveBeenCalled();
    await waitFor(() => expect(engine.scheduleEndAlert).toHaveBeenCalled());
    const [seconds, opts] = engine.scheduleEndAlert.mock.calls.at(-1)!;
    expect(seconds).toBeGreaterThan(299);
    expect(seconds).toBeLessThanOrEqual(300);
    expect(opts).toMatchObject({ tone: 'chime', repeat: 'once' });
    await waitFor(() => expect(document.title).toMatch(/^\d:\d\d · Lab report · Tide$/));

    setHidden(true);
    act(() => vi.setSystemTime(new Date(now() + 5 * MINUTE + 1000)));
    await waitFor(() => expect(document.title).toBe("Time's up · Tide"));
    expect(document.querySelector<HTMLLinkElement>('link[rel~="icon"]')!.href).toBe(DONE_FAVICON);
    expect(engine.settleEndAlert).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(notified).toEqual([{ title: "Time's up", body: 'Lab report: how did it go?' }]));

    act(() => setHidden(false));
    expect(await screen.findByRole('heading', { name: 'How did it go?' })).toBeInTheDocument();
    // Behind the outcome sheet, so hidden from the accessibility tree.
    expect(screen.getByText("Time's up", { selector: 'h2' })).toBeInTheDocument();
    expect(document.title).toBe('Tide');
    expect(document.querySelector<HTMLLinkElement>('link[rel~="icon"]')!.getAttribute('href')).toBe('/icons/icon.svg');
    expect(engine.settleEndAlert).toHaveBeenCalledTimes(1);
  });

  it('warns a minute before the end when asked', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    await startBlock({ 'focus.warnBeforeEnd': '1' });
    await waitFor(() => expect(engine.scheduleWarning).toHaveBeenCalled());
    expect(engine.scheduleWarning.mock.calls.at(-1)![0]).toBeGreaterThan(239);
    act(() => vi.setSystemTime(new Date(now() + 4 * MINUTE + 5000)));
    expect(await screen.findByText('One minute left.')).toBeInTheDocument();
  });

  it('plays nothing on an early end, and stays silent for a v2 user who turned the end sound off', async () => {
    const user = await startBlock();
    await waitFor(() => expect(engine.scheduleEndAlert).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: "I'm done early" }));
    expect(await screen.findByRole('heading', { name: 'How did it go?' })).toBeInTheDocument();
    expect(engine.cancelEndAlert).toHaveBeenCalled();
    expect(engine.settleEndAlert).not.toHaveBeenCalled();
    expect(screen.queryByText("Time's up", { selector: 'h2' })).not.toBeInTheDocument();

    engine.scheduleEndAlert.mockReset();
    await startBlock({ 'focus.endSound': false });
    await screen.findByRole('button', { name: 'Pause' });
    expect(engine.scheduleEndAlert).not.toHaveBeenCalled();
  });
});
