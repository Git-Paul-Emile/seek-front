import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronDown, Home, Search, Users, Heart, Shield, Key, MapPin, Tag, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useFavoris } from "@/hooks/useFavoris";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import { useFavorisAuthModal } from "@/context/FavorisAuthModalContext";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useLocataireAuth } from "@/context/LocataireAuthContext";


const STATIC_NAV_LINKS = [
  { to: "/", label: "Accueil", icon: Home },
];

const ANNONCES_DROPDOWN = [
  { to: "/annonces",                            label: "Toutes les annonces" },
  { to: "/annonces?typeTransaction=location",   label: "Location"            },
  { to: "/annonces?typeTransaction=vente",      label: "Vente"               },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [annoncesOpen, setAnnoncesOpen] = useState(false);
  const [mobileAnnoncesOpen, setMobileAnnoncesOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { count: favCount } = useFavoris();
  const { compte: comptePublic, isAuthenticated: isPublicAuth, logout: logoutPublic } = useComptePublicAuth();
  const { openModal } = useFavorisAuthModal();
  const { isAuthenticated: isOwnerAuth } = useOwnerAuth();
  const { isAuthenticated: isLocataireAuth } = useLocataireAuth();


  // Visibilité des espaces selon le rôle connecté
  const showAdminLink = !isOwnerAuth && !isLocataireAuth && !isPublicAuth;
  const showLocataireLink = !isAuthenticated && !isOwnerAuth && !isPublicAuth;
  const showProprietaireLink = !isAuthenticated && !isLocataireAuth && !isPublicAuth;

  // Lien Admin : dashboard si connecté, sinon login
  const adminLink = {
    to: isAuthenticated ? "/admin/dashboard" : "/admin/login",
    label: "Admin",
    icon: Shield,
  };

  const navLinks = [...STATIC_NAV_LINKS, ...(showAdminLink ? [adminLink] : [])];


  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-[box-shadow,border-color] duration-300 shadow-sm border-b border-slate-100 bg-white"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-widest text-[#0C1A35]">
            SEEK
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.to
                  ? "text-[#0C1A35] font-semibold"
                  : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              <span className={`mr-2 flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
                location.pathname === link.to 
                  ? "bg-slate-100 border-slate-200" 
                  : "bg-slate-50 border-slate-100 group-hover:border-slate-300 group-hover:bg-slate-100"
              }`}>
                <Icon className={`w-3.5 h-3.5 transition-colors ${
                  location.pathname === link.to ? "text-[#0C1A35]" : "text-slate-400 group-hover:text-[#0C1A35]"
                }`} />
              </span>
              {link.label}
            </Link>
          )})}

          {/* Dropdown Annonces */}
          <div
            className="relative"
            onMouseEnter={() => setAnnoncesOpen(true)}
            onMouseLeave={() => setAnnoncesOpen(false)}
          >
            <button
              className={`group flex items-center text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/annonces"
                  ? "text-[#0C1A35] font-semibold"
                  : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              <span className={`mr-2 flex items-center justify-center w-7 h-7 bg-slate-50 border border-slate-100 rounded-full group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors ${
                location.pathname.startsWith('/annonce') ? 'bg-slate-100 border-slate-200' : ''
              }`}>
                <Building2 className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#0C1A35] ${
                  location.pathname.startsWith('/annonce') ? 'text-[#0C1A35]' : ''
                }`} />
              </span>
              Annonces
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </button>
            <AnimatePresence>
              {annoncesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 min-w-[180px]">
                    {ANNONCES_DROPDOWN.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0C1A35] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {showLocataireLink && (
            <Link
              to={isLocataireAuth ? "/locataire/dashboard" : "/locataire/login"}
              className={`group flex items-center text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith("/locataire")
                  ? "text-[#0C1A35] font-semibold"
                  : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              <span className="mr-2 flex items-center justify-center w-7 h-7 bg-slate-50 border border-slate-100 rounded-full group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0C1A35]" />
              </span>
              Espace locataire
            </Link>
          )}
          {/* Favoris avec badge */}
          <Link
            to="/favoris"
            className={`group relative flex items-center text-sm font-medium transition-colors duration-200 ${
              location.pathname === "/favoris"
                ? "text-[#0C1A35] font-semibold"
                : "text-slate-500 hover:text-[#0C1A35]"
            }`}
          >
            <span className="mr-2 flex items-center justify-center w-7 h-7 bg-slate-50 border border-slate-100 rounded-full group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
              <Heart className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0C1A35]" />
            </span>
            Favoris
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {favCount > 9 ? "9+" : favCount}
              </span>
            )}
          </Link>

          {/* Compte public */}
          {isPublicAuth && comptePublic ? (
            <div className="flex items-center gap-2">
              <Link
                to="/mon-compte"
                className="group flex items-center text-sm font-medium text-slate-600 hover:text-[#0C1A35] transition-colors"
              >
                <span className="mr-2 flex items-center justify-center w-7 h-7 bg-slate-50 border border-slate-100 rounded-full group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                  <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0C1A35]" />
                </span>
                {comptePublic.prenom}
              </Link>
              <button
                onClick={() => logoutPublic()}
                title="Se déconnecter"
                className="text-sm transition-colors text-slate-400 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openModal()}
              className="group flex items-center text-sm font-medium text-slate-500 hover:text-[#0C1A35] transition-colors"
            >
              <span className="mr-2 flex items-center justify-center w-7 h-7 bg-slate-50 border border-slate-100 rounded-full group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0C1A35]" />
              </span>
              Mon compte
            </button>
          )}
          {showProprietaireLink && (
            <Link
              to={isOwnerAuth ? "/owner/dashboard" : "/proprietaires"}
              className={`group flex items-center text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
                location.pathname === "/proprietaires" || location.pathname.startsWith("/owner")
                  ? "border-[#D4A843] text-[#D4A843] bg-[#D4A843]/10"
                  : "border-[#0C1A35]/20 text-[#0C1A35] hover:border-[#D4A843] hover:text-[#D4A843]"
              }`}
            >
              Espace propriétaire
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-1 rounded-md transition-colors text-[#0C1A35]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0C1A35] overflow-hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                    location.pathname === link.to
                      ? "text-[#D4A843] bg-white/5"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              )})}

              {/* Annonces mobile */}
              <button
                onClick={() => setMobileAnnoncesOpen((v) => !v)}
                className={`flex items-center text-sm font-medium py-2.5 px-3 rounded-xl transition-colors w-full ${
                  location.pathname === "/annonces"
                    ? "text-[#D4A843] bg-white/5"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Annonces
                </div>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileAnnoncesOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileAnnoncesOpen && (
                <div className="flex flex-col gap-0.5 pl-4">
                  {ANNONCES_DROPDOWN.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => { setOpen(false); setMobileAnnoncesOpen(false); }}
                      className="text-sm font-medium py-2 px-3 rounded-xl transition-colors text-white/50 hover:text-white hover:bg-white/5"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              {showLocataireLink && (
                <Link
                  to={isLocataireAuth ? "/locataire/dashboard" : "/locataire/login"}
                  onClick={() => setOpen(false)}
                  className={`flex items-center text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                    location.pathname.startsWith("/locataire")
                      ? "text-[#D4A843] bg-white/5"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Espace locataire
                </Link>
              )}
              {isPublicAuth && comptePublic && (
                <Link
                  to="/mon-compte"
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors flex items-center gap-2 ${
                    location.pathname === "/mon-compte"
                      ? "text-[#D4A843] bg-white/5"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Mon compte
                </Link>
              )}
              {/* Mon compte mobile if not logged in */}
              {!isPublicAuth && (
                <button
                  onClick={() => { openModal(); setOpen(false); }}
                  className="flex items-center text-sm font-medium py-2.5 px-3 rounded-xl transition-colors text-white/65 hover:text-white hover:bg-white/5 w-full text-left"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mon compte
                </button>
              )}
              <Link
                to="/favoris"
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                  location.pathname === "/favoris"
                    ? "text-[#D4A843] bg-white/5"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoris
                </div>
                {favCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {favCount > 9 ? "9+" : favCount}
                  </span>
                )}
              </Link>
              {showProprietaireLink && (
                <Link
                  to={isOwnerAuth ? "/owner/dashboard" : "/proprietaires"}
                  onClick={() => setOpen(false)}
                  className={`flex items-center text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                    location.pathname === "/proprietaires" || location.pathname.startsWith("/owner")
                      ? "text-[#D4A843] bg-white/5"
                      : "text-[#D4A843]/70 hover:text-[#D4A843] hover:bg-white/5"
                  }`}
                >
                  Espace propriétaire
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
