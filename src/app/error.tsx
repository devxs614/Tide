'use client';

// Tide's error page (v2 spec 17.5). This boundary wraps every screen, so
// anything imported here lands in every page's first load; the page itself
// (ErrorContent) loads only when an error actually happens.
import dynamic from 'next/dynamic';

const ErrorContent = dynamic(() => import('@/components/shell/ErrorContent').then((m) => m.ErrorContent), { ssr: false });

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorContent reset={reset} />;
}
