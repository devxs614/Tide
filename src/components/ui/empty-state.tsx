// A designed empty state (v2 spec 4.4 and 17.9): an illustration, a title,
// one line of text and at most one action. The illustration is Maya's
// companion, waving; with no companion it's calm waves.
import * as React from 'react';
import { cn } from '@/lib/utils';
import { EmptyStateArt } from '@/components/companion/EmptyStateArt';

export function EmptyState({
  title,
  body,
  action,
  art,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  art?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-4 py-8 text-center', className)}>
      <div className="anim-pop">{art ?? <EmptyStateArt />}</div>
      <h2 className="text-h3 font-extrabold text-ink">{title}</h2>
      {body && <p className="mx-auto text-ink-soft">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
