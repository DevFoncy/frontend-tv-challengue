import { memo } from 'react';
import type { Movie } from '../types/movie';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  isFocused?: boolean;
  /** Watch progress from 0 to 1. Renders a progress bar when provided. */
  progress?: number;
  onSelect: (movie: Movie) => void;
}

export const MovieCard = memo(function MovieCard({ movie, isFocused = false, progress, onSelect }: MovieCardProps) {
  return (
    <button
      type="button"
      className={`movie-card${isFocused ? ' movie-card--focused' : ''}`}
      data-focused={isFocused ? 'true' : undefined}
      aria-label={`${movie.title}, ${movie.releaseYear}, ${movie.genre}`}
      onClick={() => onSelect(movie)}
    >
      <span className="movie-card__poster">
        <img className="movie-card__image" src={movie.posterUrl} alt="" />
        {progress !== undefined && (
          <span className="movie-card__progress">
            <span className="movie-card__progress-value" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        )}
      </span>
      <span className="movie-card__title">{movie.title}</span>
      <span className="movie-card__meta">
        {movie.releaseYear} · {movie.genre}
      </span>
    </button>
  );
});
