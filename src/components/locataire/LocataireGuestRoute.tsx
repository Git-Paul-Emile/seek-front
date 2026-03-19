import { Navigate, Outlet } from "react-router-dom";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useAuth } from "@/context/AuthContext";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";

/** Accessible uniquement si NON connecté — bloque quel que soit le rôle connecté */
const LocataireGuestRoute = () => {
  const { isAuthenticated: isLocataire, isLoading: locataireLoading } = useLocataireAuth();
  const { isAuthenticated: isOwner, isLoading: ownerLoading } = useOwnerAuth();
  const { isAuthenticated: isAdmin, isLoading: adminLoading } = useAuth();
  const { isAuthenticated: isPublic, isLoading: publicLoading } = useComptePublicAuth();

  if (locataireLoading || ownerLoading || adminLoading || publicLoading) return null;

  if (isLocataire) return <Navigate to="/locataire/dashboard" replace />;
  if (isOwner) return <Navigate to="/owner/dashboard" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isPublic) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default LocataireGuestRoute;
