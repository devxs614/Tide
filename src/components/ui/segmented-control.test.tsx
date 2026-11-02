// Big text and narrow tracks (v2.1 F-02): when a label no longer fits its
// segment, the control becomes a vertical list of the same radio buttons;
// a switch row stacks under a narrow container. jsdom has no layout, so the
// measurements are stood in by hand.
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { SegmentedControl } from './segmented-control';
import { SwitchRow } from './switch';

let notify: () => void = () => {};
class FakeObserver {
  constructor(cb: () => void) {
    notify = cb;
  }
  observe() {}
  disconnect() {}
}

function Picker() {
  const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
  return (
    <SegmentedControl
      label="Spacing"
      value={value}
      onChange={setValue}
      options={[
        { value: 'a', label: 'Comfortable' },
        { value: 'b', label: 'Compact' },
        { value: 'c', label: 'Roomy' },
      ]}
    />
  );
}

afterEach(() => vi.restoreAllMocks());

describe('SegmentedControl at big text', () => {
  it('stacks into a vertical list when a label overflows, keeping the radios', async () => {
    vi.stubGlobal('ResizeObserver', FakeObserver);
    await resetApp({ textScale: 1.5 });
    await renderApp(<Picker />);
    const group = await screen.findByRole('radiogroup', { name: 'Spacing' });
    expect(group).not.toHaveAttribute('data-stacked');
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(140);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(90);
    act(() => notify());
    expect(group).toHaveAttribute('data-stacked', 'true');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Comfortable' })).toHaveAttribute('aria-checked', 'true');
    vi.unstubAllGlobals();
  });

  it('lets a switch row stack under a narrow container', async () => {
    await resetApp();
    await renderApp(<SwitchRow id="x" label="Bold text" checked={false} onCheckedChange={() => {}} />);
    const row = (await screen.findByText('Bold text')).closest('[data-setting-row]')!;
    expect(row.parentElement).toHaveClass('@container');
    expect(row.className).toContain('@max-[18em]:flex-col');
  });
});
