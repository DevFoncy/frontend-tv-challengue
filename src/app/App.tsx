import { BrowserRouter } from 'react-router-dom';
import { AppRoutes, routerFuture } from './router';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL} future={routerFuture}>
      <AppRoutes />
    </BrowserRouter>
  );
}
