// The AI Prompts page must show every route with the real prompt text from
// /prompts and example answers that pass the same checks as live ones.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ROUTE_DOCS, exampleOutput } from '@/lib/ai/promptDocs';
import { BridgeOutput, DayModeOutput, LabelOutput, NarrateOutput, UnstickOutput } from '@/lib/ai/schemas';
import PromptsDocPage from './page';

const OUTPUTS = { label: LabelOutput, unstick: UnstickOutput, daymode: DayModeOutput, bridge: BridgeOutput, narrate: NarrateOutput };

describe('/prompts-doc', () => {
  it('lists the preamble and all five routes with their prompts', () => {
    render(<PromptsDocPage />);
    expect(screen.getByRole('heading', { name: 'Tide — AI Prompts' })).toBeInTheDocument();
    for (const doc of ROUTE_DOCS) expect(screen.getByRole('heading', { name: new RegExp(doc.title) })).toBeInTheDocument();
    expect(screen.getAllByText(/You are the suggestion engine inside Tide/).length).toBe(6);
    expect(screen.getByText(/TASK: Give the user ONE first step/)).toBeInTheDocument();
  });

  it('uses example outputs that are valid for their route', () => {
    for (const doc of ROUTE_DOCS) {
      const out = exampleOutput(doc);
      expect(out, doc.route).toBeDefined();
      expect(OUTPUTS[doc.route].safeParse(out).success, doc.route).toBe(true);
    }
  });
});
