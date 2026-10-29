// A square 3D tile with a big icon and a word under it (v2 spec 4.4), for
// quick actions and Settings sections. The label is always visible; the
// icon never stands alone.
import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TILE =
  'press-3d card flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center font-display text-[0.9412rem] font-extrabold text-ink [--ledge-color:var(--line)] hover:bg-surface-2';

export function IconTile({
  icon: Icon,
  label,
  href,
  onClick,
  disabled,
  className,
  ...rest
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
} & Record<`data-${string}`, string>) {
  const inner = (
    <>
      <Icon className="size-7 stroke-[2.5] text-primary" aria-hidden />
      <span>{label}</span>
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cn(TILE, className)} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(TILE, 'disabled:bg-surface-2 disabled:text-ink-soft disabled:[--ledge-color:transparent]', className)}
      {...rest}
    >
      {inner}
    </button>
  );
}
