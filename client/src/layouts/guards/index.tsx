import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";

// Gates the whole app behind a session. Users still owing a password change
// are pushed to /change-password; admins-only areas add RequireAdmin on top.
export function RequireAuth() {
  const { user, loading, authRequired } = useAuth();

  if (loading) return <p className="page-intro">…</p>;
  // Auth disabled globally: the app is open to everyone.
  if (!authRequired) return <Outlet />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;

  return <Outlet />;
}

export function RequireAdmin() {
  const { user, authRequired } = useAuth();
  // No admin/users area when auth is disabled.
  if (!authRequired || user?.role !== "admin")
    return <Navigate to="/" replace />;
  return <Outlet />;
}
