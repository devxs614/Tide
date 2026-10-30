'use client';

// "Add a win": anything Maya wants to remember she did. It is free text, so
// the safety check runs first; nothing is saved if it fires.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { copy } from '@/copy/en';
import { addWin } from '@/lib/repo/wins';
import { detectCrisis } from '@/lib/safety/detect';
import { Button } from '@/components/ui/button';
import { DictateButton } from '@/components/ui/DictateButton';

export function AddWinForm() {
  const router = useRouter();
  const [text, setText] = useState('');

  const save = async () => {
    const value = text.trim();
    if (!value) return;
    if (detectCrisis(value)) return router.push('/support?crisis=1');
    await addWin(value.slice(0, 200), 'manual', undefined, 'manual');
    setText('');
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <label htmlFor="new-win" className="font-bold">
        {copy.proof.addWin}
      </label>
      <input
        id="new-win"
        value={text}
        maxLength={200}
        placeholder={copy.proof.winPlaceholder}
        onChange={(e) => setText(e.target.value)}
        className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body placeholder:text-ink-soft"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!text.trim()}>
          <Plus aria-hidden />
          {copy.proof.saveWin}
        </Button>
        <DictateButton value={text} onChange={setText} />
      </div>
    </form>
  );
}
