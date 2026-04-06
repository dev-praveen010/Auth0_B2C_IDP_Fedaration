import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../components/LoginButton';

/**
 * HomePage — the public landing page.
 * Shows a hero section with a call-to-action login button.
 * If the user is already authenticated it greets them by name.
 */
const HomePage = () => {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className="page fade-in">
      <div className="hero">
        <h1 className="hero-title">
          Welcome to <span className="brand">Auth0 Demo</span>
        </h1>
        <p className="hero-subtitle">
          A modern React application with secure authentication powered by Auth0.
        </p>

        {isAuthenticated ? (
          <div className="hero-authenticated">
            <img
              src={user.picture}
              alt={user.name}
              className="hero-avatar"
            />
            <p className="hero-greeting">
              Welcome back, <strong>{user.name}</strong>!
            </p>
            <a href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div className="hero-cta">
            <LoginButton />
            <p className="hero-hint">Sign in to access your dashboard</p>
          </div>
        )}
      </div>

      {/* <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Secure Auth</h3>
          <p>Industry-standard OAuth 2.0 and OpenID Connect via Auth0.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Built with Vite and React 18 for instant hot-module reloading.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Protected Routes</h3>
          <p>Route guards ensure only authenticated users access private pages.</p>
        </div>
      </section> */}
    </div>
  );
};

export default HomePage;
