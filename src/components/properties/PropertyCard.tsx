import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Star } from "lucide-react";
import { Property, formatPrice, typeLabels } from "@/data/properties";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard = ({ property, index = 0 }: PropertyCardProps) => {
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
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-secondary text-secondary-foreground text-xs">
                {typeLabels[property.type]}
              </Badge>
              {property.featured && (
                <Badge className="bg-featured text-featured-foreground text-xs gap-1">
                  <Star className="w-3 h-3" /> Vedette
                </Badge>
              )}
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-foreground font-semibold border-0">
                {property.status}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-primary font-bold text-lg">
                {formatPrice(property.price, property.status)}
              </p>
              <h3 className="font-display font-semibold text-card-foreground text-base mt-1 group-hover:text-primary transition-colors line-clamp-1">
                {property.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{property.location.address}, {property.location.city}</span>
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
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
