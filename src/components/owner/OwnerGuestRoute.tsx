import { Navigate, Outlet } from "react-router-dom";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useAuth } from "@/context/AuthContext";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

/** Accessible uniquement si NON connecté — bloque quel que soit le rôle connecté */
const OwnerGuestRoute = () => {
  const { isAuthenticated: isOwner, isLoading: ownerLoading } = useOwnerAuth();
  const { isAuthenticated: isAdmin, isLoading: adminLoading } = useAuth();
  const { isAuthenticated: isLocataire, isLoading: locataireLoading } = useLocataireAuth();

  if (ownerLoading || adminLoading || locataireLoading) return null;

  if (isOwner) return <Navigate to="/owner/dashboard" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isLocataire) return <Navigate to="/locataire/dashboard" replace />;

  return <Outlet />;
};

export default OwnerGuestRoute;
