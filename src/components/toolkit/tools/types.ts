// What every interactive tool receives from the strategy runner. A tool
// calls onDone when Maya finishes; the runner then asks the re-check
// question. Tools never save anything about the strategy themselves.
import type { Strategy } from '@/data/strategies';
import type { StrategyContext } from '@/lib/types';

export interface ToolProps {
  strategy: Strategy;
  context: StrategyContext;
  taskTitle?: string;
  onDone: () => void;
}
