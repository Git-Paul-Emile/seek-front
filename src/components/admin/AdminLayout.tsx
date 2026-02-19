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
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Structure de navigation ──────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const NAV_GROUPS = [
  {
    label: "Gestion de biens",
    icon: Building2,
    basePath: "/admin/biens",
    children: [
      { to: "/admin/biens/categories",    label: "Catégories",   icon: Tag },
      { to: "/admin/biens/transactions",  label: "Transactions", icon: ArrowLeftRight },
      { to: "/admin/biens/statuts",       label: "Statuts",      icon: CircleDot },
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
  const isGroupActive = location.pathname.startsWith(group.basePath);
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

function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-slate-100
      flex flex-col z-40">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 flex-shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4A843] flex items-center justify-center flex-shrink-0">
            <House className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-[#0C1A35] text-base tracking-wide leading-none">
              Seek
            </span>
            <span className="block text-[10px] text-slate-400 leading-none mt-0.5 font-medium tracking-wide">
              Administration
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
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
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}

          {/* Séparateur */}
          <li className="pt-3 pb-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Catalogue
            </span>
          </li>

          {/* Groupes avec dropdown */}
          {NAV_GROUPS.map((group) => (
            <NavGroup key={group.basePath} group={group} />
          ))}
        </ul>
      </nav>

      {/* Profil + déconnexion */}
      <div className="border-t border-slate-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0C1A35] flex items-center justify-center flex-shrink-0">
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

export default function AdminLayout() {
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
