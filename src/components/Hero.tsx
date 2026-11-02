import { Link } from 'react-router-dom';
import type { Movie } from '../types/movie';
import { InfoIcon, PlayIcon } from './icons';
import { MovieMeta } from './MovieMeta';
import './Hero.css';

interface HeroProps {
  movie: Movie;
}

export function Hero({ movie }: HeroProps) {
  return (
    <section className="hero" aria-label="Featured title">
      <img className="hero__backdrop" src={movie.backdropUrl} alt="" />
      <div className="hero__shade" />
      <div className="hero__content">
        <span className="hero__eyebrow">Featured on STREAMBOX</span>
        <h1 className="hero__title">{movie.title}</h1>
        <MovieMeta movie={movie} />
        <p className="hero__description">{movie.description}</p>
        <div className="hero__actions">
          <Link className="button button--primary" to={`/watch/${movie.id}`}>
            <PlayIcon className="button__icon" />
            Play
          </Link>
          <Link className="button button--secondary" to={`/movie/${movie.id}`}>
            <InfoIcon className="button__icon" />
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
