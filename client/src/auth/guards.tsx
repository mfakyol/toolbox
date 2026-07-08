import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Gates the whole app behind a session. Users still owing a password change
// are pushed to /change-password; admins-only areas add RequireAdmin on top.
export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) return <p className="page-intro">…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;

  return <Outlet />;
}

export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
