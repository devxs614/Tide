// About Tide: what it is not (a medical service), where its ideas come from,
// and who built it. The team fills in their names before submission.
import { copy, fill } from '@/copy/en';
import { InstallButton } from '@/components/shell/InstallButton';
import { Section } from './Section';
import { settingsV1 } from '@/copy/settingsV1Copy';

export const APP_VERSION = '2.0.0';
export const REPO_URL = 'https://github.com/devxs614/Tide';

export function AboutSection() {
  return (
    <Section id="about" title={settingsV1.about}>
      <p className="rounded-card bg-surface-2 p-3">{copy.global.notMedical}</p>
      <p>{settingsV1.credits}</p>
      <p>{settingsV1.team}</p>
      <InstallButton />
      <p className="text-ink-soft">{fill(settingsV1.version, { v: APP_VERSION })}</p>
      <a href={REPO_URL} target="_blank" rel="noreferrer" className="self-start text-primary underline underline-offset-4">
        {settingsV1.repo}
      </a>
    </Section>
  );
}
