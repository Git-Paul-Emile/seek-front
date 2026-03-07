import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PropertyCard from "@/components/PropertyCard";
import { SORT_OPTIONS } from "@/data/home";
import { useDernieresAnnonces } from "@/hooks/useDernieresAnnonces";
import { useAnnoncesMiseEnAvant } from "@/hooks/useAnnoncesMiseEnAvant";

const PropertiesSection = () => {
  const [sort, setSort] = useState("recent");
  const { data: dernieresAnnonces = [], isLoading } = useDernieresAnnonces(8);
  const { data: miseEnAvantData, isLoading: isLoadingPremium } = useAnnoncesMiseEnAvant(6);

  // Extraire les annonces mises en avant
  const annoncesMiseEnAvant = miseEnAvantData?.annonces ?? [];
  const hasPremium = annoncesMiseEnAvant.length > 0;

  // Filtrer les dernières annonces pour exclure celles qui sont mises en avant
  const miseEnAvantIds = new Set(annoncesMiseEnAvant.map(b => b.id));
  const annoncesNormales = dernieresAnnonces.filter(b => !miseEnAvantIds.has(b.id));
  
  // Toutes les dernières annonces (pour le fallback)
  const toutesAnnonces = dernieresAnnonces;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: À LA UNE (Annonces Premium en slider horizontal)         */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {hasPremium && (
          <div className="mb-16">
            {/* En-tête de section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
              <div>
                <p className="text-amber-600 font-bold text-sm uppercase tracking-wider">
                  Exclusivité
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A2942]">
                  À la une
                </h2>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                <Link to="/annonces?filter=premium">
                  <Button variant="outline" className="h-9 border-slate-200 text-[#1A2942] hover:border-[#0C1A35] text-sm">
                    Toutes les annonces
                  </Button>
                </Link>
              </div>
            </div>

            {/* Slider horizontal des annonces premium */}
            {isLoadingPremium ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="relative">
                <Carousel 
                  opts={{ align: "start", loop: true }} 
                  className="w-full overflow-x-clip"
                >
                  <CarouselContent className="-ml-4">
                    {annoncesMiseEnAvant.map((property) => (
                      <CarouselItem 
                        key={property.id} 
                        className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                      >
                        <div className="relative group">
                          <PropertyCard 
                            property={property as any} 
                            isApiData={true} 
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 bg-white/90 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400" />
                  <CarouselNext className="right-2 bg-white/90 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400" />
                </Carousel>
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* SECTION 2: DERNIÈRES ANNONCES (Grille classique)                     */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">
                {hasPremium ? "Suite" : "À découvrir"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2942]">
                Dernières annonces
              </h2>
              <p className="text-slate-400 mt-1.5 text-sm">
                Découvrez les biens immobiliers les plus récents au Sénégal
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44 h-9 text-sm border-slate-200 text-[#1A2942] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link to="/annonces">
                <Button variant="outline" className="h-9 border-slate-200 text-[#1A2942] hover:border-[#0C1A35] text-sm">
                  Toutes les annonces
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {toutesAnnonces.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  isApiData={true} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
