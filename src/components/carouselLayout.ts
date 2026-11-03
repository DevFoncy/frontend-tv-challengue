/** Layout of a carousel track, measured from the DOM. */
export interface TrackMetrics {
  /** Distance between the start of two consecutive cards (card width + margin). */
  stride: number;
  cardWidth: number;
  /** Horizontal padding of the track (the page gutter). */
  gutter: number;
  /** Visible width of the track. */
  viewportWidth: number;
}

export interface RenderRange {
  start: number;
  /** Exclusive. */
  end: number;
}

/** Cards rendered beyond each edge of the visible area, so the next move is instant. */
export const OVERSCAN = 3;
/** Used before the track has been measured (first render, or environments without layout). */
export const FALLBACK_VISIBLE_COUNT = 7;

function isMeasured(metrics: TrackMetrics | null): metrics is TrackMetrics {
  return metrics !== null && metrics.stride > 0 && metrics.viewportWidth > 0;
}

/**
 * scrollLeft that brings the card at `index` fully into view, keeping it clear of the
 * gutters (room for the focus ring) and moving as little as possible.
 */
export function scrollLeftToReveal(index: number, scrollLeft: number, metrics: TrackMetrics): number {
  const cardStart = metrics.gutter + index * metrics.stride;
  const cardEnd = cardStart + metrics.cardWidth;
  if (cardStart - metrics.gutter < scrollLeft) {
    return cardStart - metrics.gutter;
  }
  if (cardEnd + metrics.gutter > scrollLeft + metrics.viewportWidth) {
    return cardEnd + metrics.gutter - metrics.viewportWidth;
  }
  return scrollLeft;
}

/** Index of the first card at least partly visible for the given scroll position. */
export function firstVisibleIndex(scrollLeft: number, metrics: TrackMetrics | null): number {
  if (!isMeasured(metrics)) return 0;
  return Math.max(0, Math.floor((scrollLeft - metrics.gutter) / metrics.stride));
}

/**
 * Cards to mount: the visible ones plus OVERSCAN on each side.
 * When the focused card is outside the scrolled area (the track is about to scroll to
 * it, e.g. after focus restoration), the window is anchored on the focus instead.
 */
export function getRenderRange(
  itemCount: number,
  firstVisible: number,
  metrics: TrackMetrics | null,
  focusedIndex: number | null,
): RenderRange {
  const visibleCount = isMeasured(metrics)
    ? Math.ceil(metrics.viewportWidth / metrics.stride) + 1
    : FALLBACK_VISIBLE_COUNT;

  let anchor = firstVisible;
  if (focusedIndex !== null && focusedIndex < anchor) {
    anchor = focusedIndex;
  } else if (focusedIndex !== null && focusedIndex >= anchor + visibleCount) {
    anchor = focusedIndex - visibleCount + 1;
  }

  return {
    start: Math.max(0, anchor - OVERSCAN),
    end: Math.min(itemCount, anchor + visibleCount + OVERSCAN),
  };
}
