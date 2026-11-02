import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { BackIcon, PlayIcon } from '../components/icons';
import { MovieMeta } from '../components/MovieMeta';
import { getMovieById } from '../data/catalog';
import { KEY } from '../navigation/keys';
import { useGoBack } from '../navigation/useGoBack';
import { useKeyDown } from '../navigation/useKeyDown';
import './Details.css';

export function Details() {
  const { movieId } = useParams();
  const movie = getMovieById(movieId);
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const playRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playRef.current?.focus();
  }, [movieId]);

  useKeyDown((event) => {
    if (!movie) return;
    switch (event.key) {
      case KEY.LEFT:
        playRef.current?.focus();
        break;
      case KEY.RIGHT:
        backRef.current?.focus();
        break;
      case KEY.BACK:
        goBack();
        break;
      default:
        return;
    }
    event.preventDefault();
  });

  if (!movie) {
    return (
      <EmptyState
        title="Title not available"
        message="We couldn’t find this title. It may have been removed from the catalog."
        actionLabel="Back to Home"
        onAction={() => navigate('/', { replace: true })}
      />
    );
  }

  return (
    <div className="details">
      <img className="details__backdrop" src={movie.backdropUrl} alt="" />
      <div className="details__shade" />
      <div className="details__content">
        <span className="details__eyebrow">{movie.genre}</span>
        <h1 className="details__title">{movie.title}</h1>
        <MovieMeta movie={movie} className="details__meta" />
        <p className="details__description">{movie.description}</p>
        <div className="details__actions">
          <button
            ref={playRef}
            type="button"
            className="button button--primary button--large"
            onClick={() => navigate(`/watch/${movie.id}`)}
          >
            <PlayIcon className="button__icon" />
            Play
          </button>
          <button ref={backRef} type="button" className="button button--secondary button--large" onClick={goBack}>
            <BackIcon className="button__icon" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
