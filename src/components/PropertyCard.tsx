import { MapPin, Maximize2, BedDouble, ShowerHead, ArrowRight } from "lucide-react";
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
    maximumFractionDigits: 0,
  }).format(price);

// Transformer les données de l'API en format PropertyCard
const transformBienToProperty = (bien: BienAvecIsNew): Property => ({
  id: parseInt(bien.id.replace(/\D/g, ""), 10) || Math.random(),
  type: bien.typeLogement?.nom || "Bien",
  title: bien.titre || "Annonce",
  price: bien.prix || 0,
  location: bien.quartier || bien.ville || "",
  city: bien.ville || "",
  surface: bien.surface || 0,
  bedrooms: bien.nbChambres || 0,
  bathrooms: bien.nbSdb || 0,
  images: bien.photos && bien.photos.length > 0 ? bien.photos : ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  features: { parking: bien.parking || false, generator: false, citerne: false },
  isNew: bien.isNew,
});

interface PropertyCardProps {
  property: Property | BienAvecIsNew;
  isApiData?: boolean;
}

const PropertyCard = ({ property, isApiData = false }: PropertyCardProps) => {
  // Si les données viennent de l'API, les transformer
  const displayProperty = isApiData ? transformBienToProperty(property as BienAvecIsNew) : (property as Property);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-100">
      <div className="relative h-52">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {displayProperty.images.map((img, idx) => (
              <CarouselItem key={idx}>
                <div className="relative h-52 bg-slate-100">
                  <img
                    src={img}
                    alt={`${displayProperty.title} — image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 h-7 w-7 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity border-0 shadow-md" />
          <CarouselNext className="right-2 h-7 w-7 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity border-0 shadow-md" />
        </Carousel>

        <div className="absolute top-3 left-3 bg-[#0C1A35]/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
          {displayProperty.type}
        </div>

        {displayProperty.isNew && (
          <div className="absolute top-3 right-3 bg-[#D4A843] text-[#0C1A35] text-xs font-bold px-2.5 py-1 rounded-lg">
            Nouveau
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="text-white font-bold text-lg drop-shadow-lg">
            {formatPrice(displayProperty.price)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#1A2942] text-base mb-1 line-clamp-1">
          {displayProperty.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#D4A843]" />
          {displayProperty.location}, {displayProperty.city}
        </div>

        <div className="flex items-center gap-2 mb-4">
          {[
            { icon: Maximize2, label: `${displayProperty.surface} m²` },
            ...(displayProperty.bedrooms > 0
              ? [{ icon: BedDouble, label: `${displayProperty.bedrooms} chambre${displayProperty.bedrooms > 1 ? "s" : ""}` }]
              : []),
            { icon: ShowerHead, label: `${displayProperty.bathrooms} salle${displayProperty.bathrooms > 1 ? "s" : ""} de bain` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="relative group/spec">
              <span className="flex items-center justify-center w-8 h-8 bg-slate-50 border border-slate-100 rounded-full cursor-default hover:border-slate-300 hover:bg-slate-100 transition-colors">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0C1A35] text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover/spec:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1A35]" />
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-50">
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
