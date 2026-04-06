import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../components/LogoutButton';
import ConnectInsightsAI from '../components/ConnectInsightsAI';

/**
 * DashboardPage — a protected page that displays the authenticated
 * user's profile information.
 *
 * This page is wrapped in <ProtectedRoute> so it will never render
 * for unauthenticated visitors (they get redirected to "/").
 *
 * We pull user data from the useAuth0() hook which returns the decoded
 * ID token claims (name, email, picture, sub, etc.).
 */
const DashboardPage = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="page fade-in">
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <LogoutButton />
        </div>

        <div className="profile-card">
          <div className="profile-card-left">
            {/* user.picture — the avatar URL from the identity provider */}
            <img
              src={user.picture}
              alt={user.name}
              className="profile-avatar"
            />
          </div>

          <div className="profile-card-right">
            <h2 className="profile-name">{user.name}</h2>

            <div className="profile-details">
              <div className="profile-field">
                <span className="profile-label">Email</span>
                {/* user.email — the primary email from Auth0 */}
                <span className="profile-value">{user.email}</span>
              </div>

              <div className="profile-field">
                <span className="profile-label">Auth0 ID</span>
                {/* user.sub — the unique Auth0 subject identifier */}
                <span className="profile-value mono">{user.sub}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connect Insights AI — federated auth to Azure AD B2C */}
        <div className="integrations-section">
          <h2 className="integrations-heading">Connected Apps</h2>
          <ConnectInsightsAI />
        </div>

        {/* Raw JSON dump of the full user object for debugging */}
        <div className="json-section">
          <h3>Raw User Object</h3>
          <pre className="json-block">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
