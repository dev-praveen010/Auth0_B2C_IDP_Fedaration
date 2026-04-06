import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CallbackPage — Auth0 redirects the user here after authentication.
 *
 * This page can handle two callback styles:
 * 1) Auth0 code callback (/callback?code=...) handled by Auth0 SDK.
 * 2) Direct B2C id_token callback (/callback#id_token=... or ?id_token=...).
 *
 * For B2C JWT debugging, we decode and render token claims when id_token
 * is present in URL. If URL has no id_token, we also try localStorage
 * fallback from the Insights connection flow.
 */
const CallbackPage = () => {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();

  const extractParams = () => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    return {
      idToken: params.get('id_token') || hashParams.get('id_token'),
      accessToken: params.get('access_token') || hashParams.get('access_token'),
      state: params.get('state') || hashParams.get('state'),
      code: params.get('code') || hashParams.get('code'),
      error: params.get('error') || hashParams.get('error'),
      errorDescription:
        params.get('error_description') || hashParams.get('error_description'),
    };
  };

  const decodeJwt = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const decodePart = (value) => {
        const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
        return JSON.parse(window.atob(padded));
      };

      return {
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
        signature: parts[2],
      };
    } catch {
      return null;
    }
  };

  const callbackData = useMemo(() => {
    const params = extractParams();
    const fallbackToken = localStorage.getItem('insights_ai_token');
    const token = params.idToken || fallbackToken;

    if (!token) {
      return {
        source: null,
        token: null,
        decoded: null,
        params,
      };
    }

    return {
      source: params.idToken ? 'url' : 'localStorage',
      token,
      decoded: decodeJwt(token),
      params,
    };
  }, []);

  if (error) {
    return (
      <div className="page fade-in">
        <div className="error-banner">
          <h2>Authentication Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (callbackData.params.error) {
    return (
      <div className="page fade-in">
        <div className="error-banner">
          <h2>Callback Error</h2>
          <p>{callbackData.params.errorDescription || callbackData.params.error}</p>
        </div>
      </div>
    );
  }

  if (isLoading && !callbackData.token) {
    return (
      <div className="page fade-in">
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p>Completing sign-in...</p>
        </div>
      </div>
    );
  }

  if (!callbackData.token) {
    return (
      <div className="page fade-in">
        <div className="error-banner">
          <h2>No B2C Token Found</h2>
          <p>
            No id_token was found in callback URL and no fallback token exists in
            localStorage.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!callbackData.decoded) {
    return (
      <div className="page fade-in">
        <div className="error-banner">
          <h2>Invalid JWT</h2>
          <p>Token exists but could not be decoded as a valid JWT.</p>
        </div>
      </div>
    );
  }

  const { header, payload } = callbackData.decoded;

  return (
    <div className="page fade-in">
      <div className="b2c-callback-container">
        <div className="callback-header">
          <h1>B2C JWT Decoder</h1>
          <p className="callback-subtitle">
            Token source: <strong>{callbackData.source}</strong>
            {isAuthenticated ? ' | Auth0 session is active' : ''}
          </p>
        </div>

        <div className="token-section">
          <h2>JWT Header</h2>
          <pre className="json-block">{JSON.stringify(header, null, 2)}</pre>
        </div>

        <div className="token-section">
          <h2>JWT Payload</h2>
          <pre className="json-block">{JSON.stringify(payload, null, 2)}</pre>
        </div>

        <div className="token-section">
          <h2>Callback Params</h2>
          <pre className="json-block">{JSON.stringify(callbackData.params, null, 2)}</pre>
        </div>

        <div className="callback-actions">
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;
