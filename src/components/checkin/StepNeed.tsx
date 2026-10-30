'use client';

// Step 4, "What do you need right now?": four big choices that hand Maya to
// the next part of the loop: back to her day, a lighter plan, a short
// strategy, or people she can reach. Choosing one saves the check-in.
import { ArrowRight, HeartHandshake, Leaf, SlidersHorizontal } from 'lucide-react';
import { copy } from '@/copy/en';
import type { Need } from '@/lib/types';
import { StepHeader } from './StepHeader';
import { CheckInCoach } from './CheckInCoach';

const ICONS = { keep: ArrowRight, adjust: SlidersHorizontal, regulate: Leaf, talk: HeartHandshake };
const ORDER: Need[] = ['keep', 'adjust', 'regulate', 'talk'];

export function StepNeed({ onChoose, saving }: { onChoose: (need: Need) => void; saving: boolean }) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-6">
      <StepHeader title={copy.checkin.step4Title} stepNumber={4} />
      <CheckInCoach>{copy.ob.coachNeed}</CheckInCoach>
      <ul className="flex flex-col gap-3">
        {ORDER.map((need) => {
          const Icon = ICONS[need];
          const { title, body } = copy.checkin.needs[need];
          return (
            <li key={need}>
              <button
                type="button"
                disabled={saving}
                onClick={() => onChoose(need)}
                className="flex w-full items-center gap-4 press-3d card [--ledge-color:var(--line)] p-4 text-left hover:bg-surface-2 disabled:opacity-60"
              >
                <Icon className="size-6 shrink-0 text-primary" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-lead font-bold">{title}</span>
                  <span className="text-ink-soft">{body}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
