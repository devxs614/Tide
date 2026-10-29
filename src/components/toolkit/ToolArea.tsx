'use client';

// Picks the interactive tool for a strategy. The sudoku and the drawing
// canvas are loaded only when someone opens them, so the toolkit stays
// light for everyone else. Strategies without a special tool get the
// generic steps timer.
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ToolId } from '@/data/strategies';
import { copy } from '@/copy/en';
import { BoxBreathing } from './tools/BoxBreathing';
import { BrainDump } from './tools/BrainDump';
import { Grounding54321 } from './tools/Grounding54321';
import { MessageTemplate } from './tools/MessageTemplate';
import { StepsTimer } from './tools/StepsTimer';
import { WalkTimer } from './tools/WalkTimer';
import type { ToolProps } from './tools/types';

const loading = () => <p className="text-ink-soft">{copy.global.loading}</p>;

const Sudoku4x4 = dynamic(() => import('./tools/Sudoku4x4').then((m) => m.Sudoku4x4), { ssr: false, loading });
const DoodleCanvas = dynamic(() => import('./tools/DoodleCanvas').then((m) => m.DoodleCanvas), { ssr: false, loading });

export const TOOLS: Record<ToolId, ComponentType<ToolProps>> = {
  box_breathing: BoxBreathing,
  grounding_54321: Grounding54321,
  sudoku_4x4: Sudoku4x4,
  doodle: DoodleCanvas,
  walk_timer: WalkTimer,
  brain_dump: BrainDump,
  message_template: MessageTemplate,
  steps_timer: StepsTimer,
};

export function ToolArea(props: ToolProps) {
  const Tool = TOOLS[props.strategy.tool ?? 'steps_timer'];
  return <Tool {...props} />;
}
