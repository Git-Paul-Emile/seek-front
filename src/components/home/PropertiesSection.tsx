import { useState, useMemo, useEffect, useRef } from "react";
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
import type { CarouselApi } from "@/components/ui/carousel";
import PropertyCard from "@/components/PropertyCard";
import { SORT_OPTIONS } from "@/data/home";
import { useDernieresAnnonces } from "@/hooks/useDernieresAnnonces";
import { useAnnoncesMiseEnAvant } from "@/hooks/useAnnoncesMiseEnAvant";
import { SkPropertyCards } from "@/components/ui/Skeleton";

const ROTATION_INTERVAL = 4000; // ms entre chaque glissement auto
const MAX_VISIBLE = 4;

const PropertiesSection = () => {
  const [sort, setSort] = useState("recent");
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: dernieresAnnonces = [], isLoading } = useDernieresAnnonces(10);
  const { data: miseEnAvantData, isLoading: isLoadingPremium } = useAnnoncesMiseEnAvant(20);

  // Extraire les annonces mises en avant (max MAX_VISIBLE si ≤ 5, sinon toutes pour la rotation)
  const annoncesMiseEnAvant = miseEnAvantData?.annonces ?? [];
  const hasPremium = annoncesMiseEnAvant.length > 0;
  const needsRotation = annoncesMiseEnAvant.length > MAX_VISIBLE;

  // Auto-rotation quand > 5 annonces
  useEffect(() => {
    if (!carouselApi || !needsRotation) return;
    autoPlayRef.current = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, ROTATION_INTERVAL);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [carouselApi, needsRotation]);

  // Tri côté client sur les 10 dernières annonces
  const sortedBiens = useMemo(() => {
    const base = [...dernieresAnnonces];
    if (sort === "oldest")     return base.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sort === "price-asc")  return base.sort((a, b) => (a.prix ?? 0) - (b.prix ?? 0));
    if (sort === "price-desc") return base.sort((a, b) => (b.prix ?? 0) - (a.prix ?? 0));
    return base; // "recent" - ordre API par défaut
  }, [dernieresAnnonces, sort]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-8">
        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: À LA UNE (Annonces Premium en slider horizontal)         */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {hasPremium && (
          <div className="mb-16">
            {/* En-tête de section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-0 gap-4">
              <div>
                <p className="text-amber-600 font-bold text-sm uppercase tracking-wider">
                  Exclusivité
                </p>
                <h2 className="font-bold text-[#1A2942]" style={{ fontSize: '1.8rem' }}>
                  À la une
                </h2>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto" />
            </div>

            {/* Slider horizontal des annonces premium */}
            {isLoadingPremium ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <SkPropertyCards count={4} />
              </div>
            ) : (
              <div
                className="relative px-2"
                onMouseEnter={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); }}
                onMouseLeave={() => {
                  if (!needsRotation || !carouselApi) return;
                  autoPlayRef.current = setInterval(() => {
                    if (carouselApi.canScrollNext()) carouselApi.scrollNext();
                    else carouselApi.scrollTo(0);
                  }, ROTATION_INTERVAL);
                }}
              >
                <Carousel
                  setApi={setCarouselApi}
                  opts={{ align: "start", loop: true, slidesToScroll: "auto" }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4" wrapperClassName="py-8 -my-6">
                    {annoncesMiseEnAvant.map((property) => (
                      <CarouselItem
                        key={property.id}
                        className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                      >
                        <div className="relative group h-full my-6">
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
              <h2 className="font-bold text-[#1A2942]" style={{ fontSize: '1.8rem' }}>
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
            </div>
          </div>

          {isLoading ? (
            <SkPropertyCards count={10} />
          ) : sortedBiens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6H9v6H3.75A.75.75 0 013 21V9.75z" />
              </svg>
              <p className="text-[#1A2942] font-semibold text-lg">Aucune annonce disponible</p>
              <p className="text-slate-400 text-sm mt-1">Revenez bientôt, de nouvelles annonces arrivent régulièrement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedBiens.slice(0, 10).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isApiData={true}
                />
              ))}
            </div>
          )}
          <div className="flex justify-center mt-10">
            <Link to="/annonces">
              <Button variant="outline" className="h-10 px-8 border-slate-200 text-[#1A2942] hover:border-[#0C1A35] text-sm">
                Toutes les annonces
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
