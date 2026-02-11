import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Receipt, 
  Users, 
  Bell, 
  Settings, 
  Home,
  LogOut,
  FileStack,
  Building,
  LayoutGrid
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import tenantAuthService from '../../services/tenant-auth.service';

const TenantSidebar: React.FC = () => {
  const location = useLocation();
  const tenant = tenantAuthService.getTenant();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/tenant/dashboard' },
    { icon: Home, label: 'Ma chambre', path: '/tenant/room' },
    { icon: Building, label: 'Mon logement', path: '/tenant/property' },
    { icon: LayoutGrid, label: 'Espaces communs', path: '/tenant/common-spaces' },
    { icon: FileText, label: 'Mon bail', path: '/tenant/lease' },
    { icon: CreditCard, label: 'Paiements', path: '/tenant/payments' },
    { icon: Receipt, label: 'Charges', path: '/tenant/charges' },
    { icon: Users, label: 'Colocataires', path: '/tenant/flatmates' },
    { icon: Bell, label: 'Notifications', path: '/tenant/notifications' },
    { icon: FileStack, label: 'Quittances', path: '/tenant/receipts' },
    { icon: FileText, label: 'Documents', path: '/tenant/documents' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Mon profil', path: '/tenant/profile' },
    { icon: Settings, label: 'Paramètres personnels', path: '/tenant/personal-settings' },
  ];

  const handleLogout = async () => {
    await tenantAuthService.logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/tenant/dashboard" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Seek</span>
        </Link>
        <span className="ml-2 text-xs text-muted-foreground">Locataire</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          <Separator className="my-4" />

          {settingsItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        {tenant && (
          <div className="mb-3 flex items-center gap-3">
            {tenant.profilePhoto ? (
              <img
                src={tenant.profilePhoto}
                alt={tenant.firstName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{tenant.firstName} {tenant.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{tenant.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default TenantSidebar;
