// Accessibility audit for the v2 screens (Phase V11). Each new flow is
// rendered in the real providers and checked with axe-core: names on every
// control, valid ARIA, headings, labels, lists, landmarks inside sheets.
// Color contrast is off here because jsdom can't compute colors; every
// theme's text pairs are checked separately in lib/theme/__tests__.
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { CompanionStudio } from '@/components/companion/studio/CompanionStudio';
import { ShoreScreen } from '@/components/shore/ShoreScreen';
import { CollectionScreen } from '@/components/shore/CollectionScreen';
import { WrapScreen } from '@/components/wrap/WrapScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { SectionPage } from '@/components/settings/SectionPage';
import { SECTIONS } from '@/lib/settings/catalog';
import { copy } from '@/copy/en';
import { DemoLauncher } from '@/demo/DemoLauncher';
import { WhatsNewSheet } from '@/components/whatsnew/WhatsNewSheet';
import { ShortcutsSheet } from '@/components/shell/ShortcutsSheet';
import { ScreenHelpSheet } from '@/components/shell/ScreenHelpSheet';
import { BottleWriteSheet } from '@/components/shore/BottleWriteSheet';
import { DirectorHUD } from '@/demo/director/DirectorHUD';
import type { DirectorState } from '@/demo/director/engine';

const HUD_STATE: DirectorState = {
  script: null,
  mode: 'full',
  presenter: false,
  running: true,
  paused: false,
  done: false,
  index: 2,
  speed: 1,
  captions: true,
  narration: false,
  caption: 'Maya checks in.',
  chapterTitle: 'Check-in',
  target: null,
  log: [],
};

async function violations(): Promise<string[]> {
  const result = await axe.run(document.body, {
    rules: {
      'color-contrast': { enabled: false },
      // A single component is rendered, not a whole page.
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
      'landmark-one-main': { enabled: false },
    },
  });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

const SCREENS: Array<[string, () => ReactElement, string | RegExp]> = [
  ['onboarding', () => <OnboardingScreen />, /Welcome/],
  // "About" is the last section, so the whole studio is on the page.
  ['companion studio', () => <CompanionStudio />, 'About'],
  ['shore', () => <ShoreScreen />, 'Collection'],
  ['collection', () => <CollectionScreen />, 'Collection'],
  ['close the day', () => <WrapScreen />, /day/i],
  ['settings index', () => <SettingsScreen />, 'Appearance'],
  // Every Settings page, each found by its own title.
  ...SECTIONS.map(({ id }): [string, () => ReactElement, string] => [`settings: ${id}`, () => <SectionPage id={id} />, copy.set.sections[id]]),
  ['demo launcher', () => <DemoLauncher />, /Full tour/],
  ["what's new", () => <WhatsNewSheet asPage />, /What's new/],
  ['shortcuts sheet', () => <ShortcutsSheet open onOpenChange={() => {}} />, 'Check in'],
  ['screen help', () => <ScreenHelpSheet pathname="/" open onOpenChange={() => {}} />, /Today shows/],
  ['bottle', () => <BottleWriteSheet open onClose={() => {}} />, /bottle|future/i],
  ['demo controls', () => <DirectorHUD state={HUD_STATE} />, 'Maya checks in.'],
];

describe('accessibility audit (axe)', () => {
  it.each(SCREENS)('%s has no violations', async (_name, ui, ready) => {
    await resetApp({ onboarded: _name !== 'onboarding', 'companion.species': 'otter', 'whatsNew.seen': true });
    await renderApp(ui());
    await screen.findAllByText(ready);
    expect(await violations()).toEqual([]);
  });
});

describe('focus in step-by-step flows', () => {
  it("Close the day moves focus to each step's heading", async () => {
    await resetApp({ 'whatsNew.seen': true });
    await renderApp(<WrapScreen />);
    const heading = await screen.findByRole('heading', { level: 1 });
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });
});
