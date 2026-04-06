import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — a route guard component.
 *
 * Wrap any route's element in <ProtectedRoute> to restrict it to
 * authenticated users only.
 *
 * Behaviour:
 *   1. If the SDK is still loading → show a spinner
 *   2. If the user is NOT authenticated → redirect to "/"
 *   3. Otherwise → render the children (the protected page)
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="page fade-in">
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p>Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated visitors back to the home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
