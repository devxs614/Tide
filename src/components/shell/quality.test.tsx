// Quality features (v2 spec 17): the shortcut rules (never while typing or
// with a modifier), the shortcuts on the real app shell (check-in, tabs,
// help sheet, quiet while a sheet is open, off in Settings, off on the
// support pages), the offline pill and its announcement, the install
// control in each browser situation, and "How this screen works".
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { shortcutFor } from '@/lib/shortcuts';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { AppShell } from './AppShell';
import { OfflinePill } from './OfflinePill';
import { InstallButton } from './InstallButton';
import { ScreenHelpSheet } from './ScreenHelpSheet';

const key = (k: string, extra: Partial<KeyboardEvent> = {}, target: EventTarget | null = document.body) =>
  shortcutFor({ key: k, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, target, ...extra });

describe('shortcut rules', () => {
  it('maps each key to its action', () => {
    expect(key('c')).toEqual({ kind: 'checkIn' });
    expect(key('n')).toEqual({ kind: 'newTask' });
    expect(key('w')).toEqual({ kind: 'wrap' });
    expect(key('/')).toEqual({ kind: 'searchSettings' });
    expect(key('?', { shiftKey: true })).toEqual({ kind: 'help' });
    expect(key('D', { shiftKey: true })).toEqual({ kind: 'demo' });
    expect(key('1')).toEqual({ kind: 'tab', href: '/' });
    expect(key('5')).toEqual({ kind: 'tab', href: '/shore' });
    expect(key('6')).toBeNull();
  });

  it('never fires while typing, with a modifier, or on a held key', () => {
    const input = document.createElement('input');
    const area = document.createElement('textarea');
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    for (const target of [input, area, editable]) expect(key('c', {}, target)).toBeNull();
    expect(key('c', { metaKey: true })).toBeNull();
    expect(key('c', { ctrlKey: true })).toBeNull();
    expect(key('1', { altKey: true })).toBeNull();
    expect(key('c', { repeat: true })).toBeNull();
    expect(key('C', { shiftKey: true })).toBeNull();
  });
});

describe('shortcuts in the app', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('opens check-in, switches tabs and shows the help sheet', async () => {
    // What's new would open as a dialog for a v1 user; this test is past it.
    await resetApp({ 'whatsNew.seen': true });
    await renderApp(<AppShell>{null}</AppShell>);
    await screen.findByRole('navigation', { name: 'Main' });
    fireEvent.keyDown(window, { key: '2' });
    expect(navigation.push).toHaveBeenLastCalledWith('/tasks');
    fireEvent.keyDown(window, { key: 'D', shiftKey: true });
    expect(navigation.push).toHaveBeenLastCalledWith('/demo');
    fireEvent.keyDown(window, { key: '?', shiftKey: true });
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    expect(screen.getByText(/turn them off in Settings/)).toBeInTheDocument();
    // With a sheet open, keys belong to the sheet.
    navigation.push.mockClear();
    fireEvent.keyDown(window, { key: '3' });
    expect(navigation.push).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement ?? window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'c' });
    expect(await screen.findByLabelText('In your own words')).toBeInTheDocument();
  });

  it('does nothing when turned off, or on the support pages', async () => {
    await resetApp({ 'shortcuts.enabled': false });
    await renderApp(<AppShell>{null}</AppShell>);
    await screen.findByRole('navigation', { name: 'Main' });
    fireEvent.keyDown(window, { key: '2' });
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it('stays quiet on the support pages', async () => {
    await resetApp();
    navigation.pathname = '/support';
    await renderApp(<AppShell>{null}</AppShell>);
    await screen.findByRole('navigation', { name: 'Main' });
    fireEvent.keyDown(window, { key: '1' });
    expect(navigation.push).not.toHaveBeenCalled();
  });
});

describe('offline pill', () => {
  afterEach(() => vi.restoreAllMocks());

  it('appears and is announced when the browser goes offline', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await renderApp(<OfflinePill />);
    const said = () => screen.getAllByRole('status').some((el) => el.textContent === 'Offline · using built-in suggestions');
    // The pill itself is always drawn (hidden); wait for it to mount.
    await screen.findByText('Offline · using built-in suggestions', { selector: 'span' });
    expect(said()).toBe(false);
    // Under load the event can arrive before React has subscribed; it reads
    // the value again when it does, so wait for the result.
    online.mockReturnValue(false);
    act(() => void window.dispatchEvent(new Event('offline')));
    await waitFor(() => expect(said()).toBe(true));
    online.mockReturnValue(true);
    act(() => void window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(said()).toBe(false));
  });
});

describe('install control', () => {
  afterEach(() => vi.restoreAllMocks());

  it('offers the browser prompt only when the browser offers one, and only on press', async () => {
    await renderApp(<InstallButton />);
    expect(await screen.findByText(/doesn't offer installing from here/)).toBeInTheDocument();
    const prompt = vi.fn(async () => {});
    const offer = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    act(() => void window.dispatchEvent(offer));
    expect(offer.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: 'Install Tide' }));
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
  });

  it('shows the two taps on an iPhone', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
    await renderApp(<InstallButton />);
    expect(await screen.findByText('Tap Share, then Add to Home Screen.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install Tide' })).not.toBeInTheDocument();
  });
});

describe('how this screen works', () => {
  it('explains the screen Maya is on', async () => {
    await renderApp(<ScreenHelpSheet pathname="/shore" open onOpenChange={() => {}} />);
    const sheet = await screen.findByRole('dialog', { name: 'How this screen works' });
    expect(sheet).toHaveTextContent('Your Shore');
    expect(sheet).toHaveTextContent(/Nothing ever disappears/);
  });
});

describe('new task shortcut landing', () => {
  it('opens the new-task form from /tasks?new=1 and tidies the address', async () => {
    const { TasksScreen } = await import('@/components/tasks/TasksScreen');
    await resetApp();
    await renderApp(<TasksScreen startNew />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith('/tasks');
  });
});
