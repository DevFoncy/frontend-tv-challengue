export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  /** Runtime in minutes. */
  duration: number;
  /** Average audience score from 0 to 10. */
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
}

export interface WatchHistoryEntry {
  movieId: string;
  /** Fraction of the title already watched, from 0 to 1. */
  progress: number;
  watchedAt: string;
}

export interface HomeRow {
  id: string;
  title: string;
  movies: Movie[];
  /** Watch progress by movie id, for rows that display it. */
  progress?: Record<string, number>;
}
