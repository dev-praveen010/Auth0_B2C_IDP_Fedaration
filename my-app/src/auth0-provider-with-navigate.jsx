import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

/**
 * Auth0ProviderWithNavigate
 *
 * This wrapper component configures the Auth0Provider with values from
 * environment variables and uses React Router's useNavigate to handle
 * the redirect after authentication.
 *
 * Why a custom wrapper?
 * - Auth0Provider needs an onRedirectCallback to send the user to the
 *   correct page after login. useNavigate is only available inside a
 *   Router context, so we create this intermediate component that lives
 *   inside <BrowserRouter> but wraps the rest of the app.
 *
 * cacheLocation="localstorage" keeps the session alive across page
 * refreshes so the user doesn't have to log in again.
 */
const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  // Read Auth0 config from Vite environment variables
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  /**
   * Called by Auth0 after the user has been authenticated and
   * redirected back to the app. We use navigate() to send them
   * to whatever page they were trying to reach (appState.returnTo)
   * or fall back to the dashboard.
   */
  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/dashboard');
  };

  // Guard: if domain or clientId are missing the provider cannot work
  if (!domain || !clientId) {
    return (
      <div className="error-banner">
        <h2>Auth0 Configuration Missing</h2>
        <p>
          Please create a <code>.env</code> file in the project root with your
          Auth0 credentials. See <code>.env.example</code> for the required
          variables.
        </p>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        ...(audience ? { audience } : {}),
      }}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
