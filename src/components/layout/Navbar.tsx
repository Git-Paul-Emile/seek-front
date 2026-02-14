import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentOwner, logoutOwner } from "@/lib/owner-api";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentOwner = getCurrentOwner();

  const handleLogout = async () => {
    await logoutOwner();
    navigate("/owner");
  };

  // Liens de base (toujours visibles)
  const baseNavLinks = [
    { to: "/", label: "Accueil" },
    { to: "/annonces", label: "Annonces" },
    { to: "/guide", label: "Guide" },
  ];

  // Lien Espace Propriétaire - change selon l'état de connexion
  const ownerSpaceLink = currentOwner 
    ? { to: "/admin", label: "Espace Propriétaire" }
    : { to: "/owner", label: "Espace Propriétaire" };

  // Liens supplémentaires pour les non-connectés
  const publicSpaceLinks = currentOwner ? [] : [
    { to: "/tenant/login", label: "Espace Locataire" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary backdrop-blur-md border-b border-secondary">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-secondary-foreground tracking-wide">
            SEEK
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {/* Liens de base */}
          {baseNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-secondary-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Lien Espace Propriétaire */}
          <Link
            to={ownerSpaceLink.to}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname.startsWith('/owner') || location.pathname.startsWith('/admin')
                ? "text-primary"
                : "text-secondary-foreground/70"
            }`}
          >
            {ownerSpaceLink.label}
          </Link>

          {/* Liens Espaces Locataire et Agence (si non connecté) */}
          {publicSpaceLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith(link.to)
                  ? "text-primary"
                  : "text-secondary-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {currentOwner ? (
            // Afficher le dashboard et déconnexion pour les propriétaires connectés
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                variant="ghost" 
                className="gap-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
              </Button>
            </div>
          ) : (
            // Afficher le bouton Rechercher pour les non-connectés
            <Link to="/annonces">
              <Button size="sm" className="gap-2">
                <Search className="w-3.5 h-3.5" />
                Rechercher
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-secondary-foreground"
          onClick={() => setOpen(!open)}
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
            className="md:hidden bg-secondary border-b border-secondary overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* Liens de base */}
              {baseNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium py-2 ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-secondary-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Lien Espace Propriétaire */}
              <Link
                to={ownerSpaceLink.to}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium py-2 ${
                  location.pathname.startsWith('/owner') || location.pathname.startsWith('/admin')
                    ? "text-primary"
                    : "text-secondary-foreground/70"
                }`}
              >
                {ownerSpaceLink.label}
              </Link>

              {/* Liens Espaces Locataire (si non connecté) */}
              {publicSpaceLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium py-2 ${
                    location.pathname.startsWith(link.to)
                      ? "text-primary"
                      : "text-secondary-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {currentOwner ? (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 mt-2"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              ) : (
                <Link to="/annonces" onClick={() => setOpen(false)}>
                  <Button className="w-full gap-2 mt-2">
                    <Search className="w-4 h-4" />
                    Rechercher
                  </Button>
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
