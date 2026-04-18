import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ component: Component, requiredRole = null }) => {
  const { user, loading } = useAuth();

  // Wait for auth context to load from localStorage
  if (loading) {
    return null; // Show nothing while loading
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required (role, not currentRole)
  if (requiredRole === "admin") {
    if (user.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole) {
    // For other roles, check currentRole
    if (user.currentRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Component />;
};

export default ProtectedRoute;
