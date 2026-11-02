import type { WatchHistoryEntry } from '../types/movie';

/**
 * Viewing history of the demo profile, oldest first.
 * In production this is returned by the user-profile service.
 */
export const WATCH_HISTORY: WatchHistoryEntry[] = [
  { movieId: 'sbx-0014', progress: 0.82, watchedAt: '2026-10-21T21:14:00Z' },
  { movieId: 'sbx-0040', progress: 0.35, watchedAt: '2026-10-24T22:40:00Z' },
  { movieId: 'sbx-0018', progress: 0.61, watchedAt: '2026-10-27T19:05:00Z' },
  { movieId: 'sbx-0013', progress: 0.18, watchedAt: '2026-10-30T20:30:00Z' },
  { movieId: 'sbx-0024', progress: 0.47, watchedAt: '2026-11-01T21:55:00Z' },
];
