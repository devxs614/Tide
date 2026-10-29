// The 100-second stage demo from Section 14.3, run against the real demo
// seed: check-in → Gentle plan → stuck lab report → bridge → patterns.
// It runs twice in a row with the network down (the saved demo answers carry
// it), and once with the AI answering live, the way the spec asks us to
// prove the demo is reliable.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { db } from '@/lib/db';
import { DEMO_JUMP_TIME, loadDemoData, setDemoTime } from '@/lib/repo/demo';
import { toISODate } from '@/lib/time';
import { DEMO_START } from '@/lib/clock';
import { AppShell } from '@/components/shell/AppShell';
import { TodayScreen } from '@/components/today/TodayScreen';
import { TasksScreen } from '@/components/tasks/TasksScreen';
import { PatternsScreen } from '@/components/patterns/PatternsScreen';
import { clearDrafts } from '@/components/bridge/bridgeDrafts';
import { clearSuggestions } from '@/components/tasks/unstickCache';
import { DEMO_CHECKIN_TEXT } from '@/data/demo/cachedResponses';
import { mockAi, navigation, renderApp, resetApp } from './utils';

async function screenIn(path: string, page: React.ReactElement): Promise<UserEvent> {
  cleanup();
  navigation.pathname = path;
  const { user } = await renderApp(<AppShell>{page}</AppShell>);
  return user;
}

async function runDemo(expect_: { label: string; step: string; plan: RegExp; patternTitle: string }) {
  clearDrafts();
  clearSuggestions();
  await resetApp();
  await loadDemoData();

  // 0:00 Check-in → 0:15 pick two words → Adjust my plan
  let user = await screenIn('/', <TodayScreen />);
  expect(await screen.findByRole('heading', { name: 'Good afternoon, Maya' })).toBeInTheDocument();
  expect(screen.getByText(/^Next: Calculus · 4:50 pm · in (69|70) min$/)).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Check in' }).at(-1)!);
  await user.type(await screen.findByLabelText('In your own words'), DEMO_CHECKIN_TEXT);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(await screen.findByRole('checkbox', { name: /^Drained/ }));
  expect(screen.getByRole('checkbox', { name: new RegExp(`^${expect_.label}`) })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: /^Frustrated/ }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(await screen.findByRole('button', { name: 'Skip' }));
  await user.click(await screen.findByRole('button', { name: /Adjust my plan/ }));

  // 0:25 Day Mode: Gentle → proposal → use it
  await user.click(await screen.findByRole('button', { name: /Gentle/ }));
  expect(await screen.findByText(expect_.plan)).toBeInTheDocument();
  const keep = screen.getByRole('region', { name: 'Keep today' });
  expect(within(keep).getByText('Chemistry lab report')).toBeInTheDocument();
  expect(within(keep).getByText('Email TA about lab data')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Use this plan' }));
  await waitFor(async () => expect(await db.dayPlans.get(toISODate(DEMO_START))).toBeTruthy());
  const [checkIn] = await db.checkins.where('ts').aboveOrEqual(DEMO_START - 60_000).toArray();
  expect(checkIn).toMatchObject({ quadrant: 'ebb', emotions: ['drained', 'frustrated'] });
  expect(await screen.findByText('Last Thursday felt like this too. You still finished: lab outline.')).toBeInTheDocument();

  // 0:40 Tasks: lab report → Stuck → "I don't know where to start"
  user = await screenIn('/tasks', <TasksScreen />);
  await user.click(await screen.findByRole('button', { name: 'In progress (1)' }));
  await user.click(screen.getByRole('button', { name: 'Move Chemistry lab report to another column' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Stuck' }));
  await user.click(await screen.findByRole('button', { name: "I don't know where to start" }));
  expect(await screen.findByText(expect_.step)).toBeInTheDocument();
  expect(screen.getByText('Before writing tasks, 3-minute walk helped you 4 of 5 times. Want to do that first?')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Not now' }));

  // 1:05 Rehearsal jump → Bridge card → Get ready
  await setDemoTime(DEMO_JUMP_TIME);
  user = await screenIn('/', <TodayScreen />);
  expect(await screen.findByText('Chemistry lab → Calculus · leave in 9 min')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Get ready' }));
  // The line shows on the card and again in the sheet.
  expect((await screen.findAllByText(/Switching from lab to class has felt hard 3 of the last 4 times\./)).length).toBeGreaterThan(0);
  expect(await screen.findByText('Box breathing')).toBeInTheDocument();
  expect(await screen.findByRole('checkbox', { name: 'Calculator' })).toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'Go to Room 4-203' })).toBeInTheDocument();
  expect(document.getElementById('parking-note')).toHaveValue('Chemistry lab report: ');

  // 1:25 Patterns → "Why am I seeing this?" on the walk card
  user = await screenIn('/patterns', <PatternsScreen />);
  const walk = (await screen.findByRole('heading', { name: expect_.patternTitle })).closest('article')!;
  expect(within(walk).getByText('4 of 5 times · Last 4 weeks')).toBeInTheDocument();
  expect(screen.getAllByRole('article')).toHaveLength(3);
  await user.click(within(walk).getByRole('button', { name: 'Why am I seeing this?' }));
  expect(within(walk).getAllByRole('listitem')).toHaveLength(5);
}

beforeEach(() => {
  navigation.pathname = '/';
});
afterEach(() => {
  vi.unstubAllGlobals();
  navigation.pathname = '/';
});

const CACHED = {
  label: 'Overwhelmed',
  step: 'Open the report and type only the title and date.',
  plan: /Keeping the lab report and the quick email to your TA/,
  patternTitle: 'A short walk helps you start writing',
};

describe('the scripted demo', () => {
  it('runs twice in a row with the network down, on the saved answers', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    await runDemo(CACHED);
    await runDemo(CACHED);
  }, 90_000);

  it('runs with the AI answering live', async () => {
    mockAi({
      label: () => ({
        candidates: [
          { id: 'drained', definition: 'Running on low', energy: -3, pleasantness: -3 },
          { id: 'frustrated', definition: 'Blocked and annoyed', energy: 1, pleasantness: -3 },
          { id: 'discouraged', definition: 'Losing belief it will work', energy: -2, pleasantness: -3 },
        ],
        followUpQuestion: 'Tired, or stuck on the report?',
        safetyFlag: false,
      }),
      daymode: (body) => {
        const input = body as { tasks: Array<{ id: string; title: string }> };
        const keep = input.tasks.filter((t) => ['Chemistry lab report', 'Email TA about lab data'].includes(t.title)).map((t) => t.id);
        return { keep, move: input.tasks.map((t) => t.id).filter((id) => !keep.includes(id)), rationale: 'Live: lab report and the TA email today.' };
      },
      unstick: () => ({ firstStep: 'Live: open the report and write the title.', focusMinutes: 5, strategyId: 'm-walk-3', why: 'Live reason.' }),
      bridge: () => ({ parkingPrompt: 'Where did you stop in the lab report?', strategyId: 'c-box', prepSteps: ['Calculator', 'Go to Room 4-203'] }),
      narrate: (body) => ({
        cards: (body as { patterns: Array<{ key: string }> }).patterns.map((p) => ({
          key: p.key,
          title: p.key.startsWith('strategyBefore') ? 'Live: walking helps you start' : `Live: ${p.key}`,
          body: 'In your data.',
          whyText: 'From your records.',
        })),
      }),
    });
    await runDemo({
      label: 'Discouraged',
      step: 'Live: open the report and write the title.',
      plan: /Live: lab report and the TA email today\./,
      patternTitle: 'Live: walking helps you start',
    });
  }, 60_000);
});
