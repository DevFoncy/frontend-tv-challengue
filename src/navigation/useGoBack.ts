import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Returns a callback that goes back in the in-app history, or to `fallbackPath`
 * when the current screen was opened directly (deep link, page reload).
 */
export function useGoBack(fallbackPath: string): () => void {
  const navigate = useNavigate();
  const location = useLocation();
  const isFirstEntry = location.key === 'default';

  return useCallback(() => {
    if (isFirstEntry) {
      navigate(fallbackPath, { replace: true });
    } else {
      navigate(-1);
    }
  }, [isFirstEntry, fallbackPath, navigate]);
}
