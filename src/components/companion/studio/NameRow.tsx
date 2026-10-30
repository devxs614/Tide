'use client';

// The companion's name as the Studio's heading, with a pencil to rename it
// (v2 spec 8.7). The draft is checked as Maya types, and a problem is said
// plainly in the normal text color, never in red. "Use default name" brings
// back Pebble, Lolo and the rest; an empty saved name means "the default".
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { copy } from '@/copy/en';
import { COMPANION_COPY } from '@/copy/companions';
import { cleanCompanionName, companionNameProblem } from '@/lib/companion/name';
import { COMPANIONS, type CompanionSpecies } from '@/lib/companion/registry';
import { Button } from '@/components/ui/button';

export function NameRow({
  species,
  name,
  onRename,
}: {
  species: CompanionSpecies | null;
  name: string;
  onRename: (name: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const t = COMPANION_COPY.studio;

  if (!species) {
    return <h1 className="text-h1 font-extrabold">{t.title}</h1>;
  }
  const fallback = COMPANIONS[species].defaultName;

  if (draft === null) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="min-w-0 truncate text-h1 font-extrabold">{name}</h1>
        <Button variant="ghost" size="sm" onClick={() => setDraft(name)}>
          <Pencil aria-hidden />
          {t.editName}
        </Button>
      </div>
    );
  }

  const problem = companionNameProblem(draft);
  const save = () => {
    if (problem) return;
    const clean = cleanCompanionName(draft);
    // Saving the default name stores "" so a later species switch still
    // shows the new species' own default.
    onRename(clean === fallback ? '' : clean);
    setDraft(null);
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label htmlFor="companion-name" className="font-display font-extrabold">
        {t.nameLabel}
      </label>
      <input
        id="companion-name"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={24}
        autoComplete="off"
        autoFocus
        aria-describedby="companion-name-help"
        aria-invalid={problem ? true : undefined}
        className="min-h-12 rounded-input border-2 border-line bg-surface px-3 text-body"
      />
      <p id="companion-name-help" aria-live="polite" className="text-small text-ink-soft">
        {problem ? t.nameErrors[problem] : t.nameHelp}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!!problem}>
          {t.saveName}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            onRename('');
            setDraft(null);
          }}
        >
          {t.useDefaultName}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
          {copy.global.cancel}
        </Button>
      </div>
    </form>
  );
}
