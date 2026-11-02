import { useCallback, useEffect, useRef } from 'react';
import type { HomeRow, Movie } from '../types/movie';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { MovieCard } from './MovieCard';
import './MovieCarousel.css';

// Matches the poster width defined in MovieCard.css.
const CARD_WIDTH = 264;
const CARDS_PER_PAGE = 6;
// Keeps the active row just below the fixed header.
const ROW_SCROLL_OFFSET = 140;

interface MovieCarouselProps {
  row: HomeRow;
  rowIndex: number;
  /** Index of the focused card when this row is the active one, otherwise null. */
  focusedIndex: number | null;
  onSelect: (movie: Movie, rowIndex: number) => void;
}

export function MovieCarousel({ row, rowIndex, focusedIndex, onSelect }: MovieCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isActive = focusedIndex !== null;

  const handleSelect = useCallback((movie: Movie) => onSelect(movie, rowIndex), [onSelect, rowIndex]);

  // Bring the active row into view vertically.
  useEffect(() => {
    const section = sectionRef.current;
    if (!isActive || !section) return;

    if (rowIndex === 0) {
      window.scrollTo(0, 0);
      return;
    }
    const top = section.getBoundingClientRect().top + window.pageYOffset - ROW_SCROLL_OFFSET;
    window.scrollTo(0, top);
  }, [isActive, rowIndex]);

  // Page the row horizontally as the focus moves along it.
  useEffect(() => {
    const track = trackRef.current;
    if (focusedIndex === null || !track) return;

    const page = Math.max(0, Math.floor(focusedIndex / CARDS_PER_PAGE));
    track.scrollLeft = page * CARDS_PER_PAGE * CARD_WIDTH;
  }, [focusedIndex]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) {
      track.scrollLeft += direction * Math.round(track.clientWidth * 0.8);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`carousel${isActive ? ' carousel--active' : ''}`}
      aria-labelledby={`row-${row.id}`}
      data-row={rowIndex}
    >
      <h2 id={`row-${row.id}`} className="carousel__title">
        {row.title}
        <span className="carousel__count">{row.movies.length} titles</span>
      </h2>
      <div className="carousel__viewport">
        <button
          type="button"
          className="carousel__arrow carousel__arrow--prev"
          aria-label={`Scroll ${row.title} left`}
          tabIndex={-1}
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeftIcon />
        </button>
        <div ref={trackRef} className="carousel__track">
          {row.movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFocused={focusedIndex === index}
              progress={row.progress?.[movie.id]}
              onSelect={handleSelect}
            />
          ))}
        </div>
        <button
          type="button"
          className="carousel__arrow carousel__arrow--next"
          aria-label={`Scroll ${row.title} right`}
          tabIndex={-1}
          onClick={() => scrollByPage(1)}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </section>
  );
}
