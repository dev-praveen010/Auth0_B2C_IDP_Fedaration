import { useAuth0 } from '@auth0/auth0-react';

/**
 * LogoutButton — logs the user out via Auth0.
 *
 * logout() clears the local session and redirects the user to the
 * Auth0 logout endpoint, which then redirects back to the app's
 * origin (window.location.origin).
 *
 * Make sure window.location.origin is listed in the "Allowed Logout
 * URLs" setting in your Auth0 Dashboard.
 */
const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      className="btn btn-outline"
      onClick={() =>{
        localStorage.clear();
        logout({ logoutParams: { returnTo: window.location.origin } })
      }}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
