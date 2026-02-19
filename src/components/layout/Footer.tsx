import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-[#0C1A35] text-white pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

        {/* Brand */}
        <div>
          <Link to="/" className="inline-block mb-4">
            <span className="font-display text-2xl font-bold text-[#D4A843] tracking-widest">
              SEEK
            </span>
          </Link>
          <p className="text-sm text-white/45 leading-relaxed">
            La plateforme immobilière de référence au Sénégal. Trouvez votre
            bien idéal ou publiez vos annonces en toute simplicité.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5">
            Navigation
          </h4>
          <div className="flex flex-col gap-3 text-sm text-white/50">
            {[
              { to: "/", label: "Accueil" },
              { to: "/annonces", label: "Annonces" },
              { to: "/proprietaires", label: "Espace Propriétaire" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-[#D4A843] transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Property types */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5">
            Types de biens
          </h4>
          <div className="flex flex-col gap-3 text-sm text-white/50">
            {["Appartements", "Villas", "Studios", "Terrains", "Bureaux"].map((t) => (
              <span
                key={t}
                className="hover:text-white/75 cursor-pointer transition-colors w-fit"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5">
            Contact
          </h4>
          <div className="flex flex-col gap-3.5 text-sm text-white/50">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
              contact@seek.sn
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
              +221 77 000 00 00
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
              Dakar, Sénégal
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
        <span>© {new Date().getFullYear()} SEEK. Tous droits réservés.</span>
        <div className="flex gap-5">
          <Link to="/confidentialite" className="hover:text-white/55 transition-colors">
            Confidentialité
          </Link>
          <Link to="/cgu" className="hover:text-white/55 transition-colors">
            CGU
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
