import { toast } from "react-toastify";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

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
        state={{ from: window.location.pathname }}
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
