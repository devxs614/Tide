// Browser back closes the top sheet (v2.1 F-08, spec 12.4): Back closes it
// and keeps the URL, it can be opened again, a "Leave?" question keeps it
// open, and closing it another way takes its history entry away again.
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

function Harness({ guard = false }: { guard?: boolean }) {
  const [open, setOpen] = useState(false);
  const [asked, setAsked] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <p>asked {asked}</p>
      <Sheet open={open} onOpenChange={(next) => (next ? undefined : guard ? setAsked((n) => n + 1) : setOpen(false))}>
        <SheetContent aria-describedby={undefined}>
          <SheetTitle>Test sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    </>
  );
}

const back = () => window.history.back();

describe('back to close', () => {
  it('closes on Back, keeps the URL, and opens again', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const url = window.location.href;
    const before = window.history.length;
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog', { name: 'Test sheet' })).toBeInTheDocument();
    back();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Test sheet' })).not.toBeInTheDocument());
    expect(window.location.href).toBe(url);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog', { name: 'Test sheet' })).toBeInTheDocument();
    back();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Test sheet' })).not.toBeInTheDocument());
    expect(window.history.length).toBeGreaterThanOrEqual(before);
  });

  it('stays open when the flow asks first, and Back asks again', async () => {
    const user = userEvent.setup();
    render(<Harness guard />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog', { name: 'Test sheet' });
    back();
    expect(await screen.findByText('asked 1')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Test sheet' })).toBeInTheDocument();
    back();
    expect(await screen.findByText('asked 2')).toBeInTheDocument();
  });
});
