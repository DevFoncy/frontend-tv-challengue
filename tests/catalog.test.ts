import { describe, expect, it } from 'vitest';
import { getAllMovies, getMovieById, searchMovies } from '../src/data/catalog';
import { buildHomeRows } from '../src/data/homeRows';
import { WATCH_HISTORY } from '../src/data/watchHistory';
import { formatPlaybackTime, formatRuntime } from '../src/utils/format';

describe('catalog', () => {
  const movies = getAllMovies();

  it('contains a realistic number of titles with unique ids', () => {
    expect(movies.length).toBeGreaterThanOrEqual(300);
    expect(movies.length).toBeLessThanOrEqual(500);
    expect(new Set(movies.map((movie) => movie.id)).size).toBe(movies.length);
  });

  it('has complete records', () => {
    for (const movie of movies) {
      expect(movie.title).not.toHaveLength(0);
      expect(movie.description).not.toHaveLength(0);
      expect(movie.duration).toBeGreaterThan(0);
      expect(movie.rating).toBeGreaterThanOrEqual(0);
      expect(movie.rating).toBeLessThanOrEqual(10);
      expect(movie.posterUrl).toMatch(/^\/images\/posters\//);
      expect(movie.backdropUrl).toMatch(/^\/images\/backdrops\//);
      expect(movie.videoUrl).toMatch(/^\/videos\/.+\.mp4$/);
    }
  });

  it('looks up movies by id', () => {
    expect(getMovieById('sbx-0001')?.title).toBe('The Glass Meridian');
    expect(getMovieById('does-not-exist')).toBeUndefined();
    expect(getMovieById(undefined)).toBeUndefined();
  });
});

describe('searchMovies', () => {
  it('matches titles case-insensitively', () => {
    const { results } = searchMovies('GLASS MERIDIAN');
    expect(results.map((movie) => movie.title)).toEqual(['The Glass Meridian']);
  });

  it('ignores accents', () => {
    const { results } = searchMovies('valparaiso');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((movie) => movie.title.includes('Valparaíso'))).toBe(true);
  });

  it('lists titles starting with the query first', () => {
    const { results } = searchMovies('night');
    expect(results[0].title.toLowerCase().startsWith('night')).toBe(true);
  });

  it('returns no results for an empty or unknown query', () => {
    expect(searchMovies('   ').total).toBe(0);
    expect(searchMovies('qwertyuiop').total).toBe(0);
  });
});

describe('buildHomeRows', () => {
  const rows = buildHomeRows(getAllMovies(), WATCH_HISTORY);

  it('starts with the editorial rows in order', () => {
    expect(rows.slice(0, 6).map((row) => row.title)).toEqual([
      'Continue Watching',
      'Trending Now',
      'Popular Movies',
      'Recommended For You',
      'Documentaries',
      'Recently Added',
    ]);
  });

  it('shows the watch history most recent first, with progress', () => {
    const continueWatching = rows[0];
    expect(continueWatching.movies.map((movie) => movie.id)).toEqual(
      WATCH_HISTORY.map((entry) => entry.movieId).reverse(),
    );
    expect(continueWatching.progress?.['sbx-0024']).toBe(0.47);
  });

  it('recommends unwatched titles from the most recently watched genre', () => {
    const recommended = rows.find((row) => row.id === 'recommended');
    const lastGenre = getMovieById(WATCH_HISTORY[WATCH_HISTORY.length - 1].movieId)?.genre;
    expect(recommended?.movies.length).toBeGreaterThan(0);
    for (const movie of recommended?.movies ?? []) {
      expect(movie.genre).toBe(lastGenre);
      expect(WATCH_HISTORY.some((entry) => entry.movieId === movie.id)).toBe(false);
    }
  });
});

describe('formatting', () => {
  it('formats runtimes', () => {
    expect(formatRuntime(48)).toBe('48m');
    expect(formatRuntime(120)).toBe('2h');
    expect(formatRuntime(134)).toBe('2h 14m');
  });

  it('formats playback time', () => {
    expect(formatPlaybackTime(0)).toBe('0:00');
    expect(formatPlaybackTime(65)).toBe('1:05');
    expect(formatPlaybackTime(3723)).toBe('1:02:03');
    expect(formatPlaybackTime(Number.NaN)).toBe('0:00');
  });
});
