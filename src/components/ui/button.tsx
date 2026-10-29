// Tide's button, in the v2 "3D" style (v2 spec 4.4): a solid ledge under it
// that collapses when pressed, a rounded display font, and a label that is
// always visible. Every v1 variant and size name still works, so no caller
// had to change. Every size keeps a 48px touch target, labels wrap instead of
// overflowing at 150% text, and there is no red "destructive" style.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { Quadrant } from '@/lib/types';
import { Slot } from 'radix-ui';

const FILLED = 'bg-primary text-on-primary [--ledge-color:var(--primary-shadow)]';

const buttonVariants = cva(
  'press-3d relative inline-flex items-center justify-center gap-2 rounded-full border-2 border-transparent text-center font-display text-[0.9412rem] font-extrabold leading-tight whitespace-normal select-none disabled:pointer-events-none disabled:border-transparent disabled:bg-surface-2 disabled:text-ink-soft disabled:[--ledge-color:transparent] aria-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[2.5] [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        default: FILLED,
        primary: FILLED,
        secondary: 'border-line bg-surface text-ink [--ledge-color:var(--line)]',
        accent: 'bg-accent text-on-accent [--ledge-color:var(--accent-shadow)]',
        outline: 'border-primary bg-surface text-primary [--ledge-color:var(--primary-shadow)]',
        // Ghost-like buttons have no ledge, so they don't move when pressed.
        ghost: 'text-primary [--press-depth:0px] hover:bg-surface-2',
        quiet: 'text-ink-soft [--press-depth:0px] hover:bg-surface-2 hover:text-ink',
        link: 'rounded-md px-1 text-primary underline underline-offset-4 [--press-depth:0px] hover:no-underline',
        // A careful action (Delete everything): the neutral notice color.
        notice: 'border-notice bg-surface text-notice [--ledge-color:var(--notice)]',
        quadrant: 'bg-[var(--btn-tint)] text-ink [--ledge-color:var(--btn-base)]',
      },
      size: {
        default: 'min-h-12 px-5 py-2',
        md: 'min-h-12 px-5 py-2',
        sm: 'min-h-12 px-4 py-1.5 text-small',
        lg: 'min-h-14 px-6 py-3 text-[1.0588rem] tracking-[0.02em] [--press-depth:6px]',
        icon: 'size-12',
        block: 'min-h-14 w-full px-5 py-2 text-[1.0588rem] tracking-[0.02em] [--press-depth:5px]',
        inline: 'min-h-12 px-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Three dots that wave while something loads. The label stays in place
// (invisible) so the button keeps its width and nothing jumps around.
function LoadingDots() {
  return (
    <span aria-hidden className="absolute inset-0 flex items-center justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="loading-dot size-1.5 rounded-full bg-current" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </span>
  );
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  quadrant,
  type,
  style,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    // For variant="quadrant": the state whose tint fills the button.
    quadrant?: Quadrant;
  }) {
  const Comp = asChild ? Slot.Root : 'button';
  const tint = quadrant
    ? ({ '--btn-tint': `var(--tint-${quadrant})`, '--btn-base': `var(--q-${quadrant})` } as React.CSSProperties)
    : undefined;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // Buttons inside forms should never submit by accident.
      type={asChild ? undefined : (type ?? 'button')}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      style={tint ? { ...tint, ...style } : style}
      {...props}
    >
      {asChild ? (
        children
      ) : loading ? (
        <>
          <span className="invisible contents">{children}</span>
          <LoadingDots />
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
