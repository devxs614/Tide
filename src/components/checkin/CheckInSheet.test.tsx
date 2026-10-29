// Flow tests 1–4 from the spec (Section 16.2), plus the details of step 2:
// the two-word limit, "None of these", and the leave confirmation.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/lib/db';
import { useCheckInSheet } from '@/lib/ui';
import { CrisisScreen } from '@/components/safety/CrisisScreen';
import { aiCalls, mockAi, navigation, renderApp, resetApp, tabTo } from '@/test/utils';
import { CheckInSheet } from './CheckInSheet';

const DEMO_TEXT = 'Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.';
const AI_WORDS = {
  candidates: [
    { id: 'drained', definition: 'Low battery; starting anything feels like a lot', energy: -3, pleasantness: -3 },
    { id: 'frustrated', definition: 'Blocked from something you want to get done', energy: 1, pleasantness: -3 },
    { id: 'overwhelmed', definition: 'The task feels too big to hold at once', energy: 2, pleasantness: -4 },
  ],
  followUpQuestion: "Is it more that you're tired, or that the report feels too big?",
  safetyFlag: false,
};

function Harness() {
  const { openCheckIn } = useCheckInSheet();
  return (
    <>
      <button type="button" onClick={openCheckIn}>
        Open check-in
      </button>
      <CheckInSheet />
    </>
  );
}

async function openAndType(text: string) {
  const { user } = await renderApp(<Harness />);
  await user.click(await screen.findByRole('button', { name: 'Open check-in' }));
  await user.type(await screen.findByLabelText('In your own words'), text);
  return user;
}

beforeEach(async () => {
  await resetApp();
});
afterEach(() => vi.unstubAllGlobals());

describe('check-in flows', () => {
  it('flow 1: words → three candidates → pick two → saves an Ebb check-in', async () => {
    mockAi({ label: () => AI_WORDS });
    const user = await openAndType(DEMO_TEXT);
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const cards = await screen.findAllByRole('checkbox');
    expect(cards).toHaveLength(3);
    // The AI never preselects anything.
    cards.forEach((c) => expect(c).toHaveAttribute('aria-checked', 'false'));
    expect(screen.getByText(AI_WORDS.followUpQuestion)).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /^Drained/ }));
    await user.click(screen.getByRole('checkbox', { name: /^Frustrated/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Skip' }));
    await user.click(await screen.findByRole('button', { name: /Keep my plan/ }));

    await waitFor(async () => expect(await db.checkins.count()).toBe(1));
    const [saved] = await db.checkins.toArray();
    expect(saved.quadrant).toBe('ebb');
    expect(saved.emotions).toEqual(['drained', 'frustrated']);
    expect(saved.text).toBe(DEMO_TEXT);
    expect(saved.need).toBe('keep');
    expect(saved.aiUsed).toBe(true);
    expect(await screen.findByText('Checked in · Ebb')).toBeInTheDocument();
  });

  it('flow 2: no words → body cues → candidates → saved with bodyCues', async () => {
    const fetchMock = mockAi({ label: () => AI_WORDS });
    const { user } = await renderApp(<Harness />);
    await user.click(await screen.findByRole('button', { name: 'Open check-in' }));
    await user.click(await screen.findByRole('button', { name: "I don't have words right now" }));
    await user.click(screen.getByRole('button', { name: 'Chest' }));
    await user.click(screen.getByRole('button', { name: 'Tight' }));
    await user.click(screen.getByRole('button', { name: 'Show me some words' }));

    await user.click(await screen.findByRole('checkbox', { name: /^Overwhelmed/ }));
    const sent = aiCalls(fetchMock, 'label')[0] as { bodyCues: string[]; text?: string };
    expect(sent.bodyCues).toContain('chest:tight');
    expect(sent.text).toBeUndefined();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: /Regulate first/ }));

    await waitFor(async () => expect(await db.checkins.count()).toBe(1));
    const [saved] = await db.checkins.toArray();
    expect(saved.bodyCues).toContain('chest:tight');
    expect(saved.emotions).toEqual(['overwhelmed']);
    expect(saved.quadrant).toBe('surge');
    expect(navigation.push).toHaveBeenCalledWith('/toolkit');
  });

  it('flow 3: a crisis phrase makes no AI call, saves no text and opens the crisis screen', async () => {
    const fetchMock = mockAi({ label: () => AI_WORDS });
    const user = await openAndType('honestly I want to die');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith('/support?crisis=1'));
    expect(aiCalls(fetchMock, 'label')).toHaveLength(0);
    const [saved] = await db.checkins.toArray();
    expect(saved.safetyTriggered).toBe(true);
    expect(saved.text).toBeUndefined();

    await renderApp(<CrisisScreen />);
    expect(await screen.findByRole('heading', { name: 'It sounds like things are really hard right now.' })).toBeInTheDocument();
  });

  it('flow 4: with AI off, fallback words appear with no network call', async () => {
    await resetApp({ aiEnabled: false });
    const fetchMock = mockAi({ label: () => AI_WORDS });
    const user = await openAndType(DEMO_TEXT);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('checkbox', { name: /^Drained/ })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows two picks at most and says so kindly', async () => {
    mockAi({ label: () => AI_WORDS });
    const user = await openAndType(DEMO_TEXT);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('checkbox', { name: /^Drained/ }));
    await user.click(screen.getByRole('checkbox', { name: /^Frustrated/ }));
    await user.click(screen.getByRole('checkbox', { name: /^Overwhelmed/ }));
    expect(await screen.findByText('You can pick up to two.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /^Overwhelmed/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('"None of these" lists all words by state and accepts a word of her own', async () => {
    mockAi({ label: () => AI_WORDS });
    const user = await openAndType(DEMO_TEXT);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'None of these' }));
    const ebb = screen.getByRole('region', { name: /Ebb/ });
    expect(within(ebb).getAllByRole('button')).toHaveLength(12);
    await user.click(within(ebb).getByRole('button', { name: 'Foggy' }));
    await user.type(screen.getByLabelText('Add my own word'), 'fizzy{Enter}');
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(await screen.findByText(/Selected: Foggy, fizzy/)).toBeInTheDocument();
  });

  it('asks before throwing away typed words on Escape', async () => {
    mockAi({});
    const user = await openAndType('heavy day');
    await user.keyboard('{Escape}');
    expect(await screen.findByRole('heading', { name: 'Leave without saving?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('In your own words')).toHaveValue('heavy day');
  });

  it('can be completed with the keyboard alone', async () => {
    mockAi({ label: () => AI_WORDS });
    const { user } = await renderApp(<Harness />);
    (await screen.findByRole('button', { name: 'Open check-in' })).focus();
    await user.keyboard('{Enter}');
    await screen.findByLabelText('In your own words');
    await tabTo(user, 'In your own words');
    await user.keyboard('Heavy and annoyed');
    await tabTo(user, 'Next');
    await user.keyboard('{Enter}');
    await screen.findAllByRole('checkbox');
    await tabTo(user, /^Drained/);
    await user.keyboard(' ');
    await tabTo(user, 'Next');
    await user.keyboard('{Enter}');
    await tabTo(user, 'Skip');
    await user.keyboard('{Enter}');
    await tabTo(user, /Keep my plan/);
    await user.keyboard('{Enter}');
    await waitFor(async () => expect(await db.checkins.count()).toBe(1));
  });
});
