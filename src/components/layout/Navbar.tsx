import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  // { to: "/annonces", label: "Annonces" },
  // { to: "/dashboard", label: "Espace propriétaire" },
  { to: "/admin", label: "Admin" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent uniquement sur la home quand on est en haut
  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;

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
          {NAV_LINKS.map((link) => (
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
              {NAV_LINKS.map((link) => (
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

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
