// Count back (v2.1 F-13): reveal by default (7 from 100, as in v2), typing
// with a gentle "Close" that carries on, a short run from 20 that ends with
// the breathing line and the re-check, and the title following the step.
import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { StrategyRunner } from '../StrategyRunner';

beforeEach(async () => {
  await resetApp();
});

describe('count back', () => {
  it('reveals 93 after 100 by default', async () => {
    const { user } = await renderApp(<StrategyRunner id="t-count-7" context="toolkit" />);
    expect(await screen.findByRole('heading', { name: 'Count back by 7' })).toBeInTheDocument();
    // Waits too: under a busy full run the count can render a tick after
    // the heading, and a plain getBy failed now and then.
    expect(await screen.findByText('0 of 10')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Now: 93')).toBeInTheDocument();
    expect(screen.getByText('1 of 10')).toBeInTheDocument();
  });

  it('typing a near miss gives the number and goes on, never "wrong"', async () => {
    const { user } = await renderApp(<StrategyRunner id="t-count-7" context="toolkit" />);
    await user.click(await screen.findByRole('radio', { name: 'Type it' }));
    await user.type(screen.getByLabelText('The next number'), '92{Enter}');
    expect(await screen.findByText("Close. It's 93. Keep going from there.")).toBeInTheDocument();
    await user.type(screen.getByLabelText('The next number'), '86{Enter}');
    expect(await screen.findByText('Yes, 86.')).toBeInTheDocument();
    expect(screen.queryByText(/wrong/i)).not.toBeInTheDocument();
  });

  it('a short run ends with the breathing line, then the re-check', async () => {
    const { user } = await renderApp(<StrategyRunner id="t-count-7" context="toolkit" />);
    await user.click(await screen.findByRole('button', { name: 'By 3' }));
    expect(await screen.findByRole('heading', { name: 'Count back by 3' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'From 20' }));
    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Done. Notice your breathing for a moment.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('button', { name: 'Better' })).toBeInTheDocument();
  });
});
