import { useAuth0 } from '@auth0/auth0-react';

/**
 * LoginButton — triggers the Auth0 Universal Login redirect.
 *
 * loginWithRedirect() sends the user to the Auth0-hosted login page.
 * After successful authentication Auth0 redirects back to the
 * configured callback URL (/callback).
 */
const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="btn btn-primary"
      onClick={() => loginWithRedirect()}
    >
      Log In
    </button>
  );
};

export default LoginButton;
