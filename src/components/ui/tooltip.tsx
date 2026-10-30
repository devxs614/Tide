'use client';

// Tooltips for the few controls that show only an icon (v2 spec 17.8): the
// demo HUD's play and skip buttons, the voice sample buttons, the companion
// arrows. Radix opens them on mouse hover and keyboard focus after 500ms and
// never on touch, so phones are unaffected. The control's accessible name
// still comes from its own aria-label, so screen readers lose nothing when
// the tooltip isn't showing.
import type { ReactElement } from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

export function WithTooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <TooltipPrimitive.Provider delayDuration={500}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-[80] rounded-input bg-ink px-2 py-1 text-caption font-bold text-surface data-open:animate-in data-open:fade-in-0"
          >
            {label}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
