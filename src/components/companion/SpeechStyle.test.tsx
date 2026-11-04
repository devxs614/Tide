// v2.3 Item 3: where the companion's words go. With captions they show in a
// bar in the page's flow (never floating over anything); with "No speech"
// nothing shows by itself, but the last line is one tap away on the top
// bar's head; a page bubble steps aside when a sheet opens; and the avoid
// middleware moves a bubble off the timer, or reports that it can't (then
// the line goes to the caption bar; the layout audit checks that in a real
// browser, since jsdom has no layout).
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { Middleware, MiddlewareState } from '@floating-ui/react-dom';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { TopBar } from '@/components/shell/TopBar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { avoidElements, type AvoidData } from '@/lib/overlay/avoidElements';
import { recentLine } from '@/lib/companion/speech';
import { CompanionSay } from './CompanionSay';

const LINE = 'Small steps still count.';

function Speaker({ onDone }: { onDone?: () => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <button ref={setAnchor} type="button">
        companion
      </button>
      <CompanionSay text={LINE} lineKey={1} anchor={anchor} onDone={onDone} />
    </>
  );
}

describe('speech styles', () => {
  it('captions: the line shows in the bar, in the flow, and not as a bubble', async () => {
    await resetApp({ 'companion.speechStyle': 'captions' });
    await renderApp(
      <PhoneFrame>
        <main>
          <Speaker />
        </main>
      </PhoneFrame>,
    );
    const caption = await screen.findByText(LINE);
    const bar = caption.closest('[data-companion-caption]')!;
    expect(bar).toBeInTheDocument();
    expect(document.querySelector('[data-companion-bubble]')).toBeNull();
    // In the page's flow, before the content, so it pushes it down.
    expect(bar.parentElement!.className).toContain('sticky');
    expect(bar.compareDocumentPosition(document.querySelector('main')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('no speech: nothing shows by itself, and the top bar head brings the last line back', async () => {
    await resetApp({ 'companion.speechStyle': 'off', 'companion.species': 'axolotl' });
    navigation.pathname = '/tasks';
    const { user } = await renderApp(
      <PhoneFrame captions={false}>
        <TopBar title="Tasks" />
        <Speaker />
      </PhoneFrame>,
    );
    await waitFor(() => expect(recentLine()?.text).toBe(LINE));
    expect(screen.queryByText(LINE)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /What did .+ say\?/ }));
    expect(await screen.findByText(LINE)).toBeInTheDocument();
  });

  it('a page bubble steps aside when a sheet opens', async () => {
    await resetApp();
    let done = 0;
    function Page() {
      const [open, setOpen] = useState(false);
      return (
        <PhoneFrame>
          <Speaker onDone={() => done++} />
          <button type="button" onClick={() => setOpen(true)}>
            open
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              <SheetTitle>Sheet</SheetTitle>
            </SheetContent>
          </Sheet>
        </PhoneFrame>
      );
    }
    const { user } = await renderApp(<Page />);
    await screen.findByText(LINE);
    await user.click(screen.getByRole('button', { name: 'open' }));
    await waitFor(() => expect(done).toBeGreaterThan(0));
  });
});

describe('avoidElements', () => {
  // Floating UI's state, trimmed to what the middleware reads.
  const state = (placement: MiddlewareState['placement'], tried: string[] = []) =>
    ({
      x: 0,
      y: 0,
      placement,
      strategy: 'fixed',
      rects: { floating: { width: 200, height: 60, x: 0, y: 0 }, reference: { width: 40, height: 40, x: 0, y: 0 } },
      elements: { floating: document.createElement('div'), reference: document.createElement('div') },
      middlewareData: { avoidElements: { tried, collided: false } },
    }) as unknown as MiddlewareState;

  const timer = () => {
    const el = document.createElement('div');
    el.setAttribute('data-bubble-avoid', '');
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400, x: 0, y: 0, toJSON: () => ({}) });
    document.body.appendChild(el);
    return el;
  };

  it('tries another side when the bubble would cover the timer, and reports when every side does', async () => {
    const el = timer();
    const mw: Middleware = avoidElements(document.createElement('div'));
    const first = await mw.fn(state('top'));
    expect(first.reset).toEqual({ placement: 'bottom' });
    const all = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start'];
    const last = await mw.fn(state('bottom-end', all));
    expect((last.data as AvoidData).collided).toBe(true);
    el.remove();
  });

  it('leaves the placement alone when nothing is in the way', async () => {
    const out = await avoidElements(document.createElement('div')).fn(state('top'));
    expect(out.reset).toBeUndefined();
    expect((out.data as AvoidData).collided).toBe(false);
  });
});
