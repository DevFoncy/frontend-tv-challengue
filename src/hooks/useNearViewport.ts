import { useEffect, useState, type RefObject } from 'react';

/**
 * Tracks whether an element is within `rootMargin` of the viewport.
 * Without IntersectionObserver support it reports `true`, i.e. content is always rendered.
 */
export function useNearViewport(ref: RefObject<Element>, rootMargin: string, initialValue: boolean): boolean {
  const [isNear, setIsNear] = useState(() =>
    typeof IntersectionObserver === 'undefined' ? true : initialValue,
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        // `isIntersecting` was added in Chrome 58; older engines only report the ratio.
        const entry: { isIntersecting?: boolean; intersectionRatio: number } = entries[entries.length - 1];
        setIsNear(entry.isIntersecting !== undefined ? entry.isIntersecting : entry.intersectionRatio > 0);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isNear;
}
