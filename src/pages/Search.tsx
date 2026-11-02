import { useCallback, useEffect, useMemo, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon } from '../components/icons';
import { MovieCard } from '../components/MovieCard';
import { getAllMovies, searchMovies } from '../data/catalog';
import { KEY } from '../navigation/keys';
import { useGoBack } from '../navigation/useGoBack';
import { useKeyDown } from '../navigation/useKeyDown';
import type { Movie } from '../types/movie';
import './Search.css';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const navigate = useNavigate();
  const goBack = useGoBack('/');

  const { results, total } = useMemo(() => searchMovies(query), [query]);
  const hasQuery = query.trim().length > 0;

  const openMovie = useCallback((movie: Movie) => navigate(`/movie/${movie.id}`), [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  useKeyDown((event) => {
    if (event.key === KEY.BACK) {
      event.preventDefault();
      goBack();
    }
  });

  return (
    <div className="search">
      <label className="search__field">
        <SearchIcon className="search__icon" />
        <span className="visually-hidden">Search titles</span>
        <input
          className="search__input"
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Search movies and documentaries"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
      </label>

      {!hasQuery && (
        <p className="search__hint">Start typing to search across {getAllMovies().length} titles.</p>
      )}

      {hasQuery && total === 0 && (
        <div className="search__empty" role="status">
          <p className="search__empty-title">No titles match “{query.trim()}”</p>
          <p className="search__empty-text">Check the spelling or try a different title.</p>
        </div>
      )}

      {hasQuery && total > 0 && (
        <>
          <p className="search__summary" role="status">
            {total === 1 ? '1 result' : `${total} results`} for “{query.trim()}”
            {total > results.length && ` · showing the first ${results.length}`}
          </p>
          <div className="search__results">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onSelect={openMovie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
