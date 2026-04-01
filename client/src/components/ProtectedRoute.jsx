import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "./Loading";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loading fullPage={true} />;
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

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
