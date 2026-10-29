'use client';

// Tide's card (v2 spec 4.4): surface fill, a 2px border, a big radius and a
// solid ledge underneath. `interactive` cards press down like buttons;
// `selectable` ones show a check badge that pops in when chosen, so the
// selected state never depends on the border color alone.
import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedback } from '@/lib/sound/useFeedback';

type CardProps = React.ComponentProps<'div'> & { flat?: boolean };

export function Card({ className, flat = false, ...props }: CardProps) {
  return <div className={cn(flat ? 'card-flat' : 'card', 'p-4', className)} {...props} />;
}

type SelectableCardProps = React.ComponentProps<'button'> & {
  selected?: boolean;
};

// A card that is also a button: pressable, with an optional selected state.
export function CardButton({ className, selected, children, onClick, ...props }: SelectableCardProps) {
  const feedback = useFeedback();
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        feedback('select');
        onClick?.(e);
      }}
      className={cn(
        'press-3d card relative flex w-full flex-col gap-1 p-4 text-left [--ledge-color:var(--line)] hover:bg-surface-2',
        selected && 'border-primary [--ledge-color:var(--primary-shadow)]',
        className,
      )}
      {...props}
    >
      {children}
      {selected && (
        <span
          aria-hidden
          className="anim-pop absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-on-primary"
        >
          <Check className="size-4 stroke-[3]" />
        </span>
      )}
    </button>
  );
}
