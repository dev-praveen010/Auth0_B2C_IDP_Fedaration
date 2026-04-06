import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * ConnectInsightsAI Component
 *
 * Provides a button to establish a federated connection with Azure AD B2C
 * through Auth0 using a popup instead of navigating the main app.
 *
 * How it works:
 * 1. User clicks "Connect to Insights AI" button
 * 2. loginWithPopup() opens a popup window with Auth0's hosted login
 * 3. Auth0 recognizes the "insights-ai-b2c" connection and redirects user to B2C
 * 4. User authenticates with B2C in the popup and Auth0 completes the flow internally
 * 5. Popup closes and we call getAccessTokenSilently() to retrieve the token
 * 6. Token is stored in state and component shows "✅ Connected" status
 * 7. Dashboard state is preserved and no app-level B2C callback page is used
 *
 * Environment: Uses Auth0's "insights-ai-b2c" enterprise OIDC connection
 */
const ConnectInsightsAI = () => {
  const { loginWithPopup, getAccessTokenSilently, isAuthenticated } = useAuth0();
  // Read persisted state from localStorage so the connected flag survives
  // the Auth0-triggered re-render that happens after loginWithPopup().
  const [isConnected, setIsConnected] = useState(
    () => localStorage.getItem('insights_ai_connected') === 'true'
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [b2cToken, setB2cToken] = useState(
    () => localStorage.getItem('insights_ai_token') || null
  );
  /**
   * Handle the connection to Insights AI via B2C federated auth
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      /**
       * loginWithPopup() with specific Auth0 connection:
       * - Opens a modal/popup (doesn't navigate away)
       * - Routes through Auth0 to the "insights-ai-b2c" enterprise connection
       * - Which points to Azure AD B2C custom policy
       * - User authenticates, popup closes, returns control to this component
       * - Auth0 handles the callback in the popup, so the app should not use
       *   a dedicated /auth/callback route for this flow
       */
      await loginWithPopup({
        authorizationParams: {
          connection: 'insights-ai-b2c',
        },
      });

      /**
       * After successful popup auth, get the token issued for this session.
       * In an Auth0-brokered enterprise flow this token is retrieved through
       * Auth0, not by reading an id_token from an app callback URL.
       */
      const token = await getAccessTokenSilently({
        authorizationParams: {
          connection: 'insights-ai-b2c',
        },
      });

      // Persist to localStorage so state survives Auth0's post-popup re-render
      localStorage.setItem('insights_ai_connected', 'true');
      localStorage.setItem('insights_ai_token', token);
      setB2cToken(token);
      setIsConnected(true);

      console.log('✅ Successfully connected to Insights AI');
      console.log('B2C JWT Token:', token);
    } catch (error) {
      console.error('❌ Insights AI connection failed:', error);

      // Check if user closed the popup
      if (error?.error === 'popup_closed') {
        setErrorMessage('Popup was closed. Please try again.');
      } else {
        setErrorMessage(
          error?.error_description || 'Connection failed. Please try again.'
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="integrations-card">
      <div className="integrations-card-content">
        <div className="integrations-icon">🤖</div>
        <div className="integrations-text">
          <h3>Insights AI</h3>
          <p>
            Connect your Azure AD B2C account to unlock AI-powered analytics and
            advanced insights.
          </p>
        </div>
      </div>
      <a href="https://inextlabsb2ctest.b2clogin.com/inextlabsb2ctest.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN&client_id=99228fc5-ab7b-4e0b-b1b8-975255d0566e&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=openid&response_type=id_token&response_mode=fragment">
        connect
      </a>
        {/* <a href='https://inextlabsb2ctest.b2clogin.com/inextlabsb2ctest.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN&client_id=99228fc5-ab7b-4e0b-b1b8-975255d0566e&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=openid&response_type=id_token' >connect</a> */}
      {/* <div className="integrations-action">
        {!isConnected ? (
          <>
            <button
              className="btn btn-insights-ai"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="spinner-dot" />
                  Connecting…
                </>
              ) : (
                <>
                  <span className="insights-ai-icon">⚡</span>
                  Connect to Insights AI
                </>
              )}
            </button>
            {errorMessage && (
              <div className="insights-error">{errorMessage}</div>
            )}
          </>
        ) : (
          <div className="insights-success">
            <span className="success-icon">✅</span>
            <span>Connected to Insights AI</span>
            {b2cToken && (
              <span className="token-status">
                (Token stored in component state)
              </span>
            )}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ConnectInsightsAI;
