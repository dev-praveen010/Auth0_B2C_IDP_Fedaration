import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkce";

/**
 * Starts a direct Azure AD B2C Authorization Code flow (front-channel only).
 * The sensitive code exchange (client_secret usage) is performed by the
 * Python backend from the /callback page.
 */
const ConnectInsightsAI = () => {
  const { isAuthenticated } = useAuth0();

  const b2cAuthorizeEndpoint = import.meta.env.VITE_B2C_AUTHORIZE_ENDPOINT;
  const b2cClientId = import.meta.env.VITE_B2C_CLIENT_ID;
  const b2cScope = import.meta.env.VITE_B2C_SCOPE || "openid";
  const policyName = import.meta.env.VITE_POLICY_NAME || "B2C_1A_SIGNUP_SIGNIN";
  const callbackUrl =
    import.meta.env.VITE_B2C_REDIRECT_URI ||
    `${window.location.origin}/callback`;

  const [isConnected, setIsConnected] = useState(
    () => localStorage.getItem("insights_ai_connected") === "true",
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const callExternalApi = async () => {
    setApiLoading(true);
    setApiError(null);
    setApiResult(null);
    try {
      const sessionId = sessionStorage.getItem("b2c_session_id");
      if (!sessionId) {
        throw new Error("No active B2C session. Please reconnect.");
      }
      const response = await fetch("/api/external", {
        headers: { "X-Session-Id": sessionId },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error_description || data?.error || "API call failed.");
      }
      setApiResult(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setApiLoading(false);
    }
  };

  const createRandomState = () => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleConnect = async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      if (!b2cAuthorizeEndpoint || !b2cClientId) {
        throw new Error(
          "Missing VITE_B2C_AUTHORIZE_ENDPOINT or VITE_B2C_CLIENT_ID in .env.",
        );
      }

      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      const state = createRandomState();
      sessionStorage.setItem("b2c_oauth_state", state);
      sessionStorage.setItem("b2c_oauth_redirect_uri", callbackUrl);

      sessionStorage.setItem('code_verifier', verifier);

      const params = new URLSearchParams({
        p: policyName,
        client_id: b2cClientId,
        nonce: "defaultNonce",
        redirect_uri: callbackUrl,
        scope: b2cScope,
        response_type: "code",
        response_mode: "query",
        state: state
      });
      console.log('params',params.toString());
      window.location.assign(`${b2cAuthorizeEndpoint}?${params.toString()}`);
    } catch (error) {
      console.error("B2C authorization redirect failed:", error);
      setErrorMessage(error?.message || "Connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setErrorMessage(null);
    setApiError(null);
    setApiResult(null);
    setIsDisconnecting(true);

    const sessionId = sessionStorage.getItem("b2c_session_id");

    try {
      if (sessionId) {
        await fetch("/api/b2c/disconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
      }
    } catch {
      // Local cleanup still ensures the browser disconnects from Insights AI state.
    } finally {
      localStorage.removeItem("insights_ai_connected");
      sessionStorage.removeItem("b2c_session_id");
      sessionStorage.removeItem("b2c_oauth_state");
      sessionStorage.removeItem("b2c_oauth_redirect_uri");
      sessionStorage.removeItem("code_verifier");
      setIsConnected(false);
      setIsDisconnecting(false);
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

      <div className="integrations-action">
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
                  Redirecting…
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
            <div>
              <span className="success-icon">✅</span>
              <span>Connected to Insights AI</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={callExternalApi}
              disabled={apiLoading}
              style={{ marginTop: "0.75rem" }}
            >
              {apiLoading ? "Calling API…" : "Test External API"}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              style={{ marginTop: "0.5rem" }}
            >
              {isDisconnecting ? "Disconnecting…" : "Disconnect Insights AI"}
            </button>
            {apiError && (
              <div className="insights-error" style={{ marginTop: "0.5rem" }}>
                {apiError}
              </div>
            )}
            {apiResult && (
              <pre
                className="json-block"
                style={{ marginTop: "0.5rem", textAlign: "left" }}
              >
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectInsightsAI;
