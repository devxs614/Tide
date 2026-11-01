'use client';

// Tooltips for the few controls that show only an icon (v2 spec 17.8): the
// demo HUD's play and skip buttons, the voice sample buttons, the companion
// arrows. Radix opens them on mouse hover and keyboard focus after 500ms and
// never on touch, so phones are unaffected. The control's accessible name
// still comes from its own aria-label, so screen readers lose nothing when
// the tooltip isn't showing.
import { useState, type ReactElement } from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { overlayRootFor } from '@/lib/overlay/overlayRoot';

export function WithTooltip({ label, children }: { label: string; children: ReactElement }) {
  // Tooltips draw in the layer of the control they belong to (the demo
  // controls, a sheet), so a higher layer can't hide them (v2.1 spec 5.4).
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  return (
    <TooltipPrimitive.Provider delayDuration={500}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger ref={setTrigger} asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={trigger ? overlayRootFor(trigger) : undefined}>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-(--z-bubble) rounded-input bg-ink px-2 py-1 text-caption font-bold text-surface data-open:animate-in data-open:fade-in-0"
          >
            {label}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
