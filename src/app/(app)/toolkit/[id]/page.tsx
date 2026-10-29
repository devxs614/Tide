// Strategy runner route. Phase 0 only reserves the route; Phase 5 builds the
// runner with its tools and the re-check.
import { copy } from '@/copy/en';

export default function StrategyPage() {
  return <h2 className="text-h2 font-bold">{copy.shell.titles.strategy}</h2>;
}
