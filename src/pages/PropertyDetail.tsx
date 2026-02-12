import { useParams, Link } from "react-router-dom";
import { mockProperties } from "@/data/properties";
import { Button } from "@/components/ui/button";
import PropertyAnnounceDetail from "@/components/properties/PropertyAnnounceDetail";

const PropertyDetail = () => {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Annonce introuvable</h1>
        <Link to="/annonces"><Button variant="outline">Retour aux annonces</Button></Link>
      </div>
    );
  }

  return <PropertyAnnounceDetail property={property} />;
};

export default PropertyDetail;
