import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { MovieCarousel } from '../components/MovieCarousel';
import { getAllMovies, getMovieById } from '../data/catalog';
import { FEATURED_MOVIE_ID } from '../data/editorial';
import { buildHomeRows } from '../data/homeRows';
import { WATCH_HISTORY } from '../data/watchHistory';
import { useRowNavigation } from '../navigation/useRowNavigation';
import type { Movie } from '../types/movie';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const rows = useMemo(() => buildHomeRows(getAllMovies(), WATCH_HISTORY), []);
  const rowLengths = useMemo(() => rows.map((row) => row.movies.length), [rows]);
  const featured = getMovieById(FEATURED_MOVIE_ID);

  const openMovie = useCallback((movie: Movie) => navigate(`/movie/${movie.id}`), [navigate]);

  const { focus, setFocus } = useRowNavigation({
    rowLengths,
    memoryKey: 'home',
    onSelect: ({ row, col }) => {
      const movie = rows[row]?.movies[col];
      if (movie) openMovie(movie);
    },
  });

  // Mouse selection also moves the remote focus, so it is restored on return.
  const selectCard = useCallback(
    (movie: Movie, rowIndex: number) => {
      setFocus({ row: rowIndex, col: rows[rowIndex].movies.indexOf(movie) });
      openMovie(movie);
    },
    [rows, setFocus, openMovie],
  );

  return (
    <div className="home">
      {featured && <Hero movie={featured} />}
      <div className="home__rows">
        {rows.map((row, rowIndex) => (
          <MovieCarousel
            key={row.id}
            row={row}
            rowIndex={rowIndex}
            focusedIndex={focus.row === rowIndex ? focus.col : null}
            onSelect={selectCard}
          />
        ))}
      </div>
    </div>
  );
}
