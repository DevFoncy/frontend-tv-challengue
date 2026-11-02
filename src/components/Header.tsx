import { Link, NavLink } from 'react-router-dom';
import { SearchIcon, StreamboxMark } from './icons';
import './Header.css';

const navClassName = ({ isActive }: { isActive: boolean }) =>
  `header__link${isActive ? ' header__link--active' : ''}`;

export function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo" aria-label="STREAMBOX home">
        <StreamboxMark className="header__mark" />
        <span className="header__wordmark">
          STREAM<span>BOX</span>
        </span>
      </Link>
      <nav className="header__nav" aria-label="Main">
        <NavLink to="/" end className={navClassName}>
          Home
        </NavLink>
        <NavLink to="/search" className={navClassName}>
          <SearchIcon className="header__link-icon" />
          Search
        </NavLink>
      </nav>
      <div className="header__profile" title="Demo profile">
        <span className="header__avatar" aria-hidden="true">
          D
        </span>
        <span className="header__profile-name">Demo</span>
      </div>
    </header>
  );
}
