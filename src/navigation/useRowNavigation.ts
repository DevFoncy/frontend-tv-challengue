import { useEffect, useState } from 'react';
import { getSavedFocus, saveFocus, type FocusPosition } from './focusMemory';
import { KEY } from './keys';
import { clampFocus, moveFocus, type Direction } from './moveFocus';
import { useKeyDown } from './useKeyDown';

interface RowNavigationOptions {
  /** Number of items in each focusable row, top to bottom. */
  rowLengths: number[];
  /** Called when the user presses Enter on the focused item. */
  onSelect: (position: FocusPosition) => void;
  /** When set, focus is remembered and restored when the screen mounts again. */
  memoryKey?: string;
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  [KEY.LEFT]: 'left',
  [KEY.RIGHT]: 'right',
  [KEY.UP]: 'up',
  [KEY.DOWN]: 'down',
};

/**
 * D-pad navigation for screens made of horizontal rows (Home).
 * Left/Right move within the current row, Up/Down move between rows.
 */
export function useRowNavigation({ rowLengths, onSelect, memoryKey }: RowNavigationOptions) {
  const [focus, setFocus] = useState<FocusPosition>(() =>
    clampFocus((memoryKey ? getSavedFocus(memoryKey) : undefined) ?? { row: 0, col: 0 }, rowLengths),
  );

  useEffect(() => {
    if (memoryKey) saveFocus(memoryKey, focus);
  }, [memoryKey, focus]);

  useKeyDown((event) => {
    const direction = KEY_DIRECTIONS[event.key];
    if (direction) {
      setFocus((current) => moveFocus(current, direction, rowLengths));
    } else if (event.key === KEY.ENTER) {
      onSelect(focus);
    } else {
      return;
    }
    event.preventDefault();
  });

  return { focus, setFocus };
}
