import { useEffect, useRef } from 'react';

/**
 * Subscribes to window keydown events for the lifetime of the component.
 * The latest handler is always used, so callers do not need to memoize it.
 */
export function useKeyDown(handler: (event: KeyboardEvent) => void): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handlerRef.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
}
