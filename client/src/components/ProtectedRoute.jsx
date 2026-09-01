import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  allowedRoles,
}) => {
  const {
    employee,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  if (!employee) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      employee.role
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
