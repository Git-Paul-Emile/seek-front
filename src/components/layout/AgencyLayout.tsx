import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import AgencySidebar from './AgencySidebar';
import { Toaster } from '../ui/toaster';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Bell, Search, Home } from 'lucide-react';
import { agencyAuth } from '@/services/agency-auth.service';

const AgencyLayout: React.FC = () => {
  // Vérifier l'authentification
  if (!agencyAuth.isAuthenticated) {
    return <Navigate to="/agency/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AgencySidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 w-full shrink-0">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                0
              </span>
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Retour au site
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AgencyLayout;
