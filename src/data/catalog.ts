import type { Movie } from '../types/movie';
import moviesJson from './movies.json';

const movies: Movie[] = moviesJson;
const moviesById = new Map(movies.map((movie) => [movie.id, movie]));

export function getAllMovies(): Movie[] {
  return movies;
}

export function getMovieById(id: string | undefined): Movie | undefined {
  return id ? moviesById.get(id) : undefined;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export interface SearchResult {
  results: Movie[];
  total: number;
}

export const SEARCH_RESULT_LIMIT = 40;

/**
 * Case- and accent-insensitive title search.
 * Titles that start with the query are listed before titles that only contain it.
 */
export function searchMovies(query: string, limit = SEARCH_RESULT_LIMIT): SearchResult {
  const needle = normalizeText(query);
  if (!needle) {
    return { results: [], total: 0 };
  }

  const startsWith: Movie[] = [];
  const contains: Movie[] = [];

  for (const movie of movies) {
    const title = normalizeText(movie.title);
    const position = title.indexOf(needle);
    if (position === 0) {
      startsWith.push(movie);
    } else if (position > 0) {
      contains.push(movie);
    }
  }

  const byTitle = (a: Movie, b: Movie) => a.title.localeCompare(b.title);
  const matches = startsWith.sort(byTitle).concat(contains.sort(byTitle));

  return { results: matches.slice(0, limit), total: matches.length };
}
