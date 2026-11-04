// The companion's speech bubble after v2.1 F-01: it escapes any box that
// clips (it's portaled to the overlay layer, or into the sheet it belongs
// to), stays up long enough to read at any text size, only one shows at a
// time, and a tapped or pinned bubble has a close button and takes Escape.
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { CompanionSay, visibleMs } from './CompanionSay';
import { PhoneFrame } from '@/components/shell/PhoneFrame';

const LONG = 'Choose why the task is hard. Then I will suggest one first step.';

function Speaker({ text = LONG, lineKey = 1, tapped = false, onDone }: { text?: string; lineKey?: number; tapped?: boolean; onDone?: () => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <button ref={setAnchor} type="button">
        companion
      </button>
      <CompanionSay text={text} lineKey={lineKey} anchor={anchor} tapped={tapped} onDone={onDone} />
    </>
  );
}

describe('CompanionSay', () => {
  // v2.3 Item 3: the overlay layer moved from the end of <body> into the
  // app frame, so a bubble can't float past the "phone" on a laptop.
  it("portals out of a box that clips and transforms, into the frame's own layer", async () => {
    await resetApp();
    await renderApp(
      <PhoneFrame>
        <div data-testid="box" style={{ overflow: 'hidden', transform: 'translateX(0)' }}>
          <Speaker />
        </div>
      </PhoneFrame>,
    );
    const bubble = (await screen.findByText(LONG)).closest('[data-companion-bubble]')!;
    expect(screen.getByTestId('box').contains(bubble)).toBe(false);
    const layer = document.getElementById('tide-overlays')!;
    expect(layer.contains(bubble)).toBe(true);
    expect(layer.parentElement).toHaveAttribute('data-app-frame');
  });

  it('stays inside the sheet it belongs to', async () => {
    await resetApp();
    await renderApp(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Check in</SheetTitle>
          <Speaker />
        </SheetContent>
      </Sheet>,
    );
    const bubble = (await screen.findByText(LONG)).closest('[data-companion-bubble]')!;
    expect(bubble.closest('[data-slot="sheet-content"]')).not.toBeNull();
  });

  it('stays long enough to read, longer at bigger text', () => {
    expect(visibleMs('Hi')).toBe(3500);
    // 13 words: 13 × 0.45s + 1.5s = 7.35s at normal size, 10.275s at 150%.
    expect(visibleMs(LONG)).toBe(13 * 450 + 1500);
    expect(visibleMs(LONG, 1.5)).toBe(13 * 450 * 1.5 + 1500);
  });

  it('shows one bubble at a time: the newest line wins', async () => {
    await resetApp();
    await renderApp(
      <>
        <Speaker text="First line here." />
        <Speaker text="Second line here." />
      </>,
    );
    await screen.findByText('Second line here.');
    expect(screen.queryByText('First line here.')).not.toBeInTheDocument();
  });

  it('gives a tapped bubble a close button and closes on Escape', async () => {
    await resetApp();
    let closed = 0;
    await renderApp(<Speaker tapped onDone={() => closed++} />);
    const close = await screen.findByRole('button', { name: 'Close message' });
    fireEvent.click(close);
    expect(closed).toBe(1);
    act(() => void window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    await waitFor(() => expect(closed).toBe(2));
  });
});
