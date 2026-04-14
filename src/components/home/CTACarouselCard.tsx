import { Link } from "react-router-dom";
import miseEnAvantImg from "@/assets/mise_en_avant.png";

const CTACarouselCard = () => (
  <Link
    to="/owner/register"
    className="group flex flex-col overflow-hidden bg-white rounded-2xl border-2 border-dashed border-[#D4A843]/50 hover:border-[#D4A843] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full h-full"
  >
    {/* Image plein cadre — même hauteur que PropertyCard */}
    <div className="h-40 sm:h-44 md:h-48 overflow-hidden">
      <img
        src={miseEnAvantImg}
        alt="Mettre mon annonce en avant"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>

    {/* Texte centré verticalement dans l'espace restant */}
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 text-center">
      <p className="text-[#D4A843] font-bold text-xs uppercase tracking-wider mb-1">
        Boostez votre visibilité
      </p>
      <h3 className="font-bold text-[#1A2942] text-sm sm:text-base leading-snug mb-2">
        Passez à la une
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">
        Touchez plus d'acheteurs et de locataires au Sénégal.
      </p>
      <span className="inline-flex items-center text-xs font-bold px-4 py-1.5 rounded-lg bg-[#D4A843] text-[#0C1A35] group-hover:bg-[#c49a35] transition-colors">
        Plus de visibilité
      </span>
    </div>
  </Link>
);

export default CTACarouselCard;
