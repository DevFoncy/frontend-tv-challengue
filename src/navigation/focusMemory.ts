export interface FocusPosition {
  row: number;
  col: number;
}

/**
 * Last focus position per screen, kept for the lifetime of the app session
 * so a screen can restore focus when the user navigates back to it.
 */
const savedPositions = new Map<string, FocusPosition>();

export function getSavedFocus(screen: string): FocusPosition | undefined {
  return savedPositions.get(screen);
}

export function saveFocus(screen: string, position: FocusPosition): void {
  savedPositions.set(screen, position);
}

export function resetSavedFocus(): void {
  savedPositions.clear();
}
