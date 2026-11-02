import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getMovieById } from '../src/data/catalog';
import { pressKey, renderApp } from './renderApp';

describe('Details', () => {
  it('displays the movie information', () => {
    const movie = getMovieById('sbx-0005')!;
    renderApp('/movie/sbx-0005');

    expect(screen.getByRole('heading', { level: 1, name: movie.title })).toBeInTheDocument();
    expect(screen.getByText(movie.description)).toBeInTheDocument();
    expect(screen.getAllByText(movie.genre).length).toBeGreaterThan(0);
    expect(screen.getByText(String(movie.releaseYear))).toBeInTheDocument();
    expect(screen.getByText('2h 24m')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating 8.4 out of 10')).toBeInTheDocument();
  });

  it('focuses the Play button so the remote can start playback', () => {
    renderApp('/movie/sbx-0005');
    expect(screen.getByRole('button', { name: /play/i })).toHaveFocus();

    pressKey('ArrowRight');
    expect(screen.getByRole('button', { name: /back/i })).toHaveFocus();

    pressKey('ArrowLeft');
    expect(screen.getByRole('button', { name: /play/i })).toHaveFocus();
  });

  it('starts playback from the Play button', () => {
    renderApp('/movie/sbx-0005');

    fireEvent.click(screen.getByRole('button', { name: /play/i }));

    expect(screen.getByTestId('video-element')).toHaveAttribute('src', getMovieById('sbx-0005')!.videoUrl);
    expect(screen.getByText('The Last Cartographer')).toBeInTheDocument();
  });

  it('goes back to Home with the Back button', () => {
    renderApp('/movie/sbx-0005');

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByRole('region', { name: /^Trending Now/ })).toBeInTheDocument();
  });

  it('shows a friendly message for an unknown movie', () => {
    renderApp('/movie/sbx-9999');

    expect(screen.getByRole('heading', { name: 'Title not available' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('region', { name: /^Continue Watching/ })).toBeInTheDocument();
  });
});
