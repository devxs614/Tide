// Nobody is trapped in a flow (v2.1 F-08, spec 12.6): every flow in the
// spec's table renders a Back (`data-nav="back"`) and/or a Cancel
// (`data-nav="cancel"`) control. A static check of the sources, so a later
// edit that drops one fails here. Every sheet gets its Cancel (the Close
// row) from components/ui/sheet.tsx.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(__dirname, '..');
const read = (file: string) => fs.readFileSync(path.join(SRC, file), 'utf8');

const BACK = [
  'components/checkin/BodyPath.tsx',
  'components/checkin/StepHearing.tsx',
  'components/checkin/AllWords.tsx',
  'components/checkin/StepBehind.tsx',
  'components/checkin/StepNeed.tsx',
  'components/tasks/UnstickStep.tsx',
  'components/today/DayModeProposal.tsx',
  'components/toolkit/tools/Grounding54321.tsx',
  'components/wrap/WrapScreen.tsx',
  'components/onboarding/OnboardingScreen.tsx',
  'components/companion/studio/CompanionStudio.tsx',
  'components/settings/SectionPage.tsx',
  'components/shore/CollectionScreen.tsx',
  'components/tasks/CompletedArchive.tsx',
];

const CANCEL = [
  'components/ui/sheet.tsx',
  'components/toolkit/RunnerCancel.tsx',
  'components/bridge/BridgeSteps.tsx',
  'components/wrap/WrapScreen.tsx',
];

describe('every flow has a way back and a way out', () => {
  it.each(BACK)('%s has Back', (file) => {
    expect(read(file)).toContain('data-nav="back"');
  });

  it.each(CANCEL)('%s has Cancel', (file) => {
    expect(read(file)).toContain('data-nav="cancel"');
  });

  it('runs Cancel in the strategy runner', () => {
    expect(read('components/toolkit/StrategyRunner.tsx')).toContain('<RunnerCancel');
  });
});
