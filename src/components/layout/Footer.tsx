import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground/70 pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="min-w-0">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="font-display text-xl font-bold text-secondary-foreground">SEEK</span>
          </Link>
          <p className="text-sm leading-relaxed">
            La plateforme immobilière de référence. Trouvez le bien de vos rêves ou publiez vos annonces en toute simplicité.
          </p>
        </div>
        <div>
          <h4 className="font-display text-secondary-foreground font-semibold mb-4">Navigation</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <Link to="/annonces" className="hover:text-primary transition-colors">Annonces</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">Espace Propriétaire</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-secondary-foreground font-semibold mb-4">Types de biens</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span>Appartements</span>
            <span>Maisons</span>
            <span>Villas</span>
            <span>Terrains</span>
          </div>
        </div>
        <div>
          <h4 className="font-display text-secondary-foreground font-semibold mb-4">Contact</h4>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@seek.cm</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +237 6 00 00 00 00</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Douala, Cameroun</div>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 pt-6 text-center text-xs">
        © {new Date().getFullYear()} SEEK. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
