// The demo (v2 spec 16, 21.2–21.3): flow test 14 (starting and leaving the
// demo never touches the main data), the workspace and database names, the
// director's engine on fake elements (clicks, typing, a missing element
// skipped without crashing, presenter pauses), every script target present
// in the code, and the crisis preview existing only in the demo workspace.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { databaseName, db } from '@/lib/db';
import { addTask } from '@/lib/repo/tasks';
import { currentWorkspace, enterDemoWorkspace, leaveDemoWorkspace } from '@/lib/workspace';
import { CrisisScreen } from '@/components/safety/CrisisScreen';
import { renderApp, resetApp } from '@/test/utils';
import { director, type DirectorDeps } from '../director/engine';
import { FULL } from '../director/scripts/full';
import { PITCH } from '../director/scripts/pitch';
import type { Script } from '../director/types';

afterEach(() => {
  window.localStorage.removeItem('tide.workspace');
  vi.unstubAllGlobals();
  director.exit();
  document.body.innerHTML = '';
});

describe('demo workspace', () => {
  it('flow 14: starting and leaving the demo leaves the main data as it was', async () => {
    await resetApp();
    await addTask({ title: 'Real task', type: 'admin', energyCost: 1 });
    const before = await Promise.all([db.tasks.count(), db.settings.count(), db.wins.count()]);
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    enterDemoWorkspace('pitch');
    expect(currentWorkspace()).toBe('demo');
    expect(databaseName()).toBe('tide-demo');
    expect(assign).toHaveBeenLastCalledWith('/?demo=start&mode=pitch');
    leaveDemoWorkspace();
    expect(currentWorkspace()).toBe('main');
    expect(databaseName()).toBe('tide');
    expect(assign).toHaveBeenLastCalledWith('/');
    expect(await Promise.all([db.tasks.count(), db.settings.count(), db.wins.count()])).toEqual(before);
  });
});

function deps(): DirectorDeps & { navigated: string[] } {
  const navigated: string[] = [];
  return {
    navigated,
    navigate: (p) => navigated.push(p),
    speak: async () => {},
    custom: async () => {},
    setClock: async () => {},
    setSpeed: async () => {},
  };
}

describe('director engine', () => {
  it('clicks, types, skips a missing element without crashing, and finishes', async () => {
    document.body.innerHTML = '<button data-demo-id="go">Go</button><input data-demo-id="field" />';
    const clicked = vi.fn();
    document.querySelector('button')!.addEventListener('click', clicked);
    const script: Script = {
      id: 'full',
      chapters: [{ id: 'a', title: 'A' }],
      steps: [
        { id: 'nav', chapter: 'a', action: { kind: 'navigate', path: '/x' }, holdMs: 0 },
        { id: 'click', chapter: 'a', target: 'go', action: { kind: 'click' }, holdMs: 0 },
        { id: 'missing', chapter: 'a', target: 'nope', action: { kind: 'waitFor', timeoutMs: 100 }, holdMs: 0 },
        { id: 'type', chapter: 'a', target: 'field', action: { kind: 'type', text: 'hi', cps: 500 }, holdMs: 0, caption: 'Typing' },
      ],
    };
    const d = deps();
    director.start(script, 'full', d, { speed: 2 });
    await waitFor(() => expect(director.getState().done).toBe(true), { timeout: 8000 });
    expect(d.navigated).toEqual(['/x']);
    expect(clicked).toHaveBeenCalled();
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('hi');
    expect(director.getState().log).toEqual([
      { id: 'nav', ok: true },
      { id: 'click', ok: true },
      { id: 'missing', ok: false },
      { id: 'type', ok: true },
    ]);
  });

  it('waits at presenter pauses until Next', async () => {
    const script: Script = {
      id: 'pitch',
      chapters: [{ id: 'a', title: 'A' }],
      steps: [
        { id: 'one', chapter: 'a', action: { kind: 'say' }, caption: 'One', holdMs: 0, presenterPause: true },
        { id: 'two', chapter: 'a', action: { kind: 'say' }, caption: 'Two', holdMs: 0 },
      ],
    };
    director.start(script, 'presenter', deps());
    await waitFor(() => expect(director.getState().paused).toBe(true));
    expect(director.getState().index).toBe(1);
    expect(director.getState().done).toBe(false);
    director.toggle();
    await waitFor(() => expect(director.getState().done).toBe(true));
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [full] : [];
  });
}

describe('demo scripts', () => {
  it('only target elements that exist in the code', () => {
    const code = sourceFiles(path.join(process.cwd(), 'src/components'))
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n');
    const literal = new Set([...code.matchAll(/data-demo-id="([^"]+)"/g)].map((m) => m[1]));
    const prefixes = [...code.matchAll(/data-demo-id=\{`([^$`]+)\$\{/g)].map((m) => m[1]);
    const targets = [...FULL.steps, ...PITCH.steps].map((s) => s.target).filter((t): t is string => !!t);
    for (const t of new Set(targets)) expect(literal.has(t) || prefixes.some((p) => t.startsWith(p)), t).toBe(true);
  });

  it('give every step a unique id and a known chapter', () => {
    for (const script of [FULL, PITCH]) {
      const chapters = new Set(script.chapters.map((c) => c.id));
      for (const s of script.steps) expect(chapters.has(s.chapter), `${script.id} ${s.id}`).toBe(true);
    }
    expect(new Set(FULL.steps.map((s) => s.id)).size).toBe(FULL.steps.length);
  });
});

describe('crisis preview', () => {
  it('shows the preview banner only in the demo workspace', async () => {
    await resetApp();
    await renderApp(<CrisisScreen preview />);
    await screen.findByRole('heading', { level: 2 });
    expect(screen.queryByText(/Preview: this is what Tide shows/)).toBeNull();
    window.localStorage.setItem('tide.workspace', 'demo');
    document.body.innerHTML = '';
    await renderApp(<CrisisScreen preview />);
    expect(await screen.findByText(/Preview: this is what Tide shows/)).toBeInTheDocument();
  });
});
