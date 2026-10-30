// Flow test 4 from the v2 spec (21.3): in the Companion Studio, change the
// species, name, color and accessory; each is saved at once, and Undo puts
// the species and the name back.
import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { getSettings } from '@/lib/repo/settings';
import { renderApp, resetApp } from '@/test/utils';
import { CompanionStudio } from './CompanionStudio';

beforeEach(async () => {
  await resetApp({ 'companion.species': 'otter' });
});

describe('Companion Studio', () => {
  it('saves species, name, color and accessory, and Undo restores', async () => {
    const { user } = await renderApp(<CompanionStudio />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Pebble' })).toBeInTheDocument();

    // Species, with Undo.
    await user.click(screen.getByRole('button', { name: /^Lolo/ }));
    await waitFor(async () => expect((await getSettings())['companion.species']).toBe('axolotl'));
    expect(await screen.findByRole('heading', { level: 1, name: 'Lolo' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(async () => expect((await getSettings())['companion.species']).toBe('otter'));

    // Name: a name with a digit is explained, not saved.
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    const field = screen.getByLabelText('Name');
    await user.clear(field);
    await user.type(field, 'R2');
    expect(screen.getByText('Letters, spaces, hyphens and apostrophes work here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save name' })).toBeDisabled();
    await user.clear(field);
    await user.type(field, 'Biscuit{Enter}');
    await waitFor(async () => expect((await getSettings())['companion.name']).toBe('Biscuit'));
    expect(screen.getByRole('heading', { level: 1, name: 'Biscuit' })).toBeInTheDocument();
    const undos = await screen.findAllByRole('button', { name: 'Undo' });
    await user.click(undos[undos.length - 1]);
    await waitFor(async () => expect((await getSettings())['companion.name']).toBe(''));

    // Color and accessory save straight away.
    await user.click(screen.getByRole('button', { name: 'Cocoa' }));
    await waitFor(async () => expect((await getSettings())['companion.variant']).toBe('cocoa'));
    await user.click(screen.getByRole('button', { name: 'Scarf' }));
    await waitFor(async () => expect((await getSettings())['companion.accessory']).toBe('scarf'));
  });

  it('treats "none" as a real choice', async () => {
    const { user } = await renderApp(<CompanionStudio />);
    await user.click(await screen.findByRole('button', { name: /^No companion/ }));
    await waitFor(async () => expect((await getSettings())['companion.species']).toBe('none'));
    expect(await screen.findByText('No companion. You can choose one anytime.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Try a breath together' })).toBeNull();
  });
});
