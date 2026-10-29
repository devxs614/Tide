// Shared setup for every Vitest file.
// jsdom lacks a few browser APIs that Radix and our timers expect, so we fill
// them in here, and fake-indexeddb gives Dexie a real database to talk to.
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

process.env.TZ = 'America/Monterrey';

// Flow tests wait on IndexedDB, live queries and the AI fallback. With every
// test file running in parallel, one second (the default) is sometimes not
// enough on a busy laptop, which made the Bridge flow fail now and then.
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});

// Radix measures elements and listens for pointer capture; jsdom has neither.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

if (typeof window !== 'undefined') {
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  Element.prototype.scrollIntoView ??= () => {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.setPointerCapture ??= () => {};
  window.HTMLElement.prototype.scrollTo ??= () => {};
}

// next/navigation only works inside the Next runtime. Tests read the pushed
// URLs from `navigation.push` to check where a flow sends Maya next.
const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  pathname: '/',
  search: '',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: navigation.push,
    replace: navigation.replace,
    back: navigation.back,
    refresh: () => {},
    prefetch: () => {},
  }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

(globalThis as unknown as { __navigation: typeof navigation }).__navigation = navigation;
