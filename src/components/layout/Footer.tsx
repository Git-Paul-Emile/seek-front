import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useConfigSite } from "@/hooks/useConfigSite";

const Footer = () => {
  const { data: config, isLoading } = useConfigSite();

  return (
    <footer className="bg-[#0C1A35] text-white pt-16 pb-8">
      <div className="container mx-auto px-8">
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
                { to: "/locataire/login", label: "Espace Locataire" },
                { to: "/a-propos", label: "Qui sommes-nous ?" },
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

          {/* Service client */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5">
              Service client
            </h4>
            <div className="flex flex-col gap-3 text-sm text-white/50">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4A843]" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {(() => {
                    const rawHours = config?.serviceClientHours as unknown;
                    let hours: string[] = [];
                    
                    if (Array.isArray(rawHours)) {
                      const days = rawHours as Array<{ day: string; isOpen: boolean; open: string; close: string }>;
                      hours = days
                        .filter((day) => day.isOpen)
                        .map((day) => {
                          const dayLabel =
                            day.day === "lundi" ? "Lundi" :
                            day.day === "mardi" ? "Mardi" :
                            day.day === "mercredi" ? "Mercredi" :
                            day.day === "jeudi" ? "Jeudi" :
                            day.day === "vendredi" ? "Vendredi" :
                            day.day === "samedi" ? "Samedi" :
                            day.day === "dimanche" ? "Dimanche" : day.day;
                          return `${dayLabel}: ${day.open}h-${day.close}h`;
                        });
                    } else if (typeof rawHours === "string") {
                      hours = rawHours.split(";").map((h: string) => h.trim()).filter(Boolean);
                    } else {
                      // Fallback par défaut
                      hours = ["Lundi - Vendredi: 08h-18h", "Samedi: 09h-18h"];
                    }
                    
                    return hours.map((hour, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#D4A843] mt-2 flex-shrink-0" />
                        <span>{hour}</span>
                      </li>
                    ));
                  })()}
                </ul>
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5">
              Contact
            </h4>
            <div className="flex flex-col gap-3.5 text-sm text-white/50">
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
                    {config?.contactEmail || "contact@seek.sn"}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
                    {config?.contactPhone || "+221 77 000 00 00"}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
                    {config?.contactAddress || "Dakar, Sénégal"}
                  </div>
                </>
              )}
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
};

export default Footer;
