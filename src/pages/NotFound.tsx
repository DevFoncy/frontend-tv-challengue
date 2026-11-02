import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <EmptyState
      title="Page not found"
      message="The page you were looking for doesn’t exist."
      actionLabel="Back to Home"
      onAction={() => navigate('/', { replace: true })}
    />
  );
}
