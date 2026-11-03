import type { FocusPosition } from './focusMemory';

export type Direction = 'left' | 'right' | 'up' | 'down';

/**
 * Clamps a position to the items that exist: the row to the available rows and the
 * column to the length of that row.
 */
export function clampFocus(position: FocusPosition, rowLengths: number[]): FocusPosition {
  if (rowLengths.length === 0) return { row: 0, col: 0 };
  const row = Math.min(Math.max(position.row, 0), rowLengths.length - 1);
  const lastCol = Math.max(rowLengths[row] - 1, 0);
  const col = Math.min(Math.max(position.col, 0), lastCol);
  return { row, col };
}

/**
 * Next focus position for a D-pad move. Focus never leaves the grid: it stops at the
 * row edges, and moving to a shorter row lands on that row's last item.
 */
export function moveFocus(position: FocusPosition, direction: Direction, rowLengths: number[]): FocusPosition {
  const { row, col } = position;
  switch (direction) {
    case 'left':
      return clampFocus({ row, col: col - 1 }, rowLengths);
    case 'right':
      return clampFocus({ row, col: col + 1 }, rowLengths);
    case 'up':
      return clampFocus({ row: row - 1, col }, rowLengths);
    case 'down':
      return clampFocus({ row: row + 1, col }, rowLengths);
  }
}
