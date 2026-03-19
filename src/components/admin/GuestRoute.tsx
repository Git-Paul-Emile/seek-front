import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

/**
 * Réserve les routes d'authentification aux visiteurs non connectés.
 * Bloque l'accès quel que soit le rôle connecté (admin, owner, locataire).
 */
export default function GuestRoute() {
  const { isAuthenticated: isAdmin, isLoading: adminLoading } = useAuth();
  const { isAuthenticated: isOwner, isLoading: ownerLoading } = useOwnerAuth();
  const { isAuthenticated: isLocataire, isLoading: locataireLoading } = useLocataireAuth();

  if (adminLoading || ownerLoading || locataireLoading) return null;

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isOwner) return <Navigate to="/owner/dashboard" replace />;
  if (isLocataire) return <Navigate to="/locataire/dashboard" replace />;

  return <Outlet />;
}
