// The crisis and support screens: kind wording, real tel: links for every
// line, and the promise that Tide never contacts anyone by itself.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CrisisScreen } from './CrisisScreen';
import { SupportScreen } from './SupportScreen';

describe('CrisisScreen', () => {
  it('shows the kind heading and real tel: links for every crisis line', () => {
    render(<CrisisScreen />);
    expect(screen.getByRole('heading', { name: 'It sounds like things are really hard right now.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Línea de la Vida/ })).toHaveAttribute('href', 'tel:8009112000');
    expect(screen.getByRole('link', { name: /988/ })).toHaveAttribute('href', 'tel:988');
    expect(screen.getByRole('link', { name: 'Emergency · 911' })).toHaveAttribute('href', 'tel:911');
    expect(screen.getByRole('button', { name: "I'm safe, take me back." })).toBeInTheDocument();
  });
});

describe('SupportScreen', () => {
  it('lists the crisis lines under their own heading and says Tide never contacts anyone', () => {
    render(<SupportScreen />);
    expect(screen.getByRole('heading', { name: 'If you are in crisis' })).toBeInTheDocument();
    expect(screen.getByText('Tide never contacts anyone for you.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add someone' })).toHaveAttribute('href', '/settings#people');
  });
});
