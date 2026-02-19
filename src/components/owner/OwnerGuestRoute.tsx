import { Navigate, Outlet } from "react-router-dom";
import { useOwnerAuth } from "@/context/OwnerAuthContext";

/** Accessible uniquement si NON connecté — redirige vers dashboard si connecté */
const OwnerGuestRoute = () => {
  const { isAuthenticated, isLoading } = useOwnerAuth();

  if (isLoading) return null;

  return isAuthenticated
    ? <Navigate to="/owner/dashboard" replace />
    : <Outlet />;
};

export default OwnerGuestRoute;
