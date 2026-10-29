// Patterns screen. Phase 0 only gives the route its real title in the top bar;
// the screen itself is built in a later phase of the build plan.
import { copy } from '@/copy/en';

export default function PatternsPage() {
  return <h2 className="text-h2 font-bold">{copy.shell.titles.patterns}</h2>;
}
