// Flow test 7 from the v2 spec (21.3): with a companion, typing in the
// check-in makes it listen, and saving makes the companion on Today react to
// the quadrant (Ebb: soft, with a lean). Also: someone who hasn't chosen a
// companion sees the v1 check-in, with no companion at all.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { useCheckInSheet } from '@/lib/ui';
import { TodayHeader } from '@/components/today/TodayHeader';
import { mockAi, renderApp, resetApp } from '@/test/utils';
import { CheckInSheet } from './CheckInSheet';

const AI_WORDS = {
  candidates: [
    { id: 'drained', definition: 'Low battery; starting anything feels like a lot', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked from something you want to get done', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'The task feels too big to hold at once', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: 'Is it more that you are tired, or that the report feels too big?',
  safetyFlag: false,
};

function Harness() {
  const { openCheckIn } = useCheckInSheet();
  return (
    <>
      <TodayHeader nowTs={Date.parse('2026-10-29T10:00:00')} />
      <button type="button" onClick={openCheckIn}>
        Open check-in
      </button>
      <CheckInSheet />
    </>
  );
}

// The companion's figure carries its expression as data-expression.
const figure = (placement: string) =>
  document.querySelector<SVGElement>(`[data-companion-placement="${placement}"] svg[data-companion]`);

afterEach(() => vi.unstubAllGlobals());

describe('check-in with a companion', () => {
  beforeEach(async () => {
    await resetApp({ 'companion.species': 'otter' });
  });

  it('listens while Maya types, then Today reacts to an Ebb check-in', async () => {
    mockAi({ label: () => AI_WORDS });
    const { user } = await renderApp(<Harness />);
    await user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await waitFor(() => expect(figure('checkin')).not.toBeNull());

    await user.type(await screen.findByLabelText('In your own words'), 'Lab report due tomorrow. Heavy.');
    expect(figure('checkin')).toHaveAttribute('data-expression', 'listening');
    // 400ms after the last key it stops listening.
    await waitFor(() => expect(figure('checkin')).toHaveAttribute('data-expression', 'idle'), { timeout: 1500 });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('checkbox', { name: /^Drained/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Skip' }));
    await user.click(await screen.findByRole('button', { name: /Keep my plan/ }));

    await waitFor(async () => expect(await db.checkins.count()).toBe(1));
    await waitFor(() => expect(figure('today')).toHaveAttribute('data-expression', 'soft'));
    expect(figure('today')).toHaveAttribute('data-reaction', 'lean');
  });
});

describe('check-in before choosing a companion', () => {
  it('shows no companion and no wave, exactly like v1', async () => {
    await resetApp();
    const { user } = await renderApp(<Harness />);
    await user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await screen.findByLabelText('In your own words');
    // Scoped to the sheet and the header: a toast left over from the test
    // above lives in the shared toast area.
    const sheet = screen.getByRole('dialog');
    expect(sheet.querySelector('[data-companion-placement], .none-companion')).toBeNull();
    expect(within(sheet).queryByRole('img', { name: /looking/ })).toBeNull();
    expect(document.querySelector('[data-companion-placement="today"]')).toBeNull();
  });
});
