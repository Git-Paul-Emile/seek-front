import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Home,
  FileText,
  DollarSign,
  Receipt,
  History,
  FileStack,
  Search,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { getCurrentOwner, logoutOwner, type Proprietaire } from '@/lib/owner-api';

// Helper to get initials from name
const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const navItems = [
  {
    title: "Tableau de bord",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Mes biens",
    url: "/admin/properties",
    icon: Building2,
  },
  {
    title: "Gestion Biens",
    url: "/admin/property-management",
    icon: Building2,
  },
  {
    title: "Contrats de bail",
    url: "/admin/leases",
    icon: FileText,
  },
  {
    title: "Gestion des loyers",
    url: "/admin/rent-payments",
    icon: DollarSign,
  },
  {
    title: "Quittances",
    url: "/admin/receipts",
    icon: FileText,
  },
  {
    title: "Gestion des charges",
    url: "/admin/charges",
    icon: Receipt,
  },
  {
    title: "Rappels & Relances",
    url: "/admin/reminders/settings",
    icon: Bell,
  },
  {
    title: "Historique",
    url: "/admin/reminders/history",
    icon: History,
  },
  {
    title: "Locataires",
    url: "/admin/tenants",
    icon: Users,
  },
  {
    title: "Statistiques",
    url: "/admin/stats",
    icon: BarChart3,
  },
  {
    title: "Documents",
    url: "/admin/documents",
    icon: FileStack,
  },
];

const bottomItems = [
  {
    title: "Paramètres",
    url: "/admin/settings",
    icon: Settings,
  },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentOwner, setCurrentOwner] = useState<Proprietaire | null>(null);

  useEffect(() => {
    const owner = getCurrentOwner();
    setCurrentOwner(owner);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logoutOwner();
    navigate("/owner");
  };

  const ownerName = currentOwner?.nom_complet || 'Propriétaire';
  const ownerInitials = getInitials(ownerName);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/admin" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Seek</span>
        </Link>
        <span className="ml-2 text-xs text-muted-foreground">Propriétaire</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.url)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}

          <Separator className="my-4" />

          {bottomItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.url)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
          
          <Button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-muted hover:text-destructive w-full"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{ownerName}</span>
            <span className="text-xs text-muted-foreground">Propriétaire</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
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
                3
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
