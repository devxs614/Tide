'use client';

// Which Close the day step to show (v2 spec 14.4), in order. Each step is a
// small file; they share the day's facts, the wrap record and two actions:
// save part of the record, and go on.
import type { DayFacts } from '@/lib/wrap/facts';
import type { DayWrap } from '@/lib/types';
import { ArriveStep } from './steps/ArriveStep';
import { EveningCheckInStep } from './steps/EveningCheckInStep';
import { TideStep } from './steps/TideStep';
import { WinsStep } from './steps/WinsStep';
import { ChipsStep } from './steps/ChipsStep';
import { OverallStep } from './steps/OverallStep';
import { LooseEndsStep } from './steps/LooseEndsStep';
import { TomorrowStep } from './steps/TomorrowStep';
import { BottleStep } from './steps/BottleStep';
import { SummaryStep } from './steps/SummaryStep';
import { WindDownStep } from './steps/WindDownStep';
import { GoodnightStep } from './steps/GoodnightStep';

export interface WrapStepProps {
  wrap: DayWrap;
  facts: DayFacts;
  save: (patch: Partial<DayWrap>) => void;
  next: () => void;
}

export function WrapStep({ step, ...props }: { step: number } & WrapStepProps) {
  switch (step) {
    case 1:
      return <ArriveStep {...props} />;
    case 2:
      return <EveningCheckInStep {...props} />;
    case 3:
      return <TideStep {...props} />;
    case 4:
      return <WinsStep {...props} />;
    case 5:
      return <ChipsStep {...props} kind="helped" />;
    case 6:
      return <ChipsStep {...props} kind="hard" />;
    case 7:
      return <OverallStep {...props} />;
    case 8:
      return <LooseEndsStep {...props} />;
    case 9:
      return <TomorrowStep {...props} />;
    case 10:
      return <BottleStep {...props} />;
    case 11:
      return <SummaryStep {...props} />;
    case 12:
      return <WindDownStep {...props} />;
    default:
      return <GoodnightStep {...props} />;
  }
}
