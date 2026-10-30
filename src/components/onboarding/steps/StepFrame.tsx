'use client';

// The shape every onboarding step shares: a title (which takes focus, so a
// screen reader hears where it is), an optional line under it, the step's
// content, and the main button at the bottom.
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function StepFrame({
  title,
  sub,
  children,
  action,
  onAction,
  actionDisabled,
  footer,
}: {
  title: string;
  sub?: string;
  children?: ReactNode;
  action?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section aria-labelledby="ob-title" className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 id="ob-title" ref={ref} tabIndex={-1} className="text-h1 font-extrabold outline-none">
          {title}
        </h1>
        {sub && <p className="text-ink-soft">{sub}</p>}
      </div>
      {children}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {action && (
          <Button size="block" onClick={onAction} disabled={actionDisabled}>
            {action}
          </Button>
        )}
        {footer}
      </div>
    </section>
  );
}
