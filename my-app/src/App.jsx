import { Routes, Route } from 'react-router-dom';
import Auth0ProviderWithNavigate from './auth0-provider-with-navigate';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CallbackPage from './pages/CallbackPage';

/**
 * App Component
 *
 * The Auth0ProviderWithNavigate wrapper must be inside <BrowserRouter>
 * (set up in main.jsx) so it can use useNavigate for redirect handling.
 *
 * Route structure:
 *   /           → Public home page
 *   /dashboard  → Protected — only accessible when authenticated
 *   /callback   → Auth0 redirects here after login; shows a spinner
 */
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

export default App;
