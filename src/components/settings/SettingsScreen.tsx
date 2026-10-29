'use client';

// Settings, in the order of the spec: profile, comfort, how Tide talks, AI
// suggestions, people and support, your data, demo, about. Every change is
// saved and applied at once; there is no "Save" button to forget.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { AboutSection } from './AboutSection';
import { AiSection } from './AiSection';
import { AppearanceSection } from './AppearanceSection';
import { ComfortSection } from './ComfortSection';
import { DataSection } from './DataSection';
import { DemoSection } from './DemoSection';
import { PeopleSection } from './PeopleSection';
import { ModePicker } from './PreferencePickers';
import { Section } from './Section';

export function SettingsScreen() {
  const { settings, update } = useSettings();
  return (
    <div className="flex flex-col gap-8">
      <Section id="profile" title={copy.settings.profile}>
        <label htmlFor="profile-name" className="font-bold">
          {copy.settings.nameLabel}
        </label>
        <input
          id="profile-name"
          value={settings.name}
          maxLength={40}
          onChange={(e) => void update('name', e.target.value)}
          className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body"
        />
      </Section>
      <ComfortSection />
      <AppearanceSection />
      <Section id="talk" title={copy.settings.howTideTalks}>
        <ModePicker legend={copy.settings.howTideTalks} />
      </Section>
      <AiSection />
      <PeopleSection />
      <DataSection />
      <DemoSection />
      <AboutSection />
    </div>
  );
}
