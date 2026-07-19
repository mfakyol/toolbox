import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";

export function RequireAuth() {
  const { user, loading, authRequired } = useAuth();

  if (loading) return <p className="page-intro">…</p>;
  if (!authRequired) return <Outlet />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;

  return <Outlet />;
}

export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
