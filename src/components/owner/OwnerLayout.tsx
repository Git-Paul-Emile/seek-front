import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  ArrowUpRight,
  LogOut,
  Building2,
  House,
  ChevronDown,
  List,
  User,
  Users,
  Wallet,
  PanelLeft,
  PanelLeftClose,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useOwnerStats } from "@/hooks/useBien";
import { useBiensEnRetard } from "@/hooks/useBail";
import { usePendingVerificationsCount } from "@/hooks/useLocataire";
import { socketService, SOCKET_EVENTS, type NotificationPayload, type TransactionStatusPayload } from "@/services/socketService";

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_ITEMS_TOP = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/paiements", label: "Paiements", icon: Wallet },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { owner, logout } = useOwnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [biensOpen, setBiensOpen] = useState(
    location.pathname.startsWith("/owner/biens")
  );
  const [locatairesOpen, setLocatairesOpen] = useState(
    location.pathname.startsWith("/owner/locataires")
  );

  // fetch stats to know if we have any pending annonces
  const { data: stats } = useOwnerStats();
  const pendingCount =
    stats?.byStatut.find((s) => s.statut === "EN_ATTENTE")?.count ?? 0;
  const { data: biensEnRetard = [] } = useBiensEnRetard();
  const retardCount = biensEnRetard.length;
  const { data: pendingVerif } = usePendingVerificationsCount();
  const pendingVerifCount = pendingVerif?.count ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate("/proprietaires", { replace: true });
  };

  const initiales =
    `${owner?.prenom?.[0] ?? ""}${owner?.nom?.[0] ?? ""}`.toUpperCase() || "P";

  const isBiensActive = location.pathname.startsWith("/owner/biens");
  const isLocatairesActive = location.pathname.startsWith("/owner/locataires");

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col z-40 transition-all duration-300 ${
      isOpen ? "w-60" : "w-16"
    }`}>

      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-slate-100 flex-shrink-0 ${
        isOpen ? "px-5" : "px-3 justify-center"
      }`}>
        <Link to="/owner/dashboard" className={`flex items-center gap-2.5 ${
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
                Propriétaires
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 ${isOpen ? "px-3" : "px-1"}`}>
        <ul className="space-y-0.5">
          {/* Items plats */}
          {NAV_ITEMS_TOP.map(({ to, label, icon: Icon }) => (
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
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isOpen && <span className="flex-1">{label}</span>}
              </NavLink>
            </li>
          ))}

          {/* Loyers en retard */}
          <li>
            <NavLink
              to="/owner/loyers-retard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  isActive
                    ? "bg-red-500 text-white shadow-sm shadow-red-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              {({ isActive }) => (
                <>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1">Loyers en retard</span>
                      {retardCount > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                          isActive ? "bg-white/25 text-white" : "bg-red-500 text-white"
                        }`}>
                          {retardCount}
                        </span>
                      )}
                    </>
                  )}
                  {!isOpen && retardCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </>
              )}
            </NavLink>
          </li>

          {/* Profil */}
          <li>
            <NavLink
              to="/owner/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  isActive
                    ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="flex-1">Mon Profil</span>}
            </NavLink>
          </li>

          {/* Locataires - groupe collapsible */}
          {isOpen && (
            <li>
              <button
                type="button"
                onClick={() => setLocatairesOpen((v) => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors duration-150 ${
                    isLocatairesActive
                      ? "text-[#0C1A35] bg-slate-50"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                  }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Locataires</span>
                {pendingVerifCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-amber-500 text-white">
                    {pendingVerifCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    locatairesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <ul
                className={`overflow-hidden transition-all duration-200 ml-3 pl-3 border-l border-slate-100 space-y-0.5 ${
                  locatairesOpen ? "max-h-40 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                }`}
              >
                <li>
                  <NavLink
                    to="/owner/locataires"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                      }`}
                  >
                    <List className="w-3.5 h-3.5 flex-shrink-0" />
                    Liste des locataires
                  </NavLink>
                </li>
              </ul>
            </li>
          )}

          {/* Gestion de biens - groupe collapsible */}
          {isOpen && (
            <li>
              <button
                type="button"
                onClick={() => setBiensOpen((v) => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors duration-150 ${
                    isBiensActive
                      ? "text-[#0C1A35] bg-slate-50"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                  }`}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Gestion de biens</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    biensOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Sous-items */}
              <ul
                className={`overflow-hidden transition-all duration-200 ml-3 pl-3 border-l border-slate-100 space-y-0.5 ${
                  biensOpen ? "max-h-40 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                }`}
              >
                <li>
                  <NavLink
                    to="/owner/biens"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                      }`}
                  >
                    {({ isActive }) => (
                      <>
                        <List className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="flex-1">Liste des biens</span>
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
                  </NavLink>
                </li>
              </ul>
            </li>
          )}
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
            <span className="text-white text-xs font-semibold">{initiales}</span>
          </div>
          {isOpen && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0C1A35] truncate">
                {owner?.prenom} {owner?.nom}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Propriétaire</p>
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
        to="/proprietaires"
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500
          hover:text-[#0C1A35] transition-colors"
      >
        Retour à l'accueil
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    </header>
  );
}

// ─── Hook temps réel owner ────────────────────────────────────────────────────

function useOwnerRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubNotif = socketService.on(SOCKET_EVENTS.NOTIFICATION_NEW, (data: NotificationPayload) => {
      toast.info(data.titre, { description: data.message });
      qc.invalidateQueries({ queryKey: ["owner-messages"] });
    });

    const unsubBadge = socketService.on(SOCKET_EVENTS.BADGE_UPDATE, () => {
      qc.invalidateQueries({ queryKey: ["owner-stats"] });
      qc.invalidateQueries({ queryKey: ["biens-retard"] });
    });

    const unsubPayOk = socketService.on(SOCKET_EVENTS.PAYMENT_CONFIRMED, (data: TransactionStatusPayload) => {
      toast.success("Paiement confirmé", {
        description: `${data.montant.toLocaleString("fr-FR")} FCFA reçu`,
      });
      qc.invalidateQueries({ queryKey: ["bail"] });
      qc.invalidateQueries({ queryKey: ["echeancier"] });
    });

    const unsubPayFail = socketService.on(SOCKET_EVENTS.PAYMENT_FAILED, (data: TransactionStatusPayload) => {
      toast.error("Paiement échoué", {
        description: `Transaction ${data.transactionId} — montant ${data.montant.toLocaleString("fr-FR")} FCFA`,
      });
    });

    return () => {
      unsubNotif();
      unsubBadge();
      unsubPayOk();
      unsubPayFail();
    };
  }, [qc]);
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useOwnerRealtime();

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
