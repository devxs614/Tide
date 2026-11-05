// The rehearsal panel (?demoDebug=1, demo fix pack Section 8): it logs the
// state changes with what caused them, the toggles the 300 ms guard
// ignored and each step, shows the demo clock, and copies the log.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { director, type DirectorDeps } from '../director/engine';
import { DebugPanel } from '../director/DebugPanel';

const deps: DirectorDeps = { navigate: () => {}, speak: async () => 'done', custom: async () => {}, setClock: async () => {}, setSpeed: async () => {} };

afterEach(() => {
  director.exit();
  vi.unstubAllGlobals();
});

describe('the debug panel', () => {
  it('logs causes, ignored toggles and steps, shows the clock, and copies the log', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    director.start({ id: 'full', chapters: [{ id: 'a', title: 'A' }], steps: [{ id: 'one', chapter: 'a', action: { kind: 'say' }, holdMs: 60_000 }] }, 'full', deps);
    render(<DebugPanel />);
    act(() => {
      director.toggle('key');
      director.toggle('click');
    });
    const log = await screen.findByText(/running → paused \(key\)/);
    expect(log.textContent).toMatch(/starting → running \(start\)/);
    expect(log.textContent).toMatch(/step one start/);
    expect(log.textContent).toMatch(/toggle \(key\)/);
    expect(log.textContent).toMatch(/ignored toggle \(click\) within 300 ms/);
    expect(screen.getByText(/Demo clock: .* at 0×/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy log' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('running → paused (key)'));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});
