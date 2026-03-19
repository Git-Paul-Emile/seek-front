import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useFavoris } from "@/hooks/useFavoris";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import { useFavorisAuthModal } from "@/context/FavorisAuthModalContext";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

const STATIC_NAV_LINKS = [
  { to: "/", label: "Accueil" },
];

const ANNONCES_DROPDOWN = [
  { to: "/annonces",                            label: "Toutes les annonces" },
  { to: "/annonces?typeTransaction=location",   label: "Location"            },
  { to: "/annonces?typeTransaction=vente",      label: "Vente"               },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [annoncesOpen, setAnnoncesOpen] = useState(false);
  const [mobileAnnoncesOpen, setMobileAnnoncesOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { count: favCount } = useFavoris();
  const { compte: comptePublic, isAuthenticated: isPublicAuth, logout: logoutPublic } = useComptePublicAuth();
  const { openModal } = useFavorisAuthModal();
  const { isAuthenticated: isOwnerAuth } = useOwnerAuth();
  const { isAuthenticated: isLocataireAuth } = useLocataireAuth();

  // Recalcule la position à chaque changement de route (scrolled persiste entre navigations)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll(); // vérifier la position actuelle dès l'arrivée sur la page
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // Transparent uniquement sur la home quand on est en haut
  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;

  // Visibilité des espaces selon le rôle connecté
  const showAdminLink = !isOwnerAuth && !isLocataireAuth && !isPublicAuth;
  const showLocataireLink = !isAuthenticated && !isOwnerAuth && !isPublicAuth;
  const showProprietaireLink = !isAuthenticated && !isLocataireAuth && !isPublicAuth;

  // Lien Admin : dashboard si connecté, sinon login
  const adminLink = {
    to: isAuthenticated ? "/admin/dashboard" : "/admin/login",
    label: "Admin",
  };

  const navLinks = [...STATIC_NAV_LINKS, ...(showAdminLink ? [adminLink] : [])];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[box-shadow,border-color] duration-300 ${
        transparent
          ? "bg-transparent border-b border-white/10"
          : "shadow-sm border-b border-slate-100"
      }`}
      style={!transparent ? { backgroundColor: '#ffffff' } : undefined}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className={`font-display text-xl font-bold tracking-widest transition-colors duration-300 ${
              transparent ? "text-[#D4A843]" : "text-[#0C1A35]"
            }`}
          >
            SEEK
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.to
                  ? transparent
                    ? "text-[#D4A843]"
                    : "text-[#0C1A35] font-semibold"
                  : transparent
                  ? "text-white/65 hover:text-white"
                  : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Dropdown Annonces */}
          <div
            className="relative"
            onMouseEnter={() => setAnnoncesOpen(true)}
            onMouseLeave={() => setAnnoncesOpen(false)}
          >
            <button
              className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/annonces"
                  ? transparent ? "text-[#D4A843]" : "text-[#0C1A35] font-semibold"
                  : transparent ? "text-white/65 hover:text-white" : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              Annonces
              <ChevronDown className="w-3.5 h-3.5" />
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
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith("/locataire")
                  ? transparent
                    ? "text-[#D4A843]"
                    : "text-[#0C1A35] font-semibold"
                  : transparent
                  ? "text-white/65 hover:text-white"
                  : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              Espace locataire
            </Link>
          )}
          {/* Favoris avec badge */}
          <Link
            to="/favoris"
            className={`relative text-sm font-medium transition-colors duration-200 ${
              location.pathname === "/favoris"
                ? transparent ? "text-[#D4A843]" : "text-[#0C1A35] font-semibold"
                : transparent ? "text-white/65 hover:text-white" : "text-slate-500 hover:text-[#0C1A35]"
            }`}
          >
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
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${transparent ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-[#0C1A35]"}`}
              >
                <User className="w-3.5 h-3.5" />
                {comptePublic.prenom}
              </Link>
              <button
                onClick={() => logoutPublic()}
                title="Se déconnecter"
                className={`text-sm transition-colors ${transparent ? "text-white/50 hover:text-white/80" : "text-slate-400 hover:text-red-500"}`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openModal()}
              className={`text-sm font-medium transition-colors duration-200 ${
                transparent ? "text-white/65 hover:text-white" : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              Mon compte
            </button>
          )}
          {showProprietaireLink && (
            <Link
              to={isOwnerAuth ? "/owner/dashboard" : "/proprietaires"}
              className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
                location.pathname === "/proprietaires" || location.pathname.startsWith("/owner")
                  ? "border-[#D4A843] text-[#D4A843] bg-[#D4A843]/10"
                  : transparent
                  ? "border-white/30 text-white/80 hover:border-[#D4A843] hover:text-[#D4A843]"
                  : "border-[#0C1A35]/20 text-[#0C1A35] hover:border-[#D4A843] hover:text-[#D4A843]"
              }`}
            >
              Espace propriétaire
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-1 rounded-md transition-colors ${
            transparent ? "text-white" : "text-[#0C1A35]"
          }`}
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
            className="md:hidden bg-[#0C1A35] overflow-hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                    location.pathname === link.to
                      ? "text-[#D4A843] bg-white/5"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Annonces mobile */}
              <button
                onClick={() => setMobileAnnoncesOpen((v) => !v)}
                className={`flex items-center justify-between text-sm font-medium py-2.5 px-3 rounded-xl transition-colors w-full ${
                  location.pathname === "/annonces"
                    ? "text-[#D4A843] bg-white/5"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                Annonces
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileAnnoncesOpen ? "rotate-180" : ""}`} />
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
                  className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                    location.pathname.startsWith("/locataire")
                      ? "text-[#D4A843] bg-white/5"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
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
              <Link
                to="/favoris"
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                  location.pathname === "/favoris"
                    ? "text-[#D4A843] bg-white/5"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                Favoris
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
                  className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
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
