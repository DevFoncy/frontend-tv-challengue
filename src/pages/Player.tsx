import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { VideoPlayer } from '../components/VideoPlayer';
import { getMovieById } from '../data/catalog';
import { useGoBack } from '../navigation/useGoBack';

export function Player() {
  const { movieId } = useParams();
  const movie = getMovieById(movieId);
  const navigate = useNavigate();
  const goBack = useGoBack(movie ? `/movie/${movie.id}` : '/');

  if (!movie) {
    return (
      <EmptyState
        title="Title not available"
        message="This title can’t be played because it is no longer in the catalog."
        actionLabel="Back to Home"
        onAction={() => navigate('/', { replace: true })}
      />
    );
  }

  // A new player instance per title: playback state and media resources never carry over.
  return <VideoPlayer key={movie.id} src={movie.videoUrl} title={movie.title} onBack={goBack} />;
}
