import { MapPin, Maximize2, BedDouble, ShowerHead, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Property } from "@/data/home";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(price);

const PropertyCard = ({ property }: { property: Property }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-100">
    <div className="relative h-52">
      <Carousel className="w-full h-full">
        <CarouselContent>
          {property.images.map((img, idx) => (
            <CarouselItem key={idx}>
              <div className="relative h-52 bg-slate-100">
                <img
                  src={img}
                  alt={`${property.title} — image ${idx + 1}`}
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
        {property.type}
      </div>

      {property.isNew && (
        <div className="absolute top-3 right-3 bg-[#D4A843] text-[#0C1A35] text-xs font-bold px-2.5 py-1 rounded-lg">
          Nouveau
        </div>
      )}

      <div className="absolute bottom-3 left-3">
        <span className="text-white font-bold text-lg drop-shadow-lg">
          {formatPrice(property.price)}
        </span>
      </div>
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-[#1A2942] text-base mb-1 line-clamp-1">
        {property.title}
      </h3>

      <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#D4A843]" />
        {property.location}, {property.city}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {[
          { icon: Maximize2, label: `${property.surface} m²` },
          ...(property.bedrooms > 0
            ? [{ icon: BedDouble, label: `${property.bedrooms} chambre${property.bedrooms > 1 ? "s" : ""}` }]
            : []),
          { icon: ShowerHead, label: `${property.bathrooms} salle${property.bathrooms > 1 ? "s" : ""} de bain` },
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
        <Button
          size="sm"
          className="bg-[#0C1A35] hover:bg-[#1A2942] text-white text-xs h-8 px-4 rounded-lg transition-colors"
        >
          Voir détails
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  </div>
);

export default PropertyCard;
