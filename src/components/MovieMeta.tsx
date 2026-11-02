import type { Movie } from '../types/movie';
import { formatRating, formatRuntime } from '../utils/format';
import { StarIcon } from './icons';
import './MovieMeta.css';

interface MovieMetaProps {
  movie: Movie;
  className?: string;
}

export function MovieMeta({ movie, className = '' }: MovieMetaProps) {
  return (
    <ul className={`movie-meta ${className}`}>
      <li className="movie-meta__item movie-meta__rating" aria-label={`Rating ${formatRating(movie.rating)} out of 10`}>
        <StarIcon className="movie-meta__star" />
        {formatRating(movie.rating)}
      </li>
      <li className="movie-meta__item">{movie.releaseYear}</li>
      <li className="movie-meta__item">{movie.genre}</li>
      <li className="movie-meta__item">{formatRuntime(movie.duration)}</li>
    </ul>
  );
}
