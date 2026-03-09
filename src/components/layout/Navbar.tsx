import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useFavoris } from "@/hooks/useFavoris";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import { useFavorisAuthModal } from "@/context/FavorisAuthModalContext";

const STATIC_NAV_LINKS = [
  { to: "/",          label: "Accueil"   },
  { to: "/annonces",  label: "Annonces"  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { count: favCount } = useFavoris();
  const { compte: comptePublic, isAuthenticated: isPublicAuth, logout: logoutPublic } = useComptePublicAuth();
  const { openModal } = useFavorisAuthModal();

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

  // Lien Admin : dashboard si connecté, sinon login
  const adminLink = {
    to: isAuthenticated ? "/admin/dashboard" : "/admin/login",
    label: "Admin",
  };

  const navLinks = [...STATIC_NAV_LINKS, adminLink];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent border-b border-white/10"
          : "bg-white shadow-sm border-b border-slate-100"
      }`}
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
          <Link
            to="/locataire/login"
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
              <span className={`text-sm font-medium ${transparent ? "text-white/80" : "text-slate-600"}`}>
                <User className="w-3.5 h-3.5 inline mr-1" />
                {comptePublic.prenom}
              </span>
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
          <Link
            to="/proprietaires"
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
              location.pathname === "/proprietaires"
                ? "border-[#D4A843] text-[#D4A843] bg-[#D4A843]/10"
                : transparent
                ? "border-white/30 text-white/80 hover:border-[#D4A843] hover:text-[#D4A843]"
                : "border-[#0C1A35]/20 text-[#0C1A35] hover:border-[#D4A843] hover:text-[#D4A843]"
            }`}
          >
            Espace propriétaire
          </Link>
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
              <Link
                to="/locataire/login"
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                  location.pathname.startsWith("/locataire")
                    ? "text-[#D4A843] bg-white/5"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                Espace locataire
              </Link>
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
              <Link
                to="/proprietaires"
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                  location.pathname === "/proprietaires"
                    ? "text-[#D4A843] bg-white/5"
                    : "text-[#D4A843]/70 hover:text-[#D4A843] hover:bg-white/5"
                }`}
              >
                Espace propriétaire
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
