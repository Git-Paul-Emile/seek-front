import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentOwner } from '@/lib/owner-api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const currentOwner = getCurrentOwner();
  
  // Si pas connecté, rediriger vers la page owner (avec liens login/register)
  if (!currentOwner) {
    return <Navigate to="/owner" replace />;
  }
  
  return <>{children}</>;
};
