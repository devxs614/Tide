'use client';

// "Which events?" for a weekly series (v2.1 F-04): only this one, this and
// the ones after it, or all of them. Edit and Delete both use it; the
// caller decides which choices make sense (a new date can only move this
// one event; new weekdays only apply from here on).
import type { ReactNode } from 'react';
import type { SeriesScope } from '@/lib/repo/eventEdits';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface ScopeChoice {
  scope: SeriesScope;
  label: string;
  demoId?: string;
}

export function ScopeDialog({
  title,
  body,
  choices,
  destructive = false,
  cancelLabel,
  onPick,
  onCancel,
  children,
}: {
  title: string;
  body: string;
  choices: ScopeChoice[];
  // Deleting uses the calm notice style and puts focus on "Keep it".
  destructive?: boolean;
  cancelLabel: string;
  onPick: (scope: SeriesScope) => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const cancel = (
    <Button variant={destructive ? 'default' : 'quiet'} onClick={onCancel} autoFocus={destructive}>
      {cancelLabel}
    </Button>
  );
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="pr-0">
          <DialogTitle className="break-words">{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        {children}
        {/* One column at every width: the choices are sentences. When
            deleting, "Keep it" comes first, as in the task delete dialog. */}
        <DialogFooter className="flex-col sm:flex-col">
          {destructive && cancel}
          {choices.map((c) => (
            <Button key={c.scope} variant={destructive ? 'notice' : 'secondary'} onClick={() => onPick(c.scope)} data-demo-id={c.demoId}>
              {c.label}
            </Button>
          ))}
          {!destructive && cancel}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
