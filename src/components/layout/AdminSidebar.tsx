import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Home,
  FileText,
  DollarSign,
  Receipt,
  History,
  FileStack,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function AdminSidebar() {
  const location = useLocation();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">SEEK</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator className="my-2" />
          <SidebarGroup>
            <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/" className="text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Déconnexion</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                JD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Jean Dupont</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 w-full flex flex-col overflow-hidden">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6 w-full shrink-0">
            <SidebarTrigger />
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
          <main className="flex-1 w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;
