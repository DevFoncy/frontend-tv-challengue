import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { KEY } from '../navigation/keys';
import { useKeyDown } from '../navigation/useKeyDown';
import { formatPlaybackTime } from '../utils/format';
import { BackIcon, PauseIcon, PlayIcon } from './icons';
import './VideoPlayer.css';

const SEEK_STEP_SECONDS = 10;
const CONTROLS_HIDE_DELAY_MS = 4000;

interface VideoPlayerProps {
  src: string;
  title: string;
  onBack: () => void;
}

// Keeps mouse clicks from moving DOM focus onto the controls, so Enter/Space
// always go through the player's own key handling.
const keepFocus = (event: MouseEvent) => event.preventDefault();

export function VideoPlayer({ src, title, onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };
    // Pause when the app is sent to the background (e.g. the TV switches input).
    const handleVisibilityChange = () => {
      if (document.hidden) video.pause();
    };

    const mediaListeners: Array<[keyof HTMLMediaElementEventMap, () => void]> = [
      ['loadedmetadata', handleLoadedMetadata],
      ['timeupdate', handleTimeUpdate],
      ['play', handlePlay],
      ['pause', handlePause],
      ['ended', handleEnded],
      ['error', handleError],
    ];
    for (const [type, listener] of mediaListeners) video.addEventListener(type, listener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // The effect owns the media source: it is attached here and released in the cleanup,
    // so a remount (or React StrictMode's double effect run) always starts from a clean element.
    video.setAttribute('src', src);
    setHasError(false);
    const playback = video.play();
    if (playback) {
      // Autoplay can be blocked until the user interacts with the page.
      playback.catch(() => setIsPlaying(false));
    }

    return () => {
      for (const [type, listener] of mediaListeners) video.removeEventListener(type, listener);
      // This listener closes over the <video>: leaving it registered keeps the element
      // and its media pipeline alive after the player unmounts.
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Stop playback and release the decoder, buffers and network connection now,
      // instead of whenever the element is garbage-collected.
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  // Hide the controls after a few seconds of inactivity while playing.
  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isPlaying, lastActivity]);

  const showControls = () => {
    setControlsVisible(true);
    setLastActivity(Date.now());
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      const playback = video.play();
      if (playback) playback.catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration);
    setCurrentTime(video.currentTime);
  };

  const seekToPointer = (event: MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * duration;
    setCurrentTime(video.currentTime);
  };

  useKeyDown((event) => {
    showControls();
    switch (event.key) {
      case KEY.ENTER:
      case ' ':
        togglePlayback();
        break;
      case KEY.LEFT:
        seekBy(-SEEK_STEP_SECONDS);
        break;
      case KEY.RIGHT:
        seekBy(SEEK_STEP_SECONDS);
        break;
      case KEY.BACK:
        onBack();
        break;
      default:
        return;
    }
    event.preventDefault();
  });

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className={`player${controlsVisible ? '' : ' player--idle'}`} onMouseMove={showControls}>
      <video
        ref={videoRef}
        className="player__video"
        preload="auto"
        playsInline
        onClick={togglePlayback}
        data-testid="video-element"
      />

      <div className="player__top">
        <button type="button" className="player__back" onMouseDown={keepFocus} onClick={onBack}>
          <BackIcon className="player__back-icon" />
          Back to details
        </button>
        <span className="player__title">{title}</span>
      </div>

      {hasError ? (
        <div className="player__error" role="alert">
          <p className="player__error-title">This title can’t be played right now.</p>
          <p className="player__error-text">Please try again later or choose another title.</p>
        </div>
      ) : (
        !isPlaying && (
          <button
            type="button"
            className="player__center-play"
            aria-label="Play"
            onMouseDown={keepFocus}
            onClick={togglePlayback}
          >
            <PlayIcon />
          </button>
        )
      )}

      <div className="player__controls">
        <button
          type="button"
          className="player__toggle"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onMouseDown={keepFocus}
          onClick={togglePlayback}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className="player__time" data-testid="current-time">
          {formatPlaybackTime(currentTime)}
        </span>
        <div
          className="player__progress"
          role="slider"
          aria-label="Playback position"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          tabIndex={-1}
          onClick={seekToPointer}
        >
          <div className="player__progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="player__time" data-testid="duration">
          {formatPlaybackTime(duration)}
        </span>
      </div>
    </div>
  );
}
