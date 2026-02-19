import { Navigate, Outlet } from "react-router-dom";
import { useOwnerAuth } from "@/context/OwnerAuthContext";

/** Accessible uniquement si connecté — redirige vers /owner/register sinon */
const OwnerProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useOwnerAuth();

  if (isLoading) return null;

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/owner/register" replace />;
};

export default OwnerProtectedRoute;
