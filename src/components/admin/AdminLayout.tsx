import React, { useState } from "react";
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
  ChevronRight,
  FileSearch,
  User,
  Globe,
  MapPin,
  Navigation,
  Users,
  Shield,
  Flag,
  CreditCard,
  Star,
  TrendingUp,
  DollarSign,
  FileText,
  Settings2,
  Crown,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAnnoncesPendingCount } from "@/hooks/useAnnonces";
import { usePendingVerificationsCount } from "@/hooks/useAdminVerification";
import { useSignalementCount } from "@/hooks/useSignalement";
import { useEffect } from "react";
import { socketService, EVENTS } from "@/services/socketService";
import { toast } from "sonner";

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
      { to: "/admin/stats/revenus",       label: "Stats revenus",     icon: DollarSign },
    ],
  },
  {
    label: "Monétisation",
    icon: DollarSign,
    basePath: "/admin/monetisation",
    children: [
      { to: "/admin/monetisation/config",         label: "Configuration",       icon: Settings2 },
      { to: "/admin/monetisation/plans",          label: "Plans d'abonnement",  icon: Crown },
      { to: "/admin/monetisation/abonnements",    label: "Abonnements",         icon: Users },
      { to: "/admin/monetisation/mises-en-avant", label: "Mises en avant",      icon: TrendingUp },
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
  
  // Check if any child path matches exactly or is a sub-path
  const isChildActive = group.children.some(
    child => location.pathname === child.to || location.pathname.startsWith(child.to + "/")
  );
  
  const isGroupActive = isChildActive;
  const [open, setOpen] = useState(isGroupActive);
  const Icon = group.icon;

  return (
    <li>
      {/* Bouton parent */}
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

      {/* Enfants */}
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
  const { data: pendingData } = useAnnoncesPendingCount();
  const { data: verificationData } = usePendingVerificationsCount();
  const { data: signalementCount = 0 } = useSignalementCount();
  const pendingCount = pendingData?.count ?? 0;
  const verificationCount = verificationData ?? 0;

  const [usersOpen, setUsersOpen] = useState(
    location.pathname.startsWith("/admin/utilisateurs")
  );

  // Écouter les nouvelles vérifications et afficher une notification
  useEffect(() => {
    socketService.connect();
    socketService.joinAdmin();

    const unsub = socketService.onVerificationSubmitted((data) => {
      toast.info(`🔔 Nouvelle demande de vérification de ${data.prenom} ${data.nom}`, {
        description: "Cliquez pour examiner la demande",
        duration: 10000,
        action: {
          label: "Voir",
          onClick: () => navigate("/admin/verifications"),
        },
      });
    });

    return () => {
      unsub();
    };
  }, [navigate]);

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
          {/* Items directs */}
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

          {/* Annonces avec badge */}
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
                  {isOpen && (
                    <>
                      <span className="flex-1">Annonces</span>
                      {pendingCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          </li>

          {/* Signalements avec badge */}
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
                  <Flag className="w-4 h-4 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1">Signalements</span>
                      {signalementCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {signalementCount > 99 ? "99+" : signalementCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          </li>

          {/* Vérifications avec badge */}
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
                  {isOpen && (
                    <>
                      <span className="flex-1">Vérifications</span>
                      {verificationCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {verificationCount > 99 ? "99+" : verificationCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
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

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
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
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500
          hover:text-[#0C1A35] transition-colors"
      >
        Retour au site
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    </header>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
