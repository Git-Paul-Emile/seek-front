import { useParams, Link } from "react-router-dom";
import { mockProperties, formatPrice, typeLabels } from "@/data/properties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Bed, Bath, Maximize, MapPin, Star, Phone, Mail,
  Building2, ShieldCheck, ShoppingCart, GraduationCap, Eye
} from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import { motion } from "framer-motion";
import { useState } from "react";

const PropertyDetail = () => {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (!property) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Annonce introuvable</h1>
        <Link to="/annonces"><Button variant="outline">Retour aux annonces</Button></Link>
      </div>
    );
  }

  const similar = mockProperties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.location.city === property.location.city))
    .slice(0, 3);

  const proximityItems = [
    { icon: Building2, label: "Hôpital", value: property.proximity.hospital },
    { icon: ShieldCheck, label: "Poste de police", value: property.proximity.police },
    { icon: ShoppingCart, label: "Supermarché", value: property.proximity.supermarket },
    { icon: GraduationCap, label: "École", value: property.proximity.school },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Back */}
        <Link to="/annonces" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg overflow-hidden">
              <img
                src={property.images[activeImage] || property.coverImage}
                alt={property.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </motion.div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      i === activeImage ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">{typeLabels[property.type]}</Badge>
                <Badge variant="outline">{property.status}</Badge>
                {property.featured && (
                  <Badge className="bg-featured text-featured-foreground gap-1">
                    <Star className="w-3 h-3" /> Vedette
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>

              <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.location.address}, {property.location.city}</span>
              </div>

              <p className="text-2xl font-bold text-primary mb-6">
                {formatPrice(property.price, property.status)}
              </p>

              {property.type !== "terrain" && (
                <div className="flex gap-6 mb-6 p-4 bg-muted rounded-lg">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bedrooms}</p>
                        <p className="text-xs text-muted-foreground">Chambres</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bathrooms}</p>
                        <p className="text-xs text-muted-foreground">Salles de bain</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{property.area} m²</p>
                      <p className="text-xs text-muted-foreground">Surface</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Proximity */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">À proximité</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {proximityItems.map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-lg p-4 text-center">
                    <item.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">{item.value} km</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Tour */}
            {property.virtualTourUrl && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Visite Virtuelle</h2>
                <div className="bg-muted rounded-lg p-8 text-center border border-border">
                  <Eye className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="text-muted-foreground mb-4">Explorez ce bien en 360° depuis chez vous</p>
                  <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <Eye className="w-4 h-4" /> Lancer la visite virtuelle
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-4">Contacter le propriétaire</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{property.ownerName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{property.ownerName}</p>
                    <p className="text-xs text-muted-foreground">Propriétaire</p>
                  </div>
                </div>

                <a href={`tel:${property.ownerPhone}`}>
                  <Button className="w-full gap-2 mb-2" size="lg">
                    <Phone className="w-4 h-4" /> Appeler
                  </Button>
                </a>
                <a href={`mailto:${property.ownerEmail}`}>
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <Mail className="w-4 h-4" /> Envoyer un email
                  </Button>
                </a>
              </div>

              <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
                <p>Annonce publiée le {new Date(property.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">Annonces similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
