# Auth0 React Demo

A production-ready React application with Auth0 authentication, built with Vite.

## Features

- **Auth0 Universal Login** — secure, hosted authentication
- **Protected Routes** — route guards redirect unauthenticated users
- **Session Persistence** — uses `localStorage` so sessions survive page refresh
- **User Profile Dashboard** — displays avatar, name, email, and Auth0 ID
- **Responsive Design** — works on desktop and mobile

---

## Prerequisites

- [Node.js](https://nodejs.org/) 16+ and npm
- A free [Auth0](https://auth0.com/) account

---

## 1. Create an Auth0 Account & Application

1. Go to [https://auth0.com/signup](https://auth0.com/signup) and create a free account.
2. After signing in, navigate to **Applications → Applications** in the left sidebar.
3. Click **+ Create Application**.
4. Enter a name (e.g. "My React App"), select **Single Page Web Applications**, and click **Create**.
5. Open the **Settings** tab of your new application.

---

## 2. Configure Auth0 Application Settings

In your application's **Settings** tab, scroll down and set the following fields:

| Setting                        | Value                                |
| ------------------------------ | ------------------------------------ |
| **Allowed Callback URLs**      | `http://localhost:5173/callback`     |
| **Allowed Logout URLs**        | `http://localhost:5173`              |
| **Allowed Web Origins**        | `http://localhost:5173`              |

> **Tip:** For production, replace `http://localhost:5173` with your actual deployed URL. You can add multiple URLs separated by commas.

Scroll to the bottom and click **Save Changes**.

---

## 3. Copy Credentials into `.env`

1. In the Auth0 **Settings** tab, locate **Domain** and **Client ID**.
2. In the project root, copy the example env file:

   ```bash
   cp .env.example .env
   ```

3. Open `.env` and fill in your values:

   ```env
   VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
   VITE_AUTH0_CLIENT_ID=aBcDeFgHiJkLmNoPqRsTuVwXyZ012345
   VITE_AUTH0_CALLBACK_URL=http://localhost:5173/callback
   VITE_AUTH0_AUDIENCE=https://your-api-identifier
   ```

   - `VITE_AUTH0_DOMAIN` — your Auth0 tenant domain (from Settings → Domain)
   - `VITE_AUTH0_CLIENT_ID` — the Client ID (from Settings → Client ID)
   - `VITE_AUTH0_CALLBACK_URL` — must match one of the Allowed Callback URLs
   - `VITE_AUTH0_AUDIENCE` — *(optional)* only needed if you are calling a protected API

> **Important:** Never commit your `.env` file to version control. Add it to `.gitignore`.

---

## 4. Run the Application

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
my-app/
├── package.json                          # Dependencies and scripts
├── vite.config.js                        # Vite configuration
├── index.html                            # HTML entry point
├── .env.example                          # Environment variable template
├── .env                                  # Your actual credentials (git-ignored)
├── src/
│   ├── main.jsx                          # React entry — mounts the app
│   ├── App.jsx                           # Root component with routes
│   ├── auth0-provider-with-navigate.jsx  # Custom Auth0Provider wrapper
│   ├── index.css                         # Global styles
│   ├── pages/
│   │   ├── HomePage.jsx                  # Public landing page
│   │   ├── DashboardPage.jsx             # Protected user profile page
│   │   └── CallbackPage.jsx              # Auth0 redirect handler
│   └── components/
│       ├── NavBar.jsx                    # Top navigation bar
│       ├── LoginButton.jsx               # Triggers Auth0 login
│       ├── LogoutButton.jsx              # Triggers Auth0 logout
│       ├── ProtectedRoute.jsx            # Auth guard for routes
│       └── ConnectInsightsAI.jsx         # Federated B2C popup login via Auth0
```

---

## How It Works

### Auth0 Flow (Standard)
1. **Login** — The `LoginButton` calls `loginWithRedirect()`, which sends the user to the Auth0 hosted login page.
2. **Callback** — After authentication, Auth0 redirects to `/callback`. The SDK exchanges the authorization code for tokens.
3. **Session** — Tokens are stored in `localStorage` (`cacheLocation="localstorage"`), keeping the user signed in across page refreshes.
4. **Protected Routes** — `ProtectedRoute` checks `isAuthenticated` from the `useAuth0()` hook. Unauthenticated users are redirected to `/`.
5. **Logout** — The `LogoutButton` calls `logout()`, which clears the local session and redirects through Auth0's logout endpoint.

### Azure AD B2C Federated Flow
1. **Connect to Insights AI** — On the Dashboard, click "Connect to Insights AI" after logging in.
2. **B2C Login** — The button calls `loginWithPopup()` with the `connection: 'insights-ai-b2c'` parameter.
3. **Auth0 → B2C** — Auth0 recognizes the connection and redirects the user directly to Azure AD B2C custom policy.
4. **B2C Auth** — User authenticates with B2C inside the popup.
5. **Popup Complete** — Auth0 finishes the enterprise login flow in the popup and closes it.
6. **Token Access** — The app calls `getAccessTokenSilently()` and stores the returned token in component state.

---

## 5. (Optional) Configure Azure AD B2C Federated Login

If you want to enable the "Connect Insights AI" button (federated B2C login through Auth0):

### In Auth0 Dashboard:
1. Navigate to **Authentication → Enterprise**
2. Click **+ Create** → select **OpenID Connect**
3. Fill in your Azure AD B2C custom policy details:
   - **Name:** `insights-ai-b2c`
   - **Issuer URL:** `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy-name>/v2.0/.well-known/openid-configuration`
   - **Client ID:** Your B2C app registration's Client ID
   - **Client Secret:** Your B2C app registration's Client Secret
4. Go to the **Applications** tab and enable your React app
5. Keep your popup-based app flow pointed at Auth0. Do not configure your React app to receive a direct B2C callback for this integration.

---

## Building for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

---

## License

MIT
