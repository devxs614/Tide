// The friendly error page (v2 spec 17.5): kind words, the promise that data
// is safe, "Try again" and "Go to Today", and the companion looking soft.
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp, resetApp } from '@/test/utils';
import { ErrorContent } from './ErrorContent';

describe('error page', () => {
  it('says nothing is lost and offers a way back', async () => {
    await resetApp({ 'companion.species': 'gecko' });
    const reset = vi.fn();
    const { user } = await renderApp(<ErrorContent reset={reset} />);
    expect(await screen.findByText('Something went wrong on our side.')).toBeInTheDocument();
    expect(screen.getByText('Your data is safe on this device.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Today' })).toHaveAttribute('href', '/');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalled();
    await waitFor(() => expect(document.querySelector('svg[data-companion="gecko"]')).toHaveAttribute('data-expression', 'soft'));
  });
});
