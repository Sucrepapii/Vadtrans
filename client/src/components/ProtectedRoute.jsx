import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = [] }) => {
  const { isAuthenticated, isStaff, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Alert the user before redirecting
    toast.info("Please login to access this page", {
      toastId: "auth-redirect",
    });
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: window.location.pathname + window.location.search }}
      />
    );
  }

  // Admin check
  if (requireAdmin && !isStaff) {
    toast.error("Unauthorized: Admin access required");
    return <Navigate to="/" replace />;
  }

  // Role-based check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    toast.error("Unauthorized: You do not have permission to access this page");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
