// The words for a big celebration (v2 spec 10.5), in Maya's communication
// mode. Mentions of the companion fall back to neutral wording when she has
// no companion, so "Pebble saw it" never becomes " saw it".
import { copy, fill } from '@/copy/en';
import type { CommunicationMode } from '@/lib/types';
import type { CelebrationEvent } from './matrix';

export interface TextVars {
  companion?: string;
  title?: string;
  feature?: keyof typeof copy.celebrate.features;
}

export function celebrationText(event: CelebrationEvent, mode: CommunicationMode, vars: TextVars = {}): { title: string; message: string } {
  const key = event === 'unstuck' || event === 'taskDone' || event === 'wrapDone' || event === 'firstTime' ? event : 'other';
  const set = copy.celebrate.big[key][mode];
  let message: string = set.message;
  if (vars.companion === undefined && 'messageNoCompanion' in set) message = set.messageNoCompanion;
  const values = {
    companion: vars.companion ?? '',
    title: vars.title ?? '',
    feature: vars.feature ? copy.celebrate.features[vars.feature] : '',
  };
  return { title: fill(set.title, values), message: fill(message, values) };
}
