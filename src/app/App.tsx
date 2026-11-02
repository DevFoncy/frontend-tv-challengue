import { BrowserRouter } from 'react-router-dom';
import { AppRoutes, routerFuture } from './router';

export function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <AppRoutes />
    </BrowserRouter>
  );
}
