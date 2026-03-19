import { Navigate, Outlet } from "react-router-dom";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useAuth } from "@/context/AuthContext";

/** Accessible uniquement si NON connecté — bloque quel que soit le rôle connecté */
const LocataireGuestRoute = () => {
  const { isAuthenticated: isLocataire, isLoading: locataireLoading } = useLocataireAuth();
  const { isAuthenticated: isOwner, isLoading: ownerLoading } = useOwnerAuth();
  const { isAuthenticated: isAdmin, isLoading: adminLoading } = useAuth();

  if (locataireLoading || ownerLoading || adminLoading) return null;

  if (isLocataire) return <Navigate to="/locataire/dashboard" replace />;
  if (isOwner) return <Navigate to="/owner/dashboard" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
};

export default LocataireGuestRoute;
