import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes, routerFuture } from '../src/app/router';

/** Renders the full application at the given path using an in-memory router. */
export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

/** Simulates a remote-control key press. */
export function pressKey(key: string) {
  fireEvent.keyDown(window, { key });
}
