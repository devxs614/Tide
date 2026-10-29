// Helpers for flow tests: render real screens inside Tide's providers,
// reset the fake IndexedDB between tests, set preferences, mock the AI
// routes, and drive the app with the keyboard alone.
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { Providers } from '@/app/providers';
import { db } from '@/lib/db';
import { clearData } from '@/lib/repo/data';
import { setSettings } from '@/lib/repo/settings';
import { resetAiClientStateForTests } from '@/lib/ai/runAi';
import { setDemoClock } from '@/lib/clock';
import { resetNarrationCacheForTests } from '@/components/patterns/useNarration';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';

export const navigation = (globalThis as unknown as {
  __navigation: { push: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn>; pathname: string; search: string };
}).__navigation;

export async function resetApp(settings: Partial<Settings> = {}): Promise<void> {
  await clearData();
  await db.settings.clear();
  await setSettings({ onboarded: true, ...settings });
  resetAiClientStateForTests();
  resetNarrationCacheForTests();
  setDemoClock(null);
  navigation.push.mockReset();
  navigation.replace.mockReset();
  navigation.pathname = '/';
  navigation.search = '';
}

// Renders children only after settings have loaded from IndexedDB, the same
// way the real app waits before showing anything that depends on them.
function WhenLoaded({ children }: { children: ReactElement }) {
  const { loaded } = useSettings();
  return loaded ? children : null;
}

export async function renderApp(ui: ReactElement): Promise<{ user: UserEvent }> {
  const user = userEvent.setup();
  render(
    <Providers>
      <WhenLoaded>{ui}</WhenLoaded>
    </Providers>,
  );
  return { user };
}

type RouteHandler = (body: unknown) => unknown;

// Stubs fetch for /api/config and /api/ai/<route>. Unlisted routes answer
// missing_key, like a deployment without an API key.
export function mockAi(handlers: Partial<Record<'label' | 'unstick' | 'daymode' | 'bridge' | 'narrate', RouteHandler>>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === '/api/config') return new Response(JSON.stringify({ timeoutMs: 2000, demoTimeoutMs: 1000 }));
    const route = url.replace('/api/ai/', '') as keyof typeof handlers;
    const handler = handlers[route];
    if (!handler) return new Response(JSON.stringify({ ok: false, error: 'missing_key' }), { status: 503 });
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    return new Response(JSON.stringify({ ok: true, data: handler(body), source: 'ai' }));
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

export function aiCalls(fn: ReturnType<typeof vi.fn>, route: string): unknown[] {
  return fn.mock.calls.filter(([url]) => url === `/api/ai/${route}`).map(([, init]) => JSON.parse(String((init as RequestInit).body)));
}

// Presses Tab until the element with this accessible name has focus, to
// prove it can be reached with the keyboard alone.
export async function tabTo(user: UserEvent, name: string | RegExp, max = 40): Promise<HTMLElement> {
  for (let i = 0; i < max; i++) {
    const el = document.activeElement as HTMLElement | null;
    const labelled = el as (HTMLElement & { labels?: NodeListOf<HTMLLabelElement> }) | null;
    const label = el ? (el.getAttribute('aria-label') ?? labelled?.labels?.[0]?.textContent ?? el.textContent ?? '') : '';
    if (el && (typeof name === 'string' ? label.trim() === name : name.test(label))) return el;
    await user.tab();
  }
  throw new Error(`Could not reach "${String(name)}" with Tab`);
}

export { screen };
