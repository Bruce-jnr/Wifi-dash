import { Navigate, Outlet } from "react-router-dom";

const hasUsableToken = () => {
  const token = localStorage.getItem("admin_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    localStorage.removeItem("admin_token");
    return false;
  }
};

const ProtectedAdminRoute = () =>
  hasUsableToken() ? <Outlet /> : <Navigate to="/admin" replace />;

export default ProtectedAdminRoute;
