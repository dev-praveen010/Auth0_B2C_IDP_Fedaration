import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

/**
 * NavBar — top navigation bar.
 *
 * - Left side:  App name / logo linking to home
 * - Right side: Login or Logout button depending on auth state,
 *               plus the user avatar and name when logged in.
 *
 * Uses useAuth0() to read authentication state.
 */
const NavBar = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand / logo */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🔑</span>
          <span className="navbar-title">Auth0 Demo</span>
        </Link>

        {/* Right-side actions */}
        <div className="navbar-actions">
          {!isLoading && isAuthenticated && (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <div className="navbar-user">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="navbar-avatar"
                />
                <span className="navbar-username">{user.name}</span>
              </div>
              <LogoutButton />
            </>
          )}

          {!isLoading && !isAuthenticated && <LoginButton />}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
