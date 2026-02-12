import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Star, Users, Sofa, Calendar } from "lucide-react";
import { Property, formatPrice, typeLabels, rentalModeLabels } from "@/data/properties";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard = ({ property, index = 0 }: PropertyCardProps) => {
  // Calculate available rooms count
  const availableRooms = property.rooms?.filter((r) => r.status === "libre").length || 0;

  // Check if furnished
  const isFurnished = property.furnished === true;

  // Format availability date
  const formatAvailability = () => {
    if (!property.availableFrom) return null;
    const date = new Date(property.availableFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date <= today) {
      return "Disponible immédiatement";
    }
    
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    return `Disponible à partir du ${date.toLocaleDateString("fr-FR", options)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/annonce/${property.id}`} className="group block">
        <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <img
              src={property.coverImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
              <Badge className="bg-secondary text-secondary-foreground text-xs">
                {typeLabels[property.type]}
              </Badge>
              {property.featured && (
                <Badge className="bg-featured text-featured-foreground text-xs gap-1">
                  <Star className="w-3 h-3" /> Vedette
                </Badge>
              )}
              {property.rentalMode === "colocation" && (
                <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                  <Users className="w-3 h-3" /> Colocation
                </Badge>
              )}
              {/* Badge meublé/non meublé */}
              {property.type !== "terrain" && property.type !== "bureau" && (
                <Badge className={`${isFurnished ? "bg-amber-500" : "bg-gray-500"} text-white text-xs gap-1`}>
                  <Sofa className="w-3 h-3" />
                  {isFurnished ? "Meublé" : "Non meublé"}
                </Badge>
              )}
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              {availableRooms > 0 && (
                <Badge className="bg-green-600 text-white text-xs gap-1">
                  <Bed className="w-3 h-3" /> {availableRooms} dispo
                </Badge>
              )}
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-foreground font-semibold border-0">
                {property.status === "libre" ? "Disponible" : property.status}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-primary font-bold text-lg">
                {formatPrice(property.price, property.status, property.rentalMode)}
              </p>
              <h3 className="font-display font-semibold text-card-foreground text-base mt-1 group-hover:text-primary transition-colors line-clamp-1">
                {property.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{property.location.neighborhood}, {property.location.city}</span>
            </div>

            {property.type !== "terrain" && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4" />
                  <span>{property.area} m²</span>
                </div>
              </div>
            )}
            
            {/* Colocation info */}
            {property.rentalMode === "colocation" && property.rooms && (
              <div className="text-xs text-muted-foreground pt-1">
                {property.rooms.length} chambres · {availableRooms} disponible{availableRooms > 1 ? "s" : ""}
              </div>
            )}

            {/* Disponibilité */}
            {property.availableFrom && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatAvailability()}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
