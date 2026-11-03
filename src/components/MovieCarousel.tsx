import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type UIEvent } from 'react';
import { useNearViewport } from '../hooks/useNearViewport';
import type { HomeRow, Movie } from '../types/movie';
import { firstVisibleIndex, getRenderRange, scrollLeftToReveal, type TrackMetrics } from './carouselLayout';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { MovieCard, MovieCardPlaceholder } from './MovieCard';
import './MovieCarousel.css';

// Keeps the active row just below the fixed header.
const ROW_SCROLL_OFFSET = 140;
// Rows mount their cards when they come within this distance of the viewport.
const ROW_PRELOAD_MARGIN = '400px 0px';
// Rows visible at load on a 1080p screen, rendered before the first visibility check.
const INITIALLY_VISIBLE_ROWS = 2;

function measureTrack(track: HTMLElement): TrackMetrics | null {
  const card = track.querySelector<HTMLElement>('.movie-card');
  if (!card) return null;
  const cardWidth = card.offsetWidth;
  return {
    cardWidth,
    stride: cardWidth + (parseFloat(window.getComputedStyle(card).marginRight) || 0),
    gutter: parseFloat(window.getComputedStyle(track).paddingLeft) || 0,
    viewportWidth: track.clientWidth,
  };
}

function sameMetrics(a: TrackMetrics | null, b: TrackMetrics | null): boolean {
  if (a === null || b === null) return a === b;
  return a.stride === b.stride && a.cardWidth === b.cardWidth && a.gutter === b.gutter && a.viewportWidth === b.viewportWidth;
}

interface MovieCarouselProps {
  row: HomeRow;
  rowIndex: number;
  /** Index of the focused card when this row is the active one, otherwise null. */
  focusedIndex: number | null;
  onSelect: (movie: Movie, rowIndex: number) => void;
}

export const MovieCarousel = memo(function MovieCarousel({ row, rowIndex, focusedIndex, onSelect }: MovieCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<TrackMetrics | null>(null);
  const [firstVisible, setFirstVisible] = useState(0);
  const isActive = focusedIndex !== null;
  const isNearViewport = useNearViewport(sectionRef, ROW_PRELOAD_MARGIN, rowIndex < INITIALLY_VISIBLE_ROWS);

  const handleSelect = useCallback((movie: Movie) => onSelect(movie, rowIndex), [onSelect, rowIndex]);

  // Card size depends on the responsive breakpoints, so it is measured, not assumed.
  useLayoutEffect(() => {
    const update = () => {
      const track = trackRef.current;
      const next = track ? measureTrack(track) : null;
      setMetrics((current) => (sameMetrics(current, next) ? current : next));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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

  // Keep the focused card fully visible, scrolling as little as possible.
  useEffect(() => {
    const track = trackRef.current;
    if (focusedIndex === null || !track || !metrics || metrics.stride <= 0) return;

    const target = scrollLeftToReveal(focusedIndex, track.scrollLeft, metrics);
    if (target !== track.scrollLeft) {
      track.scrollLeft = target;
    }
  }, [focusedIndex, metrics]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setFirstVisible(firstVisibleIndex(event.currentTarget.scrollLeft, metrics));
  };

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) {
      track.scrollLeft += direction * Math.round(track.clientWidth * 0.8);
    }
  };

  // Only rows near the viewport mount cards, and only the cards around the visible
  // area. Spacers keep the track's scroll width, so scrolling and positions are unchanged.
  const itemCount = row.movies.length;
  const stride = metrics ? metrics.stride : 0;
  const range = isActive || isNearViewport ? getRenderRange(itemCount, firstVisible, metrics, focusedIndex) : { start: 0, end: 0 };

  return (
    <section
      ref={sectionRef}
      className={`carousel${isActive ? ' carousel--active' : ''}`}
      aria-labelledby={`row-${row.id}`}
      data-row={rowIndex}
    >
      <h2 id={`row-${row.id}`} className="carousel__title">
        {row.title}
        <span className="carousel__count">{itemCount} titles</span>
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
        <div ref={trackRef} className="carousel__track" onScroll={handleScroll}>
          {range.start > 0 && <span className="carousel__spacer" style={{ width: range.start * stride }} />}
          {row.movies.slice(range.start, range.end).map((movie, offset) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFocused={focusedIndex === range.start + offset}
              progress={row.progress?.[movie.id]}
              onSelect={handleSelect}
            />
          ))}
          {range.end < itemCount && (
            <span className="carousel__spacer" style={{ width: (itemCount - range.end) * stride }}>
              {range.start === range.end && <MovieCardPlaceholder />}
            </span>
          )}
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
});
