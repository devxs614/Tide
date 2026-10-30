// The companion never appears on the crisis screen (v2 spec 2.4, 9): not in
// the page, not in the top bar. The everyday support page may show a small
// soft one, because Maya allowed it there.
import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { TopBar } from '@/components/shell/TopBar';
import { navigation, renderApp, resetApp } from '@/test/utils';
import { CrisisScreen } from './CrisisScreen';
import { SupportScreen } from './SupportScreen';

beforeEach(async () => {
  await resetApp({ 'companion.species': 'capybara' });
  navigation.pathname = '/support';
});

describe('companions and support', () => {
  it('never shows a companion on the crisis screen or its top bar', async () => {
    await renderApp(
      <>
        <TopBar title="Talk to a person" />
        <CrisisScreen />
      </>,
    );
    await screen.findByRole('heading', { level: 1 });
    // Give any lazily loaded drawing time to arrive before checking.
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('svg[data-companion], [data-companion-placement], .none-companion')).toBeNull();
  });

  it('shows a small soft companion on the everyday support page', async () => {
    await renderApp(<SupportScreen />);
    await waitFor(() =>
      expect(document.querySelector('[data-companion-placement="support"] svg[data-companion]')).toHaveAttribute('data-expression', 'soft'),
    );
  });
});
