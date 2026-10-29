// Tide's button. Started from the shadcn/ui CLI output and adapted to the
// spec: every size is at least 48px tall (touch targets), labels wrap instead
// of overflowing at 150% text (so buttons may shrink in a row; shadcn's
// shrink-0 is gone on purpose), shapes are pills, and there is no red
// "destructive" style; a careful action uses the neutral notice color.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-center text-body font-bold whitespace-normal transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary hover:bg-primary/90',
        secondary: 'border-line bg-surface text-ink hover:bg-surface-2',
        outline: 'border-primary bg-transparent text-primary hover:bg-surface-2',
        ghost: 'text-ink hover:bg-surface-2',
        quiet: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
        link: 'rounded-md px-1 text-primary underline underline-offset-4 hover:no-underline',
        notice: 'border-notice bg-transparent text-notice hover:bg-surface-2',
      },
      size: {
        default: 'min-h-12 px-5 py-2',
        sm: 'min-h-12 px-4 py-1.5 text-caption',
        lg: 'min-h-14 px-6 py-3 text-lead',
        icon: 'size-12',
        block: 'min-h-12 w-full px-5 py-2',
        inline: 'min-h-12 px-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  type,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // Buttons inside forms should never submit by accident.
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
