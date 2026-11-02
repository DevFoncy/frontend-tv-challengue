import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './renderApp';

describe('Search', () => {
  it('shows a hint before the user types', () => {
    renderApp('/search');

    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.getByText(/start typing to search across 400 titles/i)).toBeInTheDocument();
  });

  it('returns matching titles', async () => {
    const user = userEvent.setup();
    renderApp('/search');

    await user.type(screen.getByRole('searchbox'), 'meridian');

    expect(screen.getByRole('status')).toHaveTextContent('1 result for “meridian”');
    expect(screen.getByRole('button', { name: /^The Glass Meridian/ })).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderApp('/search');

    await user.type(screen.getByRole('searchbox'), 'zzzz');

    expect(screen.getByText('No titles match “zzzz”')).toBeInTheDocument();
  });

  it('opens the details of a result', async () => {
    const user = userEvent.setup();
    renderApp('/search');

    await user.type(screen.getByRole('searchbox'), 'cartographer');
    await user.click(screen.getByRole('button', { name: /^The Last Cartographer/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'The Last Cartographer' })).toBeInTheDocument();
  });

  it('keeps the query in the URL', () => {
    renderApp('/search?q=lantern');

    expect(screen.getByRole('searchbox')).toHaveValue('lantern');
    expect(screen.getByRole('button', { name: /^Paper Lanterns Over Oslo/ })).toBeInTheDocument();
  });
});
