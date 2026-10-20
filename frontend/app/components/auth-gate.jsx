import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/auth";
import { LoadingScreen } from "./ui";

export function RequireAuth({ children }) {
  const { ready, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;
  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return children;
}

export function RequireAdmin({ children }) {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingScreen label="Đang kiểm tra quyền quản trị..." />;
  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (!isAdmin) return <Navigate to="/exams" replace />;

  return children;
}
