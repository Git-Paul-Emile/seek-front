import { Navigate, Outlet } from "react-router-dom";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useAuth } from "@/context/AuthContext";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";

/** Accessible uniquement si NON connecté - bloque quel que soit le rôle connecté */
const OwnerGuestRoute = () => {
  const { owner, isAuthenticated: isOwner, isLoading: ownerLoading } = useOwnerAuth();
  const { isAuthenticated: isAdmin, isLoading: adminLoading } = useAuth();
  const { isAuthenticated: isLocataire, isLoading: locataireLoading } = useLocataireAuth();
  const { isAuthenticated: isPublic, isLoading: publicLoading } = useComptePublicAuth();

  if (ownerLoading || adminLoading || locataireLoading || publicLoading) return null;

  if (isOwner) return <Navigate to={owner?.telephoneVerifie === false ? "/owner/verify-phone" : "/owner/dashboard"} replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isLocataire) return <Navigate to="/locataire/dashboard" replace />;
  if (isPublic) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default OwnerGuestRoute;
