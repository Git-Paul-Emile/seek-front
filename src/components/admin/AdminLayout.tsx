import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  ArrowUpRight,
  LogOut,
  House,
  Building2,
  Tag,
  ArrowLeftRight,
  CircleDot,
  Sofa,
  ChevronDown,
  AlertTriangle,
  ChevronRight,
  FileSearch,
  User,
  Globe,
  MapPin,
  Navigation,
  Users,
  Shield,
  CreditCard,
  Star,
  TrendingUp,
  DollarSign,
  FileText,
  Settings2,
  PanelLeft,
  PanelLeftClose,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { socketService, SOCKET_EVENTS } from "@/services/socketService";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { MobileDrawer } from "@/components/ui/MobileDrawer";
import { BottomNav, type BottomNavItem } from "@/components/ui/BottomNav";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { useAdminNotifications } from "@/hooks/useNotificationInApp";

const ADMIN_BOTTOM_NAV: BottomNavItem[] = [
  { to: "/admin/dashboard",    label: "Accueil",       icon: LayoutDashboard },
  { to: "/admin/annonces",     label: "Annonces",      icon: FileSearch },
  { to: "/admin/utilisateurs/proprietaires", label: "Utilisateurs", icon: Users },
  { to: "/admin/profile",      label: "Profil",        icon: User },
];

// ─── Structure de navigation ──────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/profile", label: "Mon Profil", icon: User },
];

const NAV_GROUPS = [
  {
    label: "Gestion de biens",
    icon: Building2,
    basePath: "/admin/biens",
    children: [
      { to: "/admin/biens/categories",        label: "Catégories",          icon: Tag },
      { to: "/admin/biens/transactions",      label: "Transactions",        icon: ArrowLeftRight },
      { to: "/admin/biens/statuts",           label: "Statuts",             icon: CircleDot },
      { to: "/admin/biens/meuble-equipement", label: "Meuble & Équipement", icon: Sofa },
    ],
  },
  {
    label: "Géographie",
    icon: Globe,
    basePath: "/admin/geo",
    children: [
      { to: "/admin/geo/pays",      label: "Pays",      icon: Globe },
      { to: "/admin/geo/villes",    label: "Villes",    icon: MapPin },
      { to: "/admin/geo/quartiers", label: "Quartiers", icon: Navigation },
    ],
  },
  {
    label: "Premium & Finances",
    icon: Star,
    basePath: "/admin/premium",
    children: [
      { to: "/admin/premium/formules",    label: "Formules premium",  icon: Star },
      { to: "/admin/premium/historique",  label: "Mises en avant",    icon: TrendingUp },
      { to: "/admin/transactions",        label: "Transactions",      icon: CreditCard },
    ],
  },
  {
    label: "Paramètres",
    icon: Settings2,
    basePath: "/admin/parametres",
    children: [
      { to: "/admin/monetisation/config", label: "Monétisation", icon: DollarSign },
      { to: "/admin/parametres/config-site", label: "Configuration globale", icon: Settings2 },
      { to: "/admin/parametres/pages-legales", label: "Pages légales", icon: Shield },
    ],
  },
  {
    label: "Contrats",
    icon: FileText,
    basePath: "/admin/contrats",
    children: [
      { to: "/admin/contrats/modeles", label: "Modèles de contrat", icon: FileText },
    ],
  },
];

// ─── Composant groupe avec dropdown ───────────────────────────────────────────

function NavGroup({
  group,
}: {
  group: (typeof NAV_GROUPS)[number];
}) {
  const location = useLocation();
  const isChildActive = group.children.some(
    child => location.pathname === child.to || location.pathname.startsWith(child.to + "/")
  );
  const isGroupActive = isChildActive;
  const [open, setOpen] = useState(isGroupActive);
  const Icon = group.icon;

  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          transition-colors duration-150 ${
            isGroupActive
              ? "text-[#D4A843] bg-[#D4A843]/8"
              : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
          }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="mt-0.5 ml-3 pl-4 border-l border-slate-100 space-y-0.5">
          {group.children.map(({ to, label, icon: ChildIcon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                  transition-colors duration-150 ${
                    isActive
                      ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                  }`
                }
              >
                <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usersOpen, setUsersOpen] = useState(
    location.pathname.startsWith("/admin/utilisateurs")
  );
  const [customerFeedbackOpen, setCustomerFeedbackOpen] = useState(
    location.pathname.startsWith("/admin/temoignages") || location.pathname.startsWith("/admin/feedbacks")
  );

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-100
      flex flex-col z-40 transition-all duration-300 ${
        isOpen ? "w-60" : "w-16"
      }`}>

      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-slate-100 flex-shrink-0 ${
        isOpen ? "px-5" : "px-3 justify-center"
      }`}>
        <Link to="/admin/dashboard" className={`flex items-center gap-2.5 ${
          isOpen ? "" : "justify-center"
        }`}>
          <div className="w-8 h-8 rounded-lg bg-[#D4A843] flex items-center justify-center flex-shrink-0">
            <House className="w-4 h-4 text-white" />
          </div>
          {isOpen && (
            <div>
              <span className="font-display font-bold text-[#0C1A35] text-base tracking-wide leading-none">
                Seek
              </span>
              <span className="block text-[10px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide">
                Administration
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 ${isOpen ? "px-3" : "px-1"}`}>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors duration-150 ${
                    isActive
                      ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                  }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {isOpen && <span className="flex-1">{label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}

          {/* Menu Utilisateurs avec dropdown */}
          <li>
            <button
              onClick={() => setUsersOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  location.pathname.startsWith("/admin/utilisateurs")
                    ? "text-[#D4A843] bg-[#D4A843]/8"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              {isOpen && (
                <>
                  <span className="flex-1 text-left">Utilisateurs</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${usersOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>
            {usersOpen && isOpen && (
              <ul className="mt-0.5 ml-3 pl-4 border-l border-slate-100 space-y-0.5">
                <li>
                  <NavLink
                    to="/admin/utilisateurs/proprietaires"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                      }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    Propriétaire
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/utilisateurs/locataires"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                      }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    Locataire
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Annonces (sans badge) */}
          <li>
            <NavLink
              to="/admin/annonces"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  isActive
                    ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              {({ isActive }) => (
                <>
                  <FileSearch className="w-4 h-4 flex-shrink-0" />
                  {isOpen && <span className="flex-1">Annonces</span>}
                </>
              )}
            </NavLink>
          </li>

          {/* Vérifications (sans badge) */}
          <li>
            <NavLink
              to="/admin/verifications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  isActive
                    ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              {({ isActive }) => (
                <>
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {isOpen && <span className="flex-1">Vérifications</span>}
                </>
              )}
            </NavLink>
          </li>

          {/* Signalements */}
          <li>
            <NavLink
              to="/admin/signalements"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  isActive
                    ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              {({ isActive }) => (
                <>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {isOpen && <span className="flex-1">Signalements</span>}
                </>
              )}
            </NavLink>
          </li>

          {/* Retour Client avec dropdown */}
          <li>
            <button
              onClick={() => setCustomerFeedbackOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  location.pathname.startsWith("/admin/temoignages") || location.pathname.startsWith("/admin/feedbacks")
                    ? "text-[#D4A843] bg-[#D4A843]/8"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {isOpen && (
                <>
                  <span className="flex-1 text-left">Retour Client</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${customerFeedbackOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>
            {customerFeedbackOpen && isOpen && (
              <ul className="mt-0.5 ml-3 pl-4 border-l border-slate-100 space-y-0.5">
                <li>
                  <NavLink
                    to="/admin/temoignages"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                      }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    Témoignages
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/feedbacks"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                      }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    Feedbacks
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Séparateur */}
          {isOpen && (
            <li className="pt-3 pb-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Catalogue
              </span>
            </li>
          )}

          {/* Groupes avec dropdown */}
          {isOpen && NAV_GROUPS.map((group) => (
            <NavGroup key={group.basePath} group={group} />
          ))}
        </ul>
      </nav>

      {/* Profil + déconnexion */}
      <div className={`border-t border-slate-100 p-4 flex-shrink-0 ${
        isOpen ? "" : "p-2"
      }`}>
        <div className={`flex items-center gap-3 mb-3 ${
          isOpen ? "" : "justify-center"
        }`}>
          <div className="w-8 h-8 rounded-full bg-[#0C1A35] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {admin?.email?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          {isOpen && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0C1A35] truncate">{admin?.email}</p>
              <p className="text-[10px] text-slate-400 font-medium">Administrateur</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
            text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors ${
              isOpen ? "" : "justify-center px-2"
            }`}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {isOpen && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar avec cloche de notifications ──────────────────────────────────────

function Topbar({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
  const { data } = useAdminNotifications();
  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <header className={`fixed top-0 h-16 bg-white border-b border-slate-100
      flex items-center justify-between px-6 z-30 transition-all duration-300 ${
        sidebarOpen ? "left-60" : "left-16"
      } right-0`}>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0C1A35] transition-colors"
          aria-label={sidebarOpen ? "Masquer le sidebar" : "Afficher le sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </button>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200
              text-sm text-slate-700 placeholder:text-slate-300 outline-none
              focus:border-slate-300 focus:bg-white transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationPanel
          role="admin"
          items={items}
          unreadCount={unreadCount}
          allNotificationsPath="/admin/notifications"
        />
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500
            hover:text-[#0C1A35] transition-colors"
        >
          Retour au site
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}

// ─── Hook temps réel admin ────────────────────────────────────────────────────

function useAdminRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubVerifCount = socketService.on(SOCKET_EVENTS.VERIFICATION_COUNT_UPDATE, () => {
      qc.invalidateQueries({ queryKey: ["admin-verifications-count"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    });

    const unsubVerifNew = socketService.on(SOCKET_EVENTS.VERIFICATION_SUBMITTED, () => {
      toast.info("Nouvelle vérification soumise", {
        description: "Un propriétaire a soumis ses documents d'identité.",
      });
      qc.invalidateQueries({ queryKey: ["admin-verifications-count"] });
      qc.invalidateQueries({ queryKey: ["admin-verifications"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    });

    const unsubStats = socketService.on(SOCKET_EVENTS.STATS_UPDATE, () => {
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    });

    const unsubSignalementNew = socketService.on(SOCKET_EVENTS.SIGNALEMENT_NEW, () => {
      toast.info("Nouveau signalement", {
        description: "Une annonce vient d'être signalée par un utilisateur.",
      });
      qc.invalidateQueries({ queryKey: ["admin-signalements"] });
      qc.invalidateQueries({ queryKey: ["admin-signalements-count"] });
    });

    const unsubSignalementUpdated = socketService.on(SOCKET_EVENTS.SIGNALEMENT_UPDATED, () => {
      qc.invalidateQueries({ queryKey: ["admin-signalements"] });
      qc.invalidateQueries({ queryKey: ["admin-signalements-count"] });
    });

    const unsubBienUpdated = socketService.on(SOCKET_EVENTS.BIEN_UPDATED, () => {
      qc.invalidateQueries({ queryKey: ["admin-biens"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    });

    const unsubFeedbackNew = socketService.on(SOCKET_EVENTS.FEEDBACK_SUBMITTED, () => {
      toast.info("Nouveau feedback reçu", {
        description: "Un utilisateur a partagé son retour sur l'expérience.",
      });
      qc.invalidateQueries({ queryKey: ["admin-feedbacks"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    });

    const unsubTemoignageNew = socketService.on(SOCKET_EVENTS.TEMOIGNAGE_SUBMITTED, () => {
      toast.info("Nouveau témoignage reçu", {
        description: "Un utilisateur a partagé son témoignage.",
      });
      qc.invalidateQueries({ queryKey: ["admin-temoignages"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    });

    return () => {
      unsubVerifCount();
      unsubVerifNew();
      unsubStats();
      unsubSignalementNew();
      unsubSignalementUpdated();
      unsubBienUpdated();
      unsubFeedbackNew();
      unsubTemoignageNew();
    };
  }, [qc]);
}

// ─── Drawer mobile admin ──────────────────────────────────────────────────────

function AdminMobileNav({ onClose }: { onClose: () => void }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium min-h-[44px]
    transition-colors duration-150 ${
      isActive
        ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
        : "text-slate-600 hover:bg-slate-50 active:bg-slate-100"
    }`;

  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink to={to} onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        </li>
      ))}

      {/* Annonces */}
      <li>
        <NavLink to="/admin/annonces" onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
          <FileSearch className="w-5 h-5 flex-shrink-0" />
          Annonces
        </NavLink>
      </li>

      {/* Vérifications */}
      <li>
        <NavLink to="/admin/verifications" onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
          <Shield className="w-5 h-5 flex-shrink-0" />
          Vérifications
        </NavLink>
      </li>

      {/* Signalements */}
      <li>
        <NavLink to="/admin/signalements" onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          Signalements
        </NavLink>
      </li>

      {/* Notifications */}
      <li>
        <NavLink to="/admin/notifications" onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-base">🔔</span>
          Notifications
        </NavLink>
      </li>

      {/* Utilisateurs */}
      <li className="pt-2">
        <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Utilisateurs
        </span>
      </li>
      <li>
        <NavLink to="/admin/utilisateurs/proprietaires" onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          Propriétaires
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/utilisateurs/locataires" onClick={onClose} className={({ isActive }) => linkClass(isActive)}>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          Locataires
        </NavLink>
      </li>

      {/* Déconnexion */}
      <li className="pt-4 border-t border-slate-100 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#0C1A35] flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {admin?.email?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0C1A35] truncate">{admin?.email}</p>
            <p className="text-[10px] text-slate-400 font-medium">Administrateur</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium min-h-[44px]
            text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </li>
    </ul>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  useAdminRealtime();

  const location = useLocation();
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] overflow-x-clip">
        <MobileHeader onMenuOpen={() => setDrawerOpen(true)} homePath="/admin/dashboard" />
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          roleLabel="Administration"
          homePath="/admin/dashboard"
        >
          <AdminMobileNav onClose={() => setDrawerOpen(false)} />
        </MobileDrawer>
        <main className="pt-20 pb-24 px-4 overflow-x-clip">
          <Outlet />
        </main>
        <BottomNav items={ADMIN_BOTTOM_NAV} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] overflow-x-clip">
      <Sidebar isOpen={sidebarOpen} />
      <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`pt-16 overflow-x-clip transition-all duration-300 ${
        sidebarOpen ? "ml-60" : "ml-16"
      }`}>
        <main className="p-6 overflow-x-clip">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
