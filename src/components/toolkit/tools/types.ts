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
  // v2.1 F-08: a tool with typed input says so, and how to keep it, so the
  // runner's Cancel can ask "Leave without saving?" (the brain dump).
  onDraft?: (draft: ToolDraft | null) => void;
}

export interface ToolDraft {
  save: () => Promise<void>;
}
