import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentOwner } from '@/lib/owner-api';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const currentOwner = getCurrentOwner();
  
  // Si connecté, rediriger vers le dashboard admin
  if (currentOwner) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};
