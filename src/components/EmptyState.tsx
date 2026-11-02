import { useEffect, useRef } from 'react';
import { KEY } from '../navigation/keys';
import { useKeyDown } from '../navigation/useKeyDown';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

/** Full-screen message with a single action, used for missing content. */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const actionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    actionRef.current?.focus();
  }, []);

  useKeyDown((event) => {
    if (event.key === KEY.BACK) {
      event.preventDefault();
      onAction();
    }
  });

  return (
    <div className="empty-state" role="alert">
      <h1 className="empty-state__title">{title}</h1>
      <p className="empty-state__message">{message}</p>
      <button ref={actionRef} type="button" className="button button--primary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}
