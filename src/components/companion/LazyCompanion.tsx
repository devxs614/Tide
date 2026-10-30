'use client';

// The companion for places that every page loads (the top bar, toasts, the
// error page): the same Companion, but its code arrives just after the page
// instead of with it, so decoration never weighs on first load (v2 spec 5.6).
import dynamic from 'next/dynamic';

export const LazyCompanion = dynamic(() => import('./Companion').then((m) => m.Companion), {
  ssr: false,
  loading: () => null,
});
