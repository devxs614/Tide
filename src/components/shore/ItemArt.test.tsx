// The sand dollar and the companion on the Shore (v2.1 F-14, F-15). Both
// broke the same way: a scene-wide CSS rule spun every shape around its own
// middle, so rotated parts landed in the wrong place. These checks keep the
// sand dollar's parts placed in code and the companion out of that rule.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { ItemArt } from './ItemArt';

beforeEach(async () => {
  await resetApp();
});

describe('shore item drawings', () => {
  it('draws the sand dollar with five petals, each turned in code', async () => {
    await renderApp(
      <svg viewBox="-20 -20 40 40" data-testid="art">
        <ItemArt type="sandDollar" variant="plain" />
      </svg>,
    );
    const art = await screen.findByTestId('art');
    const petals = [...art.querySelectorAll('path')].filter((p) => p.getAttribute('d')?.includes('C'));
    expect(petals).toHaveLength(5);
    // Five different starting points: the petals fan out, not pile up.
    expect(new Set(petals.map((p) => p.getAttribute('d')?.split(' C')[0])).size).toBe(5);
    expect(art.querySelector('[transform]')).toBeNull();
  });

  it("keeps the companion out of the scene's spin-in-place rule", () => {
    const css = readFileSync(join(__dirname, 'shore.css'), 'utf8');
    expect(css).toMatch(/\.shore :is\(g, path, circle, ellipse, rect\):not\(\.cmp, \.cmp \*\)/);
  });
});
