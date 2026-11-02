import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { pressKey, renderApp } from './renderApp';

function getRow(title: string) {
  return screen.getByRole('region', { name: new RegExp(`^${title}`) });
}

function getFocusedCard() {
  return document.querySelector('[data-focused="true"]');
}

describe('Home', () => {
  it('renders the header, featured hero and content rows', () => {
    renderApp('/');

    expect(screen.getByRole('link', { name: 'STREAMBOX home' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'The Glass Meridian' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /play/i })).toHaveAttribute('href', '/watch/sbx-0001');

    for (const title of ['Continue Watching', 'Trending Now', 'Popular Movies', 'Recommended For You', 'Documentaries', 'Recently Added']) {
      expect(getRow(title)).toBeInTheDocument();
    }
  });

  it('focuses the first card of the first row on load', () => {
    renderApp('/');

    const firstCard = within(getRow('Continue Watching')).getAllByRole('button', { name: /,/ })[0];
    expect(getFocusedCard()).toBe(firstCard);
  });

  it('moves focus with the arrow keys', () => {
    renderApp('/');
    const continueWatching = within(getRow('Continue Watching')).getAllByRole('button', { name: /,/ });
    const trending = within(getRow('Trending Now')).getAllByRole('button', { name: /,/ });

    pressKey('ArrowRight');
    expect(getFocusedCard()).toBe(continueWatching[1]);

    pressKey('ArrowLeft');
    expect(getFocusedCard()).toBe(continueWatching[0]);

    pressKey('ArrowDown');
    expect(getFocusedCard()).toBe(trending[0]);

    pressKey('ArrowUp');
    expect(getFocusedCard()).toBe(continueWatching[0]);
  });

  it('opens the details of the focused movie with Enter', () => {
    renderApp('/');

    pressKey('ArrowDown');
    pressKey('Enter');

    expect(screen.getByRole('heading', { level: 1, name: 'The Glass Meridian' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('restores focus to the selected movie when returning from details', () => {
    renderApp('/');

    pressKey('ArrowDown');
    pressKey('ArrowRight');
    pressKey('ArrowRight');
    const selected = getFocusedCard()?.getAttribute('aria-label');
    pressKey('Enter');
    pressKey('Escape');

    expect(getFocusedCard()).toHaveAttribute('aria-label', selected);
    expect(getFocusedCard()?.closest('section')).toBe(getRow('Trending Now'));
  });

  it('opens a movie when its card is clicked', () => {
    renderApp('/');

    fireEvent.click(within(getRow('Trending Now')).getByRole('button', { name: /^The Last Cartographer/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'The Last Cartographer' })).toBeInTheDocument();
  });
});
