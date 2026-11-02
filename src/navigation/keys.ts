/**
 * Remote-control keys, as reported by `KeyboardEvent.key`.
 * On desktop, Escape acts as the remote's Back key.
 */
export const KEY = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  ENTER: 'Enter',
  BACK: 'Escape',
} as const;
