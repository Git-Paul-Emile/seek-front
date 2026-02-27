import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  House,
  LayoutDashboard,
  LogOut,
  User,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/locataire/dashboard", label: "Mon espace", icon: LayoutDashboard },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const { locataire, logout } = useLocataireAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/locataire/login", { replace: true });
  };

  const initiales =
    `${locataire?.prenom?.[0] ?? ""}${locataire?.nom?.[0] ?? ""}`.toUpperCase() || "L";

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-slate-100 flex flex-col z-40">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 flex-shrink-0">
        <Link to="/locataire/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4A843] flex items-center justify-center flex-shrink-0">
            <House className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-[#0C1A35] text-base tracking-wide leading-none">
              Seek
            </span>
            <span className="block text-[10px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide">
              Locataires
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
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
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}

          {/* Mon profil */}
          <li>
            <NavLink
              to="/locataire/profil"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 ${
                  isActive
                    ? "bg-[#D4A843] text-white shadow-sm shadow-[#D4A843]/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0C1A35]"
                }`
              }
            >
              <User className="w-4 h-4 flex-shrink-0" />
              Mon profil
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Profil + déconnexion */}
      <div className="border-t border-slate-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0C1A35] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{initiales}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0C1A35] truncate">
              {locataire?.prenom} {locataire?.nom}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Locataire</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
            text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-100
      flex items-center justify-between px-6 z-30">
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

export default function LocataireLayout() {
  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      <Sidebar />
      <Topbar />
      <div className="ml-60 pt-16">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
