import { MapPin, Maximize2, BedDouble, ShowerHead, ArrowRight, BadgeCheck, Star, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Property } from "@/data/home";
import type { Bien, BienAvecIsNew } from "@/api/bien";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
  }).format(price);

// Fonction pour calculer le pourcentage de baisse de prix
const calculatePriceDropPercentage = (prixActuel: number | null, prixAncien: number | null): number | null => {
  if (!prixActuel || !prixAncien || prixAncien <= prixActuel) return null;
  const pourcentage = ((prixAncien - prixActuel) / prixAncien) * 100;
  return pourcentage >= 5 ? Math.round(pourcentage) : null;
};

// Fonction pour vérifier si la baisse est récente (moins de 30 jours)
const isPriceDropRecent = (dateModification: string | null): boolean => {
  if (!dateModification) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(dateModification) >= thirtyDaysAgo;
};

// Transformer les données de l'API en format PropertyCard
const transformBienToProperty = (bien: Bien | BienAvecIsNew): Property => ({
  id: parseInt(bien.id.replace(/\D/g, ""), 10) || Math.random(),
  type: bien.typeLogement?.nom || "Bien",
  title: bien.titre || "Annonce",
  price: bien.prix || 0,
  location: bien.region && bien.quartier ? `${bien.region}, ${bien.quartier}` : bien.region || bien.pays || "",
  city: bien.region || bien.pays || "",
  surface: bien.surface || 0,
  bedrooms: bien.nbChambres || 0,
  bathrooms: bien.nbSdb || 0,
  images: bien.photos && bien.photos.length > 0 ? bien.photos : ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  features: { parking: bien.parking || false, generator: false, citerne: false },
  isNew: (bien as BienAvecIsNew).isNew ?? false,
});

interface PropertyCardProps {
  property: Property | Bien | BienAvecIsNew;
  isApiData?: boolean;
}

// Type pour le propriétaire avec statut de vérification
interface ProprietaireWithVerification {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  statutVerification?: "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
}

const PropertyCard = ({ property, isApiData = false }: PropertyCardProps) => {
  // Si les données viennent de l'API, les transformer
  const displayProperty = isApiData ? transformBienToProperty(property as BienAvecIsNew) : (property as Property);
  
  // Extraire les informations supplémentaires de l'API si disponibles
  const bienData = isApiData ? (property as BienAvecIsNew) : null;
  const proprietaire = bienData?.proprietaire as ProprietaireWithVerification | undefined;
  const isProprietaireVerified = proprietaire?.statutVerification === "VERIFIED";
  const estMisEnAvant = bienData?.estMisEnAvant ?? false;

  // Calculer le pourcentage de baisse de prix
  const pourcentageBaisse = isApiData 
    ? calculatePriceDropPercentage(bienData?.prix ?? null, bienData?.prixAncien ?? null)
    : null;
  
  // Vérifier si la baisse est récente
  const baisseRecente = isApiData 
    ? isPriceDropRecent(bienData?.dateDerniereModificationPrix ?? null)
    : false;

  // Afficher le badge si la baisse est significative et récente
  const afficherBaisseDePrix = pourcentageBaisse !== null && baisseRecente;

  return (
    <div 
      className="group bg-white overflow-hidden hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 border border-slate-100"
      style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="relative h-40 sm:h-44 md:h-48">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {displayProperty.images.map((img, idx) => (
              <CarouselItem key={idx}>
                <div className="relative h-40 sm:h-44 md:h-48 bg-slate-100">
                  <img
                    src={img}
                    alt={`${displayProperty.title} — image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 h-7 w-7 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity border-0 shadow-md" />
          <CarouselNext className="right-2 h-7 w-7 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity border-0 shadow-md" />
        </Carousel>

        {/* Zone des badges - coin supérieur droit */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {/* Badge Nouveau */}
          {displayProperty.isNew && (
            <div className="bg-[#D4A843] text-[#0C1A35] text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3" />
              Nouveau
            </div>
          )}

          {/* Badge Mis en avant / Premium */}
          {(isApiData && estMisEnAvant) ? (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3" />
              Coup de cœur
            </div>
          ) : null}
        </div>

        {/* Prix - en bas à gauche */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            {isApiData && afficherBaisseDePrix && bienData?.prixAncien && (
              <span className="text-white/70 text-xs line-through">
                {formatPrice(bienData.prixAncien)}
              </span>
            )}
            <span className="text-white font-bold text-base sm:text-lg drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              {formatPrice(displayProperty.price)}
            </span>
          </div>
          {/* Badge Baisse de prix - à côté du prix */}
          {isApiData && afficherBaisseDePrix && pourcentageBaisse !== null && (
            <div className="text-red-500 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-white/90">
              🔻 -{pourcentageBaisse}%
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-[#1A2942] text-sm sm:text-base mb-1 line-clamp-1 flex items-center gap-2">
          {isApiData && bienData?.statutBien && (
            <span 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: bienData.statutBien.slug === 'libre' ? '#2a7e3b' : bienData.statutBien.slug === 'loue' ? '#dc2626' : '#f97316'
              }}
            />
          )}
          {displayProperty.title}
        </h3>

        {/* Badge Vérifié */}
        {isApiData && isProprietaireVerified && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              Vérifié
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#D4A843]" />
          {displayProperty.location}, {displayProperty.city}
        </div>

        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          {[
            { icon: Maximize2, label: `${displayProperty.surface} m²` },
            ...(displayProperty.bedrooms > 0
              ? [{ icon: BedDouble, label: `${displayProperty.bedrooms} chambre${displayProperty.bedrooms > 1 ? "s" : ""}` }]
              : []),
            { icon: ShowerHead, label: `${displayProperty.bathrooms} salle${displayProperty.bathrooms > 1 ? "s" : ""} de bain` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="relative group/spec">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-slate-50 border border-slate-100 rounded-full cursor-default hover:border-slate-300 hover:bg-slate-100 transition-colors">
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              </span>
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0C1A35] text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover/spec:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1A35]" />
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 sm:pt-3 border-t border-slate-50">
          {isApiData ? (
            <Link
              to={`/annonce/${(property as BienAvecIsNew).id}`}
              className="bg-[#0C1A35] hover:bg-[#1A2942] text-white text-xs h-8 px-4 rounded-lg transition-colors inline-flex items-center"
            >
              Voir détails
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          ) : (
            <Button
              size="sm"
              className="bg-[#0C1A35] hover:bg-[#1A2942] text-white text-xs h-8 px-4 rounded-lg transition-colors"
            >
              Voir détails
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
