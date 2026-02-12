import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Bell,
  Home,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { agencyAuth } from '@/services/agency-auth.service';

const AgencySidebar: React.FC = () => {
  const location = useLocation();
  const user = agencyAuth.currentUser;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/agency/dashboard' },
    { icon: Building2, label: 'Propriétés', path: '/agency/properties', permission: 'properties:read' },
    { icon: Users, label: 'Propriétaires', path: '/agency/owners', permission: 'owners:read' },
    { icon: BarChart3, label: 'Équipe', path: '/agency/team', permission: 'team:read' },
    { icon: FileText, label: 'Rapports', path: '/agency/reports', permission: 'reports:read' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Mon profil', path: '/agency/profile' },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || agencyAuth.hasPermission(item.permission)
  );

  const handleLogout = () => {
    agencyAuth.logout();
    window.location.href = '/agency/login';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/agency/dashboard" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Seek</span>
        </Link>
        <span className="ml-2 text-xs text-muted-foreground">Agence</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {filteredMenuItems.map((item) => (
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
        {user && (
          <div className="mb-3 flex items-center gap-3">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.firstName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
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

export default AgencySidebar;
