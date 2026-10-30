// About Tide: what it is not (a medical service), where its ideas come from,
// and who built it. The team fills in their names before submission.
import { copy, fill } from '@/copy/en';
import { InstallButton } from '@/components/shell/InstallButton';
import { Section } from './Section';

export const APP_VERSION = '1.0.0';
export const REPO_URL = 'https://github.com/devxs614/Tide';

export function AboutSection() {
  return (
    <Section id="about" title={copy.settings.about}>
      <p className="rounded-card bg-surface-2 p-3">{copy.global.notMedical}</p>
      <p>{copy.settings.credits}</p>
      <p>{copy.settings.team}</p>
      <InstallButton />
      <p className="text-ink-soft">{fill(copy.settings.version, { v: APP_VERSION })}</p>
      <a href={REPO_URL} target="_blank" rel="noreferrer" className="self-start text-primary underline underline-offset-4">
        {copy.settings.repo}
      </a>
    </Section>
  );
}
