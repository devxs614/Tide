'use client';

// "My rewards": small things Maya can give herself ("Tea break"). After a
// focus block that got going, Tide may suggest one; she decides what counts.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { db } from '@/lib/db';
import { addReward, removeReward } from '@/lib/repo/rewards';
import { Button } from '@/components/ui/button';

export function RewardsList() {
  const rewards = useLiveQuery(() => db.rewards.toArray(), []) ?? [];
  const [text, setText] = useState('');

  const add = async () => {
    await addReward(text);
    setText('');
  };

  return (
    <section aria-labelledby="rewards-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="rewards-heading" className="text-h3 font-bold">
          {copy.proof.rewards}
        </h2>
        <p className="text-ink-soft">{copy.proof.rewardsHint}</p>
      </div>
      {rewards.length === 0 ? (
        <p className="text-ink-soft">{copy.proof.noRewards}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rewards.map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-card border border-line bg-surface py-1 pr-1 pl-3">
              <span className="flex-1 break-words">{r.text}</span>
              <Button variant="quiet" size="sm" aria-label={fill(copy.proof.removeReward, { reward: r.text })} onClick={() => void removeReward(r.id)}>
                <X aria-hidden />
                {copy.global.remove}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {/* At large text sizes the button drops under the field instead of
          pushing the page sideways. */}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <label htmlFor="new-reward" className="sr-only">
          {copy.proof.rewardLabel}
        </label>
        <input
          id="new-reward"
          value={text}
          maxLength={80}
          onChange={(e) => setText(e.target.value)}
          className="min-h-12 min-w-0 grow basis-40 rounded-input border border-line bg-surface-2 px-3 text-body"
        />
        <Button type="submit" variant="secondary" disabled={!text.trim()}>
          {copy.proof.addReward}
        </Button>
      </form>
    </section>
  );
}
