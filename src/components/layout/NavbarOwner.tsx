import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getCurrentOwner, logoutOwner } from "@/lib/owner-api";

const NavbarOwner = () => {
  const navigate = useNavigate();
  const currentOwner = getCurrentOwner();

  const handleLogout = async () => {
    await logoutOwner();
    navigate("/owner");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-primary tracking-wide">
            SEEK
          </span>
        </Link>

        {currentOwner ? (
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                Dashboard
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/owner/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link to="/owner/register">
              <Button size="sm">
                Inscription
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarOwner;
