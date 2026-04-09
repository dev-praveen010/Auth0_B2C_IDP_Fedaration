import { useState } from 'react';
import DocSection from '../components/DocSection';
import InfoTable from '../components/InfoTable';
import StepCard from '../components/StepCard';
import Callout from '../components/Callout';
import CodeBlock from '../components/CodeBlock';
import ChecklistCard from '../components/ChecklistCard';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ErrorCardData {
  code: string;
  message: string;
  cause: string;
  fix: string;
}

function ErrorCard({ error, index }: { error: ErrorCardData; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-l-4 border-red-500 bg-white rounded-r-lg mb-4 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="mt-0.5 shrink-0 text-gray-400">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded">
              {error.code}
            </span>
            <span className="text-xs text-gray-400">Error #{index + 1}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{error.message}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 ml-7 space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Cause:</span> {error.cause}
          </p>
          <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
            <span className="font-semibold">Fix:</span> {error.fix}
          </p>
        </div>
      )}
    </div>
  );
}

const clientErrors: ErrorCardData[] = [
  {
    code: 'redirect_uri mismatch',
    message: 'AADB2C90014: The provided redirect_uri is not registered',
    cause: 'The redirect_uri sent in the B2C authorize request does not match what INextLabs registered in B2C. Even a trailing slash difference causes this.',
    fix: 'Check VITE_B2C_REDIRECT_URI in your frontend .env. It must be exactly what INextLabs registered (e.g. http://localhost:5173/callback). Contact INextLabs with your exact callback URL to update registration.',
  },
  {
    code: 'AADB2C90084',
    message: 'Public clients should not send a client_secret',
    cause: 'client_secret is being sent from the frontend or in the wrong request. The frontend should never include client_secret.',
    fix: 'Ensure client_secret is ONLY in the backend .env (B2C_CLIENT_SECRET). The frontend only sends the auth code + code_verifier to the backend API. The backend adds client_secret when calling the B2C token endpoint.',
  },
  {
    code: 'token_exchange_failed',
    message: 'Backend /api/b2c/token-exchange returns error',
    cause: 'Backend failed to exchange authorization code for tokens. Usually caused by wrong client_secret, expired code, or mismatched redirect_uri.',
    fix: 'Check backend terminal logs for the detailed B2C error. Verify B2C_CLIENT_SECRET is correct. Verify redirect_uri sent by frontend matches the registered one. Ensure code_verifier matches the code_challenge used in the authorize request. Contact INextLabs if credentials may have expired.',
  },
  {
    code: 'session_not_found',
    message: 'API returns 401 session_not_found',
    cause: 'The session_id in sessionStorage has expired or the backend was restarted (in-memory sessions are lost).',
    fix: 'Click "Disconnect" and then "Connect to Insights AI" again to establish a new session. In production, use Redis or a database-backed session store instead of in-memory dict.',
  },
  {
    code: 'Invalid state',
    message: 'Auth0 throws "Invalid state" after B2C callback',
    cause: 'Auth0 SDK sees the B2C callback URL with a state parameter it did not generate and throws an error. This is expected behaviour.',
    fix: 'The CallbackPage must check if the state matches the b2c_oauth_state stored in sessionStorage. If it does, treat it as a B2C callback and skip the Auth0 error. See the CallbackPage code example.',
  },
  {
    code: 'Login page does not appear',
    message: 'Clicking Connect shows error immediately or blank page',
    cause: 'B2C authorize URL is malformed, or VITE_B2C_AUTHORIZE_ENDPOINT / VITE_B2C_CLIENT_ID is missing.',
    fix: 'Check browser console for errors. Verify all VITE_B2C_* env variables are set in .env. Restart the Vite dev server after changing .env (env vars are loaded at build time).',
  },
  {
    code: 'PKCE error',
    message: 'Token exchange fails with code_verifier error',
    cause: 'The code_verifier does not match the code_challenge sent in the authorize request, or the verifier was lost from sessionStorage.',
    fix: 'Ensure code_verifier is stored in sessionStorage immediately after generation and retrieved before calling the token-exchange API. Do not clear sessionStorage between the redirect and the callback.',
  },
];

export default function ClientDocs() {
  return (
    <div>
      {/* ───────────── WHAT YOU RECEIVED ───────────── */}
      <DocSection
        id="cl-overview"
        title="What You Received From INextLabs"
        subtitle="Credentials and configuration provided by INextLabs"
        badge="Client Guide"
      >
        <p className="text-gray-700 leading-relaxed mb-6">
          INextLabs has set up Azure AD B2C with IDP federation (Auth0) for your
          application. Your app uses Auth0 for primary login and then connects to
          Azure AD B2C to access INextLabs Insights AI services. This documentation
          guides you through the full integration using a React + Vite frontend and
          a Python FastAPI backend.
        </p>

        <Callout type="info" title="Architecture Overview">
          Your app has two authentication layers:<br />
          1. <strong>Auth0</strong> — primary user login (managed by you via @auth0/auth0-react SDK)<br />
          2. <strong>Azure AD B2C</strong> — federated access to INextLabs Insights AI (triggered after Auth0 login, credentials provided by INextLabs)
        </Callout>

        <ChecklistCard
          title="B2C Credentials You Should Have Received"
          color="green"
          items={[
            { label: 'B2C Authorize Endpoint', description: 'Full authorization URL including tenant and policy', required: true, value: 'https://TENANT.b2clogin.com/TENANT.onmicrosoft.com/POLICY/oauth2/v2.0/authorize' },
            { label: 'B2C Token Endpoint', description: 'Full token exchange URL for backend', required: true, value: 'https://TENANT.b2clogin.com/TENANT.onmicrosoft.com/POLICY/oauth2/v2.0/token' },
            { label: 'B2C Client ID', description: 'Application (client) ID from B2C app registration', required: true, value: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
            { label: 'B2C Client Secret', description: 'Secret value — backend only, never expose in frontend', required: true, value: 'Your secret value' },
            { label: 'Policy Name', description: 'Custom policy name for the sign-up/sign-in flow', required: true, value: 'B2C_1A_SIGNUP_SIGNIN' },
            { label: 'B2C Scope', description: 'Scopes to request (includes API access scope)', required: true, value: 'openid offline_access https://TENANT.onmicrosoft.com/api/access_as_user' },
            { label: 'B2C Tenant Name', description: 'Tenant name used in URLs', required: true, value: 'YOUR_TENANT' },
            { label: 'B2C Issuer', description: 'Expected issuer for token verification', required: true, value: 'https://TENANT.b2clogin.com/TENANT_ID/v2.0/' },
            { label: 'Redirect URI', description: 'Registered callback URL — must match exactly', required: true, value: 'http://localhost:5173/callback' },
          ]}
        />

        <ChecklistCard
          title="Auth0 Credentials (Your Own)"
          color="blue"
          items={[
            { label: 'Auth0 Domain', description: 'Your Auth0 tenant domain', required: true, value: 'your-domain.us.auth0.com' },
            { label: 'Auth0 Client ID', description: 'Your Auth0 application client ID', required: true, value: 'Your Auth0 client ID' },
            { label: 'Auth0 Callback URL', description: 'Where Auth0 redirects after login', required: true, value: 'http://localhost:5173/callback' },
          ]}
        />
      </DocSection>

      {/* ───────────── PREREQUISITES ───────────── */}
      <DocSection
        id="cl-prerequisites"
        title="Prerequisites"
        subtitle="What you need before starting integration"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend Dependencies</h3>

        <InfoTable
          headers={['Package', 'Version', 'Purpose']}
          rows={[
            ['react', '18+', 'Frontend framework'],
            ['react-dom', '18+', 'React DOM renderer'],
            ['react-router-dom', '6+', 'Client-side routing (/, /dashboard, /callback)'],
            ['@auth0/auth0-react', '2+', 'Auth0 SDK for primary user login'],
            ['vite', '5+', 'Frontend build tool and dev server'],
            ['@vitejs/plugin-react', '4+', 'React support for Vite'],
          ]}
          striped
        />

        <CodeBlock
          language="bash"
          filename="Install frontend dependencies"
          code="npm install react react-dom react-router-dom @auth0/auth0-react"
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Backend Dependencies</h3>

        <InfoTable
          headers={['Package', 'Version', 'Purpose']}
          rows={[
            ['Python', '3.10+', 'Backend runtime'],
            ['fastapi', '0.115+', 'API framework'],
            ['uvicorn', '0.30+', 'ASGI server'],
            ['requests', '2.32+', 'HTTP client for B2C token exchange'],
            ['python-dotenv', '1.0+', 'Environment variable loading'],
            ['python-jose[cryptography]', '3.3+', 'JWT verification (RS256 with JWKS)'],
          ]}
          striped
        />

        <CodeBlock
          language="bash"
          filename="Install Python dependencies"
          code="pip install fastapi uvicorn requests python-dotenv python-jose[cryptography]"
        />

        <CodeBlock
          language="text"
          filename="requirements.txt"
          code={`fastapi==0.115.0
uvicorn==0.30.6
requests==2.32.3
python-dotenv==1.0.1
python-jose[cryptography]==3.3.0`}
        />
      </DocSection>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <DocSection
        id="cl-flow"
        title="How The Authentication Works"
        subtitle="Two-phase authentication: Auth0 login then B2C federation"
      >
        <Callout type="info" title="Dual-Auth Architecture">
          This flow has two phases:<br />
          <strong>Phase 1:</strong> User logs in via Auth0 (your primary identity provider) using the @auth0/auth0-react SDK.<br />
          <strong>Phase 2:</strong> After login, user clicks "Connect to Insights AI" which triggers Azure AD B2C federation to get a B2C session for accessing INextLabs APIs.
        </Callout>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Phase 1 — Auth0 Login</h3>

        <StepCard
          steps={[
            {
              number: 1,
              title: 'User Clicks Login',
              description: 'Auth0 SDK\'s loginWithRedirect() sends the user to Auth0\'s Universal Login page.',
            },
            {
              number: 2,
              title: 'Auth0 Authenticates',
              description: 'User logs in with their credentials on Auth0. After success, Auth0 redirects back to /callback with an authorization code.',
            },
            {
              number: 3,
              title: 'Auth0 SDK Processes Callback',
              description: 'The Auth0 SDK automatically exchanges the code for tokens and establishes a session. User lands on /dashboard.',
            },
          ]}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Phase 2 — B2C Federation (Connect to Insights AI)</h3>

        <StepCard
          steps={[
            {
              number: 1,
              title: 'User Clicks "Connect to Insights AI"',
              description: 'On the dashboard, a ConnectInsightsAI component generates a PKCE code_verifier and code_challenge, creates a random state, stores both in sessionStorage, then redirects the browser to the B2C authorize endpoint.',
            },
            {
              number: 2,
              title: 'B2C Handles Login via IDP Federation',
              description: 'Azure AD B2C shows the federated login page (which uses Auth0 as the identity provider behind the scenes). The user authenticates and B2C issues an authorization code.',
            },
            {
              number: 3,
              title: 'B2C Redirects to Frontend /callback',
              description: 'B2C redirects to your frontend /callback page with ?code=...&state=... in the URL. The CallbackPage detects this is a B2C callback (not Auth0) by matching the state with the value stored in sessionStorage.',
            },
            {
              number: 4,
              title: 'Frontend Sends Code to Backend API',
              description: 'The CallbackPage POSTs the authorization code, code_verifier, and redirect_uri to your backend POST /api/b2c/token-exchange endpoint.',
            },
            {
              number: 5,
              title: 'Backend Exchanges Code for Tokens',
              description: 'Your backend sends code + code_verifier + client_secret to the B2C token endpoint. B2C returns access_token, id_token, and refresh_token. The backend stores all tokens in an in-memory session store and returns only a session_id to the frontend.',
            },
            {
              number: 6,
              title: 'Session Established',
              description: 'The frontend stores the session_id in sessionStorage. All subsequent API calls include the session_id via an X-Session-Id header. Tokens never leave the backend.',
            },
          ]}
        />

        <Callout type="warning" title="Redirect URI Must Match">
          The redirect_uri in the B2C authorize request must match EXACTLY
          what INextLabs registered in B2C (e.g. http://localhost:5173/callback).
          Even a trailing slash difference will cause AADB2C90014.
        </Callout>

        <Callout type="tip" title="Session-Based Security">
          Raw tokens (access_token, id_token, refresh_token) are never sent to the browser.
          The frontend holds only a session_id reference. The backend manages token lifecycle
          including automatic refresh when tokens expire.
        </Callout>
      </DocSection>

      {/* ───────────── REACT FRONTEND ───────────── */}
      <DocSection
        id="cl-react"
        title="React Frontend Integration"
        subtitle="Auth0 login, B2C federation, and callback handling"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Structure</h3>

        <CodeBlock
          language="text"
          filename="Frontend project structure"
          code={`myapp-frontend/
├── src/
│   ├── main.jsx                          ← Entry point with BrowserRouter
│   ├── App.jsx                           ← Routes and Auth0Provider wrapper
│   ├── auth0-provider-with-navigate.jsx  ← Auth0 config from env vars
│   ├── components/
│   │   ├── LoginButton.jsx               ← Auth0 login trigger
│   │   ├── LogoutButton.jsx              ← Auth0 logout + cleanup
│   │   ├── NavBar.jsx                    ← Top navigation bar
│   │   ├── ProtectedRoute.jsx            ← Route guard for auth pages
│   │   └── ConnectInsightsAI.jsx         ← B2C federation trigger
│   ├── pages/
│   │   ├── HomePage.jsx                  ← Public landing page
│   │   ├── DashboardPage.jsx             ← Protected user dashboard
│   │   └── CallbackPage.jsx              ← Handles Auth0 & B2C callbacks
│   └── utils/
│       └── pkce.js                       ← PKCE code_verifier/challenge
├── .env
├── vite.config.js
└── package.json`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">1. Entry Point & Router</h3>

        <CodeBlock
          language="jsx"
          filename="src/main.jsx"
          showLineNumbers
          code={`import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">2. App Component with Routes</h3>

        <CodeBlock
          language="jsx"
          filename="src/App.jsx"
          showLineNumbers
          code={`import { Routes, Route } from 'react-router-dom';
import Auth0ProviderWithNavigate from './auth0-provider-with-navigate';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CallbackPage from './pages/CallbackPage';

const App = () => {
  return (
    <Auth0ProviderWithNavigate>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/callback" element={<CallbackPage />} />
          </Routes>
        </main>
      </div>
    </Auth0ProviderWithNavigate>
  );
};

export default App;`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">3. Auth0 Provider Wrapper</h3>

        <CodeBlock
          language="jsx"
          filename="src/auth0-provider-with-navigate.jsx"
          showLineNumbers
          code={`import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri =
    import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/dashboard');
  };

  if (!domain || !clientId) {
    return (
      <div className="error-banner">
        <h2>Auth0 Configuration Missing</h2>
        <p>
          Create a <code>.env</code> file with VITE_AUTH0_DOMAIN and
          VITE_AUTH0_CLIENT_ID. See <code>.env.example</code>.
        </p>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">4. PKCE Utility</h3>

        <Callout type="info" title="Why PKCE?">
          PKCE (Proof Key for Code Exchange) adds a layer of security to the authorization
          code flow. The frontend generates a random code_verifier and derives a code_challenge
          (SHA-256 hash). B2C receives the challenge during authorization and the backend sends the
          verifier during token exchange — B2C verifies they match.
        </Callout>

        <CodeBlock
          language="javascript"
          filename="src/utils/pkce.js"
          showLineNumbers
          code={`// Generate a random code_verifier (43-128 chars, base64url)
export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\\+/g, "-")
    .replace(/\\//g, "_")
    .replace(/=/g, "");
}

// Hash the verifier with SHA-256 to produce the code_challenge
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\\+/g, "-")
    .replace(/\\//g, "_")
    .replace(/=/g, "");
}`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">5. Connect to Insights AI Component</h3>

        <p className="text-gray-600 text-sm mb-4">
          This is the core component that initiates the B2C federation flow.
          It appears on the Dashboard after the user has logged in via Auth0.
        </p>

        <CodeBlock
          language="jsx"
          filename="src/components/ConnectInsightsAI.jsx"
          showLineNumbers
          code={`import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkce";

const ConnectInsightsAI = () => {
  const { isAuthenticated } = useAuth0();

  // Read B2C config from Vite environment variables
  const b2cAuthorizeEndpoint = import.meta.env.VITE_B2C_AUTHORIZE_ENDPOINT;
  const b2cClientId = import.meta.env.VITE_B2C_CLIENT_ID;
  const b2cScope = import.meta.env.VITE_B2C_SCOPE || "openid";
  const policyName = import.meta.env.VITE_POLICY_NAME || "B2C_1A_SIGNUP_SIGNIN";
  const callbackUrl =
    import.meta.env.VITE_B2C_REDIRECT_URI ||
    \`\${window.location.origin}/callback\`;

  const [isConnected, setIsConnected] = useState(
    () => localStorage.getItem("insights_ai_connected") === "true"
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
        throw new Error("Missing VITE_B2C_AUTHORIZE_ENDPOINT or VITE_B2C_CLIENT_ID");
      }

      // 1. Generate PKCE values
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      // 2. Generate state for CSRF protection
      const state = createRandomState();

      // 3. Store state, redirect_uri, and verifier in sessionStorage
      sessionStorage.setItem("b2c_oauth_state", state);
      sessionStorage.setItem("b2c_oauth_redirect_uri", callbackUrl);
      sessionStorage.setItem("code_verifier", verifier);

      // 4. Build B2C authorize URL
      const params = new URLSearchParams({
        p: policyName,
        client_id: b2cClientId,
        nonce: "defaultNonce",
        redirect_uri: callbackUrl,
        scope: b2cScope,
        response_type: "code",
        response_mode: "query",
        state: state,
      });

      // 5. Redirect to B2C
      window.location.assign(\`\${b2cAuthorizeEndpoint}?\${params.toString()}\`);
    } catch (error) {
      setErrorMessage(error?.message || "Connection failed.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Only render when user is Auth0-authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="integrations-card">
      {!isConnected ? (
        <>
          <button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Redirecting…" : "Connect to Insights AI"}
          </button>
          {errorMessage && <div className="error">{errorMessage}</div>}
        </>
      ) : (
        <div>
          <span>Connected to Insights AI</span>
          {/* Call external API or disconnect — see full example */}
        </div>
      )}
    </div>
  );
};

export default ConnectInsightsAI;`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">6. Callback Page (Handles Both Auth0 & B2C)</h3>

        <Callout type="warning" title="Shared /callback Route">
          Both Auth0 and B2C redirect to the same /callback URL.
          The CallbackPage distinguishes between them by checking if the
          state parameter matches the b2c_oauth_state stored in sessionStorage.
          If it matches → B2C flow. Otherwise → Auth0 flow.
        </Callout>

        <CodeBlock
          language="jsx"
          filename="src/pages/CallbackPage.jsx"
          showLineNumbers
          code={`import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CallbackPage = () => {
  const { isLoading, error } = useAuth0();
  const navigate = useNavigate();
  const [b2cExchangeState, setB2cExchangeState] = useState({
    status: "idle", message: "", data: null,
  });

  // Determine if this is a B2C or Auth0 callback
  const callbackData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const expectedState = sessionStorage.getItem("b2c_oauth_state");
    const storedRedirectUri = sessionStorage.getItem("b2c_oauth_redirect_uri");

    const isB2cCodeCallback =
      Boolean(code) && Boolean(expectedState) && state === expectedState;
    const isAuth0CodeCallback = Boolean(code) && !isB2cCodeCallback;

    return {
      code, state, expectedState, storedRedirectUri,
      isB2cCodeCallback, isAuth0CodeCallback,
      error: params.get("error"),
      errorDescription: params.get("error_description"),
    };
  }, []);

  // B2C code exchange — send code to backend
  useEffect(() => {
    if (!callbackData.isB2cCodeCallback || b2cExchangeState.status !== "idle")
      return;

    const exchangeCode = async () => {
      setB2cExchangeState({ status: "loading", message: "", data: null });

      try {
        const verifier = sessionStorage.getItem("code_verifier");

        const response = await fetch("/api/b2c/token-exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: callbackData.code,
            code_verifier: verifier,
            redirect_uri:
              callbackData.storedRedirectUri ||
              \`\${window.location.origin}/callback\`,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.error_description || data?.error || "Token exchange failed."
          );
        }

        // Store session_id — tokens stay on the backend
        localStorage.setItem("insights_ai_connected", "true");
        if (data.session_id) {
          sessionStorage.setItem("b2c_session_id", data.session_id);
        }

        // Clean up OAuth state
        sessionStorage.removeItem("b2c_oauth_state");
        sessionStorage.removeItem("b2c_oauth_redirect_uri");

        setB2cExchangeState({ status: "success", message: "", data });
      } catch (err) {
        setB2cExchangeState({
          status: "error", message: err.message, data: null,
        });
      }
    };

    exchangeCode();
  }, [b2cExchangeState.status, callbackData]);

  // Skip Auth0 "Invalid state" error when this is a B2C callback
  if (error && !callbackData.isB2cCodeCallback) {
    return <div className="error-banner"><p>{error.message}</p></div>;
  }

  if (callbackData.isB2cCodeCallback && b2cExchangeState.status === "loading") {
    return <p>Exchanging authorization code via backend...</p>;
  }

  if (callbackData.isB2cCodeCallback && b2cExchangeState.status === "error") {
    return (
      <div>
        <h2>B2C Token Exchange Failed</h2>
        <p>{b2cExchangeState.message}</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  if (callbackData.isB2cCodeCallback && b2cExchangeState.status === "success") {
    return (
      <div>
        <h1>Insights AI Connected</h1>
        <p>Session established. Tokens managed securely on the backend.</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  // Auth0 callback — SDK handles automatically
  if (callbackData.isAuth0CodeCallback || isLoading) {
    return <p>Completing Auth0 sign-in...</p>;
  }

  return <p>Processing callback...</p>;
};

export default CallbackPage;`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">7. Using the Session for API Calls</h3>

        <CodeBlock
          language="jsx"
          filename="Calling external APIs via the backend"
          showLineNumbers
          code={`// Send the session_id with every API request via X-Session-Id header.
// The backend looks up the session, verifies the B2C access token,
// auto-refreshes if expired, and forwards the request.

const callExternalApi = async () => {
  const sessionId = sessionStorage.getItem("b2c_session_id");
  if (!sessionId) {
    throw new Error("No active B2C session. Please reconnect.");
  }

  const response = await fetch("/api/external", {
    headers: { "X-Session-Id": sessionId },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || "API call failed.");
  }
  return data;
};`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">8. Disconnect / Cleanup</h3>

        <CodeBlock
          language="jsx"
          filename="Disconnect from Insights AI"
          showLineNumbers
          code={`const handleDisconnect = async () => {
  const sessionId = sessionStorage.getItem("b2c_session_id");

  try {
    if (sessionId) {
      await fetch("/api/b2c/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    }
  } finally {
    // Always clean up local state
    localStorage.removeItem("insights_ai_connected");
    sessionStorage.removeItem("b2c_session_id");
    sessionStorage.removeItem("b2c_oauth_state");
    sessionStorage.removeItem("b2c_oauth_redirect_uri");
    sessionStorage.removeItem("code_verifier");
  }
};`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">9. Vite Proxy Configuration</h3>

        <Callout type="info" title="Why a Proxy?">
          The Vite dev server proxies /api/* requests to your backend at localhost:8000.
          This avoids CORS issues during development and keeps the frontend clean —
          frontend code calls /api/b2c/token-exchange instead of http://localhost:8000/api/b2c/token-exchange.
        </Callout>

        <CodeBlock
          language="javascript"
          filename="vite.config.js"
          showLineNumbers
          code={`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});`}
        />
      </DocSection>

      {/* ───────────── PYTHON BACKEND ───────────── */}
      <DocSection
        id="cl-python"
        title="Python Backend Integration"
        subtitle="FastAPI backend with session-based token management"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Structure</h3>

        <CodeBlock
          language="text"
          filename="Backend project structure"
          code={`backend/
├── app.py              ← Single-file FastAPI app with all routes
├── requirements.txt
├── .env                ← B2C credentials (never commit)
└── .env.example        ← Template for other developers`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Complete Backend (app.py)</h3>

        <p className="text-gray-600 text-sm mb-4">
          The backend is a single-file FastAPI app that handles token exchange,
          session management, token verification, automatic refresh, and external
          API proxying.
        </p>

        <CodeBlock
          language="python"
          filename="app.py — Token Exchange Endpoint"
          showLineNumbers
          code={`import os
import secrets
import time
from typing import Any, Dict, Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="B2C Token Exchange API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store — use Redis in production
_sessions: Dict[str, Dict[str, Any]] = {}


def generate_session_id() -> str:
    return secrets.token_urlsafe(32)


class TokenExchangeRequest(BaseModel):
    code: str
    redirect_uri: str
    code_verifier: str


@app.post("/api/b2c/token-exchange")
def exchange_b2c_code(payload: TokenExchangeRequest) -> Dict[str, str]:
    """Exchange a B2C authorization code for tokens.

    Tokens are stored server-side. The client receives only a session_id.
    """
    form_data = {
        "grant_type": "authorization_code",
        "client_id": os.getenv("B2C_CLIENT_ID"),
        "client_secret": os.getenv("B2C_CLIENT_SECRET"),
        "code": payload.code,
        "redirect_uri": payload.redirect_uri,
        "code_verifier": payload.code_verifier,
        "scope": os.getenv("B2C_SCOPE", "openid offline_access"),
    }

    response = requests.post(
        os.getenv("B2C_TOKEN_ENDPOINT"), data=form_data, timeout=20
    )
    body = response.json()

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                "error": body.get("error", "token_exchange_failed"),
                "error_description": body.get("error_description"),
            },
        )

    session_id = generate_session_id()
    _sessions[session_id] = {
        "access_token": body.get("access_token"),
        "id_token": body.get("id_token"),
        "refresh_token": body.get("refresh_token"),
        "expires_at": time.time() + int(body.get("expires_in", 3600)),
    }

    return {"session_id": session_id}`}
        />

        <CodeBlock
          language="python"
          filename="app.py — Token Refresh & Session Endpoints"
          showLineNumbers
          code={`class RefreshRequest(BaseModel):
    session_id: str

class DisconnectRequest(BaseModel):
    session_id: str


@app.post("/api/b2c/refresh")
def refresh_b2c_token(payload: RefreshRequest) -> Dict[str, bool]:
    """Silently refresh the B2C access token using stored refresh token."""
    session = _sessions.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=401, detail={"error": "session_not_found"})

    refresh_token = session.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail={"error": "no_refresh_token",
                     "error_description": "Re-authentication required."},
        )

    form_data = {
        "grant_type": "refresh_token",
        "client_id": os.getenv("B2C_CLIENT_ID"),
        "client_secret": os.getenv("B2C_CLIENT_SECRET"),
        "refresh_token": refresh_token,
        "scope": os.getenv("B2C_SCOPE", "openid offline_access"),
    }

    response = requests.post(
        os.getenv("B2C_TOKEN_ENDPOINT"), data=form_data, timeout=20
    )
    body = response.json()

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail={"error": body.get("error"), "error_description": body.get("error_description")},
        )

    _sessions[payload.session_id] = {
        "access_token": body.get("access_token"),
        "id_token": body.get("id_token", session.get("id_token")),
        "refresh_token": body.get("refresh_token") or refresh_token,
        "expires_at": time.time() + int(body.get("expires_in", 3600)),
    }
    return {"ok": True}


@app.post("/api/b2c/disconnect")
def disconnect_b2c_session(payload: DisconnectRequest) -> Dict[str, bool]:
    """Remove a B2C session from the store."""
    _sessions.pop(payload.session_id, None)
    return {"ok": True}`}
        />

        <CodeBlock
          language="python"
          filename="app.py — External API Proxy with Auto-Refresh"
          showLineNumbers
          code={`@app.get("/api/external")
def call_external_api(
    x_session_id: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    """Call an external API on behalf of the user.

    1. Look up session by X-Session-Id header
    2. Verify the stored access token (RS256, audience, issuer, expiry)
    3. If expired → silently refresh and re-verify
    4. Forward request to external API with Bearer auth
    """
    if not x_session_id or x_session_id not in _sessions:
        raise HTTPException(status_code=401, detail={"error": "session_not_found"})

    access_token = _sessions[x_session_id].get("access_token", "")

    # Verify token — auto-refresh if expired
    try:
        verify_b2c_token(access_token)
    except HTTPException as exc:
        if exc.status_code == 401:
            # Attempt silent refresh
            _do_refresh(x_session_id)
            access_token = _sessions[x_session_id].get("access_token", "")
            verify_b2c_token(access_token)
        else:
            raise

    external_api_url = os.getenv("EXTERNAL_API_URL", "https://httpbin.org/bearer")

    api_response = requests.get(
        external_api_url,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=15,
    )
    return {"status": api_response.status_code, "data": api_response.json()}`}
        />

        <CodeBlock
          language="python"
          filename="app.py — B2C Token Verification (JWKS)"
          showLineNumbers
          code={`# JWKS cache
_jwks_cache: Dict[str, Any] = {}
_JWKS_TTL = 3600  # 1 hour

def get_b2c_jwks() -> list:
    """Fetch and cache B2C public keys with a 1-hour TTL."""
    now = time.time()
    if _jwks_cache.get("keys") and now - _jwks_cache.get("fetched_at", 0) < _JWKS_TTL:
        return _jwks_cache["keys"]

    tenant = os.getenv("B2C_TENANT")
    policy = os.getenv("B2C_POLICY")
    jwks_url = (
        f"https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com"
        f"/{policy}/discovery/v2.0/keys"
    )

    resp = requests.get(jwks_url, timeout=10)
    resp.raise_for_status()
    keys = resp.json().get("keys", [])
    _jwks_cache["keys"] = keys
    _jwks_cache["fetched_at"] = now
    return keys


def verify_b2c_token(token: str) -> Dict[str, Any]:
    """Verify a B2C JWT: signature (RS256), audience, issuer, expiry."""
    client_id = os.getenv("B2C_CLIENT_ID")
    issuer = os.getenv("B2C_ISSUER")
    keys = get_b2c_jwks()

    try:
        claims = jwt.decode(
            token, keys, algorithms=["RS256"],
            audience=client_id, issuer=issuer,
        )
        return claims
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail={"error": "token_invalid", "error_description": str(exc)},
        )`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Run The Backend</h3>

        <CodeBlock
          language="bash"
          filename="Start the server"
          code={`# Using uvicorn directly
uvicorn app:app --reload --port 8000

# Or using python
python app.py`}
        />
      </DocSection>

      {/* ───────────── ENVIRONMENT VARIABLES ───────────── */}
      <DocSection
        id="cl-env"
        title="Environment Variables"
        subtitle="Configuration for both frontend and backend"
      >
        <Callout type="error" title="Security Warning">
          Never commit .env files to git. Add .env to .gitignore immediately.
          B2C_CLIENT_SECRET must ONLY exist in the backend .env — never in frontend code.
        </Callout>

        <CodeBlock
          language="env"
          filename=".env (Python Backend)"
          code={`# Server
PORT=8000

# Azure AD B2C confidential client settings (provided by INextLabs)
B2C_TOKEN_ENDPOINT=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/token
B2C_CLIENT_ID=<your-b2c-client-id>
B2C_CLIENT_SECRET=<your-b2c-client-secret>
B2C_SCOPE=openid offline_access https://<tenant>.onmicrosoft.com/<api>/access_as_user
B2C_TENANT=<tenant-name>
B2C_POLICY=B2C_1A_SIGNUP_SIGNIN
B2C_ISSUER=https://<tenant>.b2clogin.com/<tenant-id>/v2.0/`}
        />

        <CodeBlock
          language="env"
          filename=".env (React Frontend — Vite)"
          code={`# Auth0 Configuration (your own Auth0 app)
VITE_AUTH0_DOMAIN=your-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/callback

# Azure AD B2C front-channel authorize config (provided by INextLabs)
VITE_B2C_AUTHORIZE_ENDPOINT=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/authorize
VITE_B2C_CLIENT_ID=<your-b2c-client-id>
VITE_B2C_REDIRECT_URI=http://localhost:5173/callback
VITE_B2C_SCOPE=openid offline_access https://<tenant>.onmicrosoft.com/<api>/access_as_user
VITE_POLICY_NAME=B2C_1A_SIGNUP_SIGNIN`}
        />

        <CodeBlock
          language="text"
          filename=".gitignore"
          code={`# Environment files
.env
.env.local
.env.production`}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Variable Reference</h3>

        <InfoTable
          headers={['Variable', 'Where', 'Description']}
          rows={[
            ['VITE_AUTH0_DOMAIN', 'Frontend', 'Your Auth0 tenant domain (e.g. dev-xxx.us.auth0.com)'],
            ['VITE_AUTH0_CLIENT_ID', 'Frontend', 'Your Auth0 application client ID'],
            ['VITE_AUTH0_CALLBACK_URL', 'Frontend', 'Auth0 post-login redirect (http://localhost:5173/callback)'],
            ['VITE_B2C_AUTHORIZE_ENDPOINT', 'Frontend', 'Full B2C authorize URL (provided by INextLabs)'],
            ['VITE_B2C_CLIENT_ID', 'Frontend + Backend', 'B2C application client ID (provided by INextLabs)'],
            ['VITE_B2C_REDIRECT_URI', 'Frontend', 'Must match exactly what INextLabs registered in B2C'],
            ['VITE_B2C_SCOPE', 'Frontend', 'Scopes including API access scope'],
            ['VITE_POLICY_NAME', 'Frontend', 'B2C custom policy name (B2C_1A_SIGNUP_SIGNIN)'],
            ['B2C_TOKEN_ENDPOINT', 'Backend', 'Full B2C token exchange URL (provided by INextLabs)'],
            ['B2C_CLIENT_SECRET', 'Backend ONLY', 'B2C client secret — never expose in frontend'],
            ['B2C_SCOPE', 'Backend', 'Scopes requested during token exchange'],
            ['B2C_TENANT', 'Backend', 'B2C tenant name for JWKS URL construction'],
            ['B2C_POLICY', 'Backend', 'Policy name for JWKS URL construction'],
            ['B2C_ISSUER', 'Backend', 'Expected JWT issuer for token verification'],
          ]}
          striped
        />
      </DocSection>

      {/* ───────────── TESTING ───────────── */}
      <DocSection
        id="cl-testing"
        title="Test Your Integration"
        subtitle="Verify the complete dual-auth flow"
      >
        <StepCard
          steps={[
            {
              number: 1,
              title: 'Start Your Backend',
              description: 'Run your FastAPI server:',
              code: {
                content: 'cd backend\nuvicorn app:app --reload --port 8000',
                language: 'bash',
                filename: 'Terminal 1 — Backend',
              },
            },
            {
              number: 2,
              title: 'Start Your Frontend',
              description: 'Run your Vite dev server (proxy will forward /api to backend):',
              code: {
                content: 'cd myapp-frontend\nnpm run dev',
                language: 'bash',
                filename: 'Terminal 2 — Frontend',
              },
            },
            {
              number: 3,
              title: 'Log In with Auth0',
              description: 'Open http://localhost:5173 in browser. Click "Log In". You should be redirected to the Auth0 Universal Login page. After entering credentials, you land on /dashboard.',
            },
            {
              number: 4,
              title: 'Connect to Insights AI',
              description: 'On the dashboard, find the "Connected Apps" section and click "Connect to Insights AI". You should be redirected to the B2C login page (which uses Auth0 federation).',
            },
            {
              number: 5,
              title: 'Complete B2C Login',
              description: 'Authenticate on the B2C page. After success, you\'re redirected to /callback. The page shows "Exchanging authorization code via backend..." then "Insights AI Connected".',
            },
            {
              number: 6,
              title: 'Verify Session Established',
              description: 'Open browser DevTools → Application → Session Storage. You should see b2c_session_id stored. Local Storage should have insights_ai_connected = true.',
            },
            {
              number: 7,
              title: 'Test External API Call',
              description: 'Return to dashboard and click "Test External API". The backend verifies the B2C access token and forwards the request. Check backend logs for "Token claims:" output.',
            },
            {
              number: 8,
              title: 'Test Disconnect',
              description: 'Click "Disconnect Insights AI". This calls POST /api/b2c/disconnect on the backend and clears all local storage/session storage related to B2C.',
            },
          ]}
        />

        <Callout type="tip" title="Debugging Tips">
          If the B2C login redirects fail, check the browser console for errors.
          If token exchange fails, check the backend terminal for the detailed B2C error response.
          If "Invalid state" appears, ensure the CallbackPage properly distinguishes B2C vs Auth0 callbacks.
        </Callout>
      </DocSection>

      {/* ───────────── VERIFY TOKEN ───────────── */}
      <DocSection
        id="cl-token"
        title="Token Verification"
        subtitle="How the backend verifies B2C access tokens"
      >
        <p className="text-gray-700 text-sm mb-4">
          In this architecture, token verification happens entirely on the backend.
          The frontend never sees raw tokens — it only has a session_id.
          The backend verifies every access token before forwarding API requests.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">How Backend Verification Works</h3>

        <StepCard
          steps={[
            {
              number: 1,
              title: 'Frontend sends X-Session-Id header',
              description: 'Every API request from the frontend includes the session_id in the X-Session-Id header.',
            },
            {
              number: 2,
              title: 'Backend looks up the session',
              description: 'The backend finds the stored access_token, id_token, and refresh_token for that session_id.',
            },
            {
              number: 3,
              title: 'Backend verifies the access_token',
              description: 'Uses python-jose to verify the JWT signature (RS256) against B2C\'s JWKS public keys, checks audience matches B2C_CLIENT_ID, and checks issuer matches B2C_ISSUER.',
            },
            {
              number: 4,
              title: 'Auto-refresh if expired',
              description: 'If the access_token is expired, the backend automatically uses the stored refresh_token to get a new access_token from B2C — no user interaction needed.',
            },
          ]}
        />

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Common Token Claims</h3>

        <InfoTable
          headers={['Claim', 'Description', 'Example Value']}
          rows={[
            ['sub', 'Unique user identifier in B2C', '141aff77-8942-4f29-...'],
            ['email', 'User email address', 'user@example.com'],
            ['name', 'Display name', 'John Doe'],
            ['idp', 'Identity provider used (Auth0 federation)', 'auth0-clienta'],
            ['exp', 'Token expiry (Unix timestamp)', '1775372286'],
            ['iss', 'Token issuer (B2C tenant)', 'https://tenant.b2clogin.com/tenant-id/v2.0/'],
            ['aud', 'Audience (your B2C client_id)', '99228fc5-ab7b-...'],
          ]}
          striped
        />

        <Callout type="warning" title="JWKS Caching">
          The backend caches B2C public keys (JWKS) for 1 hour to avoid
          fetching them on every request. If B2C rotates keys, the cache
          refreshes automatically after the TTL expires.
        </Callout>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Debug: Decode a JWT Locally</h3>

        <CodeBlock
          language="python"
          filename="Decode token payload (debugging only)"
          showLineNumbers
          code={`import base64
import json

def decode_jwt_payload(token: str) -> dict:
    """Decode JWT payload without verification. For debugging only."""
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
    payload = parts[1]
    payload += '=' * (4 - len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload))

# Usage (from backend session store or logs)
claims = decode_jwt_payload("eyJ...")
print(json.dumps(claims, indent=2))`}
        />
      </DocSection>

      {/* ───────────── COMMON ERRORS ───────────── */}
      <DocSection
        id="cl-errors"
        title="Common Errors & Fixes"
        subtitle="Errors you may encounter during integration"
      >
        <p className="text-gray-500 text-sm mb-4">
          Click on an error to expand and see the cause and fix.
        </p>

        {clientErrors.map((error, index) => (
          <ErrorCard key={error.code} error={error} index={index} />
        ))}
      </DocSection>

      {/* ───────────── CONTACT ───────────── */}
      <DocSection
        id="cl-contact"
        title="Contact INextLabs Support"
        subtitle="When to reach out and what information to provide"
        badge="Support"
      >
        <Callout type="info" title="Check First">
          Before contacting support, check the Common Errors section above
          and review your backend terminal logs carefully.
        </Callout>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">When To Contact INextLabs</h3>

        <InfoTable
          headers={['Situation', 'Action']}
          rows={[
            ['redirect_uri mismatch error', 'Share your exact frontend callback URL for B2C registration update'],
            ['Credentials not working', 'Request credential verification or rotation'],
            ['B2C policy errors (AADB2C codes)', 'Share full error + correlation ID from error message'],
            ['Login worked before but stopped', 'Likely Auth0 secret rotation — contact INextLabs immediately'],
            ['Need additional claims in token', 'Request policy update from INextLabs'],
            ['Need additional B2C scopes', 'Request scope registration for your API'],
            ['Production deployment', 'Share production callback URL for B2C registration'],
          ]}
        />

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Information To Include In Support Request</h3>

        <ChecklistCard
          title="Include in Support Message"
          color="green"
          items={[
            { label: 'Error code or message', description: 'Full error text from backend logs (includes B2C error_description)', required: true },
            { label: 'Correlation ID', description: 'Found in B2C error descriptions — helps trace the exact request', required: true },
            { label: 'Timestamp', description: 'When the error occurred (with timezone)', required: true },
            { label: 'Backend terminal logs', description: 'Full token exchange response logged by the backend', required: true },
            { label: 'Browser console errors', description: 'Screenshot or copy of browser console (DevTools → Console)', required: false },
            { label: 'Session Storage state', description: 'Values of b2c_oauth_state, code_verifier, b2c_session_id', required: false },
          ]}
        />

        <Callout type="tip" title="Correlation ID">
          The Correlation ID is the most important piece of information
          for INextLabs to diagnose B2C issues. It appears in error_description
          strings returned by B2C. Always include it in support requests.
        </Callout>
      </DocSection>
    </div>
  );
}
