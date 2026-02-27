import { Navigate, Outlet } from "react-router-dom";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

/** Accessible uniquement si NON connecté — redirige vers dashboard si connecté */
const LocataireGuestRoute = () => {
  const { isAuthenticated, isLoading } = useLocataireAuth();

  if (isLoading) return null;

  return isAuthenticated
    ? <Navigate to="/locataire/dashboard" replace />
    : <Outlet />;
};

export default LocataireGuestRoute;
