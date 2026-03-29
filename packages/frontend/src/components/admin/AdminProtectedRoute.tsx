import { Navigate, Outlet } from "react-router";

export const AdminProtectedRoute = () => {
  const apiKey = sessionStorage.getItem("admin-api-key");

  if (!apiKey) {
    return <Navigate replace to="/admin/login" />;
  }

  return <Outlet />;
};
