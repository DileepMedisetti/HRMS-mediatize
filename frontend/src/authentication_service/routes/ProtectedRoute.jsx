import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ allowPasswordChange = false }) {
  const {
    isAuthenticated,
    user,
    loading,
  } = useAuth();

  const location = useLocation();

  /*
   * Wait until AuthProvider finishes restoring
   * the authentication session.
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  /*
   * User is not authenticated.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
   * If the user's password was reset by HR,
   * the user must change the temporary password
   * before accessing normal protected pages.
   *
   * allowPasswordChange is true only for the
   * /change-password route.
   */
  if (
    user?.must_change_password &&
    !allowPasswordChange
  ) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    );
  }

  /*
   * User is authenticated and allowed to
   * access this protected route.
   */
  return <Outlet />;
}

export default ProtectedRoute;