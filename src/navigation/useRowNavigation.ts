import { useEffect, useState } from 'react';
import { getSavedFocus, saveFocus, type FocusPosition } from './focusMemory';
import { KEY } from './keys';
import { useKeyDown } from './useKeyDown';

interface RowNavigationOptions {
  /** Number of focusable rows on the screen. */
  rowCount: number;
  /** Called when the user presses Enter on the focused item. */
  onSelect: (position: FocusPosition) => void;
  /** When set, focus is remembered and restored when the screen mounts again. */
  memoryKey?: string;
}

/**
 * D-pad navigation for screens made of horizontal rows (Home).
 * Left/Right move within the current row, Up/Down move between rows.
 */
export function useRowNavigation({ rowCount, onSelect, memoryKey }: RowNavigationOptions) {
  const [focus, setFocus] = useState<FocusPosition>(
    () => (memoryKey ? getSavedFocus(memoryKey) : undefined) ?? { row: 0, col: 0 },
  );

  useEffect(() => {
    if (memoryKey) saveFocus(memoryKey, focus);
  }, [memoryKey, focus]);

  useKeyDown((event) => {
    switch (event.key) {
      case KEY.LEFT:
        setFocus((current) => ({ row: current.row, col: Math.max(0, current.col - 1) }));
        break;
      case KEY.RIGHT:
        setFocus((current) => ({ row: current.row, col: current.col + 1 }));
        break;
      case KEY.UP:
        setFocus((current) => ({ row: Math.max(0, current.row - 1), col: current.col }));
        break;
      case KEY.DOWN:
        setFocus((current) => ({ row: Math.min(rowCount - 1, current.row + 1), col: current.col }));
        break;
      case KEY.ENTER:
        onSelect(focus);
        break;
      default:
        return;
    }
    event.preventDefault();
  });

  return { focus, setFocus };
}
