import type { HomeRow, Movie, WatchHistoryEntry } from '../types/movie';
import { TRENDING_MOVIE_IDS } from './editorial';

const POPULAR_LIMIT = 30;
const RECOMMENDED_LIMIT = 10;
const RECENTLY_ADDED_LIMIT = 24;

const GENRE_ROWS: Array<{ id: string; title: string; genres: string[] }> = [
  { id: 'action-adventure', title: 'Action & Adventure', genres: ['Action', 'Adventure'] },
  { id: 'scifi-fantasy', title: 'Sci-Fi & Fantasy', genres: ['Sci-Fi', 'Fantasy'] },
  { id: 'drama', title: 'Drama', genres: ['Drama'] },
  { id: 'comedy', title: 'Comedy', genres: ['Comedy'] },
  { id: 'thriller-crime', title: 'Thriller & Crime', genres: ['Thriller', 'Crime'] },
  { id: 'animation', title: 'Animation', genres: ['Animation'] },
  { id: 'romance', title: 'Romance', genres: ['Romance'] },
  { id: 'horror', title: 'Horror', genres: ['Horror'] },
];

const byRating = (a: Movie, b: Movie) => b.rating - a.rating || a.id.localeCompare(b.id);
const byNewest = (a: Movie, b: Movie) => b.releaseYear - a.releaseYear || b.id.localeCompare(a.id);

function resolveIds(ids: string[], moviesById: Map<string, Movie>): Movie[] {
  const result: Movie[] = [];
  for (const id of ids) {
    const movie = moviesById.get(id);
    if (movie) result.push(movie);
  }
  return result;
}

/**
 * Builds the Home screen rows from the catalog and the profile's watch history.
 */
export function buildHomeRows(movies: Movie[], history: WatchHistoryEntry[]): HomeRow[] {
  const moviesById = new Map(movies.map((movie) => [movie.id, movie]));
  const watchedIds = new Set(history.map((entry) => entry.movieId));

  const continueWatching = resolveIds(
    history.map((entry) => entry.movieId).reverse(),
    moviesById,
  );
  const progress: Record<string, number> = {};
  for (const entry of history) progress[entry.movieId] = entry.progress;

  // Recommendations are based on the genre of the most recently watched title.
  // Index access instead of Array.prototype.at(), which needs Chrome 92+.
  const lastWatched = history.length > 0 ? history[history.length - 1] : undefined;
  const lastWatchedGenre = lastWatched ? moviesById.get(lastWatched.movieId)?.genre : undefined;
  const recommended = movies
    .filter((movie) => movie.genre === lastWatchedGenre && !watchedIds.has(movie.id))
    .sort(byRating)
    .slice(0, RECOMMENDED_LIMIT);

  const rows: HomeRow[] = [
    { id: 'continue-watching', title: 'Continue Watching', movies: continueWatching, progress },
    { id: 'trending', title: 'Trending Now', movies: resolveIds(TRENDING_MOVIE_IDS, moviesById) },
    { id: 'popular', title: 'Popular Movies', movies: [...movies].sort(byRating).slice(0, POPULAR_LIMIT) },
    { id: 'recommended', title: 'Recommended For You', movies: recommended },
    {
      id: 'documentaries',
      title: 'Documentaries',
      movies: movies.filter((movie) => movie.genre === 'Documentary').sort(byNewest),
    },
    { id: 'recently-added', title: 'Recently Added', movies: [...movies].sort(byNewest).slice(0, RECENTLY_ADDED_LIMIT) },
  ];

  for (const genreRow of GENRE_ROWS) {
    rows.push({
      id: genreRow.id,
      title: genreRow.title,
      movies: movies.filter((movie) => genreRow.genres.includes(movie.genre)).sort(byRating),
    });
  }

  return rows.filter((row) => row.movies.length > 0);
}
