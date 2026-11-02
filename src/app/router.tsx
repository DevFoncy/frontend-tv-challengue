import { Route, Routes } from 'react-router-dom';
import { Details } from '../pages/Details';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { Player } from '../pages/Player';
import { Search } from '../pages/Search';
import { AppLayout } from './AppLayout';

/** Opt-in to React Router v7 behaviour (silences the v6 future-flag warnings). */
export const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieId" element={<Details />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/watch/:movieId" element={<Player />} />
    </Routes>
  );
}
