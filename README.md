# Azure AD B2C + Auth0 Federation Demo

A demo application showcasing **Azure AD B2C** federated authentication with **Auth0** as an external Identity Provider (IDP). Users authenticate via Auth0 through B2C custom policies, and the backend securely exchanges authorization codes for tokens.

## Architecture

| Layer             | Technology         | Purpose                          |
| ----------------- | ------------------ | -------------------------------- |
| Frontend          | React 18 + Vite    | SPA with Auth0 login & B2C flow  |
| Backend           | Python FastAPI     | Token exchange & session mgmt    |
| Identity Platform | Azure AD B2C (IEF) | Central auth server + token issuer |
| External IDP      | Auth0              | User authentication              |

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- Azure AD B2C tenant with custom policies uploaded
- Auth0 tenant (Regular Web Application — **not** SPA)

## Project Structure

```
├── backend/                  # FastAPI backend for token exchange
│   ├── app.py
│   └── requirements.txt
├── my-app/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # NavBar, LoginButton, ConnectInsightsAI, etc.
│   │   ├── pages/            # HomePage, DashboardPage, CallbackPage
│   │   └── utils/            # PKCE helpers
│   ├── package.json
│   └── vite.config.js
└── custompolicy files/       # Azure AD B2C IEF custom policy XMLs
```

## Getting Started

### 1. Backend

```bash
cd backend
python -m venv ../.venv
..\.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
PORT=8000
B2C_TOKEN_ENDPOINT=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/token
B2C_CLIENT_ID=<b2c-client-id>
B2C_CLIENT_SECRET=<b2c-client-secret>
B2C_SCOPE=openid offline_access
B2C_TENANT=<tenant>
B2C_POLICY=<policy-name>
B2C_ISSUER=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/v2.0
```

Start the server:

```bash
python app.py
```

Backend runs at **http://localhost:8000**.

### 2. Frontend

```bash
cd my-app
npm install
```

Create a `.env` file in `my-app/`:

```env
VITE_AUTH0_DOMAIN=<auth0-domain>
VITE_AUTH0_CLIENT_ID=<auth0-client-id>
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/callback
VITE_B2C_AUTHORIZE_ENDPOINT=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/authorize
VITE_B2C_CLIENT_ID=<b2c-client-id>
VITE_B2C_REDIRECT_URI=http://localhost:5173/callback
VITE_B2C_SCOPE=openid offline_access
VITE_POLICY_NAME=<policy-name>
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at **http://localhost:5173**. The Vite dev server proxies `/api` requests to the backend.

### 3. Custom Policies

Upload policies to Azure AD B2C → Identity Experience Framework in this order:

1. `TrustFrameworkBase.xml`
2. `TrustFrameworkLocalization.xml`
3. `TrustFrameworkExtensions.xml`
4. `SignUpOrSignin.xml`
5. `ProfileEdit.xml`
6. `PasswordReset.xml`

## Authentication Flow

1. User clicks login → redirected to Azure AD B2C
2. B2C federates to Auth0 (backend OIDC call with client secret)
3. Auth0 authenticates the user and returns a code to B2C
4. B2C issues an authorization code to the frontend `/callback`
5. Frontend sends the code to the backend
6. Backend exchanges the code for tokens using the client secret
7. User is authenticated and redirected to the dashboard

## Documentation

Full setup guide and internal documentation:
**https://dev-praveen010.github.io/B2C_IDP_Federation_Docs/**
