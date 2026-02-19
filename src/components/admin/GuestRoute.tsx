import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Réserve les routes d'authentification aux visiteurs non connectés.
 * Si l'admin est déjà authentifié, il est renvoyé vers le dashboard.
 * Affiche un écran vide pendant la vérification initiale de session
 * pour éviter un flash de la page login.
 */
export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated
    ? <Navigate to="/admin/dashboard" replace />
    : <Outlet />;
}
