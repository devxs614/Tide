// Which database Tide is using (v2 spec 16.3): Maya's own ('main') or the
// demo workspace ('demo'), where the guided tour runs on example data. The
// choice is read once, when the app loads; switching reloads the page, so
// the main database is never even opened during a demo.
export type Workspace = 'main' | 'demo';

const KEY = 'tide.workspace';

export function currentWorkspace(): Workspace {
  if (typeof window === 'undefined') return 'main';
  try {
    return window.localStorage.getItem(KEY) === 'demo' ? 'demo' : 'main';
  } catch {
    return 'main';
  }
}

export type DemoMode = 'full' | 'pitch' | 'presenter' | 'explore';

// Into the demo: remember it, and reload into a fresh start of the tour.
export function enterDemoWorkspace(mode: DemoMode): void {
  try {
    window.localStorage.setItem(KEY, 'demo');
  } catch {
    // Storage blocked: the demo can't run without its own database.
    return;
  }
  // A full reload on purpose: the database is chosen when the app loads.
  window.location.assign(mode === 'explore' ? '/?demo=explore' : `/?demo=start&mode=${mode}`);
}

export function leaveDemoWorkspace(): void {
  try {
    window.localStorage.setItem(KEY, 'main');
  } catch {
    // Nothing to undo.
  }
  // A full reload, so the main database opens again.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign('/');
}
