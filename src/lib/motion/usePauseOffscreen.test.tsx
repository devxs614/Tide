// Loops rest off screen and in hidden tabs (v2 spec 5.6). jsdom has no
// layout, so the IntersectionObserver is a stand-in we can drive by hand.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { usePauseOffscreen } from './usePauseOffscreen';

let report: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};

class FakeObserver {
  constructor(cb: typeof report) {
    report = cb;
  }
  observe() {}
  disconnect() {}
}

function Loop() {
  const ref = usePauseOffscreen<HTMLDivElement>();
  return <div ref={ref} data-testid="loop" />;
}

afterEach(() => vi.unstubAllGlobals());

describe('usePauseOffscreen', () => {
  it('pauses off screen and in a hidden tab, and resumes after', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { getByTestId } = render(<Loop />);
    const el = getByTestId('loop');
    act(() => report([{ isIntersecting: false }]));
    expect(el).toHaveAttribute('data-paused');
    act(() => report([{ isIntersecting: true }]));
    expect(el).not.toHaveAttribute('data-paused');

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    expect(el).toHaveAttribute('data-paused');
    visibility.mockReturnValue('visible');
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    expect(el).not.toHaveAttribute('data-paused');
  });
});
