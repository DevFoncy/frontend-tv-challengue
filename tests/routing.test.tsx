import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { pressKey, renderApp } from './renderApp';

describe('routing', () => {
  it('navigates between Home and Search from the header', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getByRole('link', { name: /search/i }));
    expect(screen.getByRole('searchbox')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('region', { name: /^Trending Now/ })).toBeInTheDocument();
  });

  it('renders the player for a valid movie', () => {
    renderApp('/watch/sbx-0001');

    expect(screen.getByTestId('video-element')).toHaveAttribute('src', '/videos/streambox-demo-a.mp4');
    expect(screen.getByText('The Glass Meridian')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Playback position' })).toBeInTheDocument();
  });

  it('returns from the player to the details screen', async () => {
    const user = userEvent.setup();
    renderApp('/watch/sbx-0001');

    await user.click(screen.getByRole('button', { name: /back to details/i }));

    expect(screen.getByRole('heading', { level: 1, name: 'The Glass Meridian' })).toBeInTheDocument();
  });

  it('supports the Back key through Home → Details → Player and back', () => {
    renderApp('/');

    pressKey('Enter');
    expect(screen.getByRole('heading', { level: 1, name: 'Station Epsilon' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(screen.getByTestId('video-element')).toBeInTheDocument();

    pressKey('Escape');
    expect(screen.getByRole('heading', { level: 1, name: 'Station Epsilon' })).toBeInTheDocument();

    pressKey('Escape');
    expect(screen.getByRole('region', { name: /^Continue Watching/ })).toBeInTheDocument();
  });

  it('shows the not-found page for unknown routes', () => {
    renderApp('/does/not/exist');

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows a friendly message when playing an unknown movie', () => {
    renderApp('/watch/sbx-9999');

    expect(screen.getByRole('heading', { name: 'Title not available' })).toBeInTheDocument();
  });
});
