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
import CTACarouselCard from "@/components/home/CTACarouselCard";
import { SORT_OPTIONS } from "@/data/home";
import { useRecherchePublique } from "@/hooks/useRecherche";
import { useAnnoncesMiseEnAvant } from "@/hooks/useAnnoncesMiseEnAvant";
import { SkPropertyCards } from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import MarketingBanner from "@/components/home/MarketingBanner";

const ROTATION_INTERVAL = 30000; // 30s entre chaque glissement auto
const MAX_VISIBLE = 4;

const PropertiesSection = () => {
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [featuredOffset, setFeaturedOffset] = useState(0);
  const featuredAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const LIMIT = 30;

  const queryParams = useMemo(() => {
    const params: any = { limit: LIMIT, page };
    if (sort === "oldest") {
      params.sortBy = "createdAt";
      params.sortOrder = "asc";
    } else if (sort === "price-asc") {
      params.sortBy = "prix";
      params.sortOrder = "asc";
    } else if (sort === "price-desc") {
      params.sortBy = "prix";
      params.sortOrder = "desc";
    } else {
      params.sortBy = "createdAt";
      params.sortOrder = "desc";
    }
    return params;
  }, [sort, page]);

  const { data: searchResult, isLoading } = useRecherchePublique(queryParams);
  const total = searchResult?.total ?? 0;
  const totalPages = searchResult?.totalPages ?? 1;

  const { data: miseEnAvantData, isLoading: isLoadingPremium } = useAnnoncesMiseEnAvant(100);

  // Extraire les annonces mises en avant (max MAX_VISIBLE si ≤ 5, sinon toutes pour la rotation)
  const annoncesMiseEnAvant = miseEnAvantData?.annonces ?? [];
  const hasPremium = annoncesMiseEnAvant.length > 0;

  // Position de la carte CTA dans le carousel :
  // - 0 annonces : en premier (index 0)
  // - N < MAX_VISIBLE : après les annonces existantes (index N)
  // - N >= MAX_VISIBLE : au centre (index Math.floor(MAX_VISIBLE / 2) = 2)
  const ctaIndex =
    annoncesMiseEnAvant.length >= MAX_VISIBLE
      ? Math.floor(MAX_VISIBLE / 2)
      : annoncesMiseEnAvant.length;

  // Tableau des slides : annonces + carte CTA insérée à ctaIndex
  type CarouselSlide = { type: "property"; data: (typeof annoncesMiseEnAvant)[0] } | { type: "cta" };
  const carouselSlides: CarouselSlide[] = [
    ...annoncesMiseEnAvant.map((a) => ({ type: "property" as const, data: a })),
  ];
  carouselSlides.splice(ctaIndex, 0, { type: "cta" });

  // Rotation des 4 cartes "à la une" en tête de grille toutes les 30s
  useEffect(() => {
    if (annoncesMiseEnAvant.length <= 4) {
      setFeaturedOffset(0);
      if (featuredAutoRef.current) clearInterval(featuredAutoRef.current);
      return;
    }
    featuredAutoRef.current = setInterval(() => {
      setFeaturedOffset(prev => (prev + 4) % annoncesMiseEnAvant.length);
    }, ROTATION_INTERVAL);
    return () => { if (featuredAutoRef.current) clearInterval(featuredAutoRef.current); };
  }, [annoncesMiseEnAvant.length]);

  // Page 1 : les 4 premières positions tournent parmi toutes les annonces premium
  const dernieresAnnonces = useMemo(() => {
    const rawItems = searchResult?.items ?? [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const withIsNew = (item: any) => ({ ...item, isNew: new Date(item.createdAt) >= sevenDaysAgo });

    if (page === 1 && annoncesMiseEnAvant.length > 0) {
      const n = annoncesMiseEnAvant.length;
      const featured = Array.from({ length: Math.min(MAX_VISIBLE, n) }, (_, i) =>
        withIsNew(annoncesMiseEnAvant[(featuredOffset + i) % n])
      );
      const featuredIds = new Set(featured.map((f: any) => f.id));
      const regular = rawItems.filter(item => !featuredIds.has(item.id)).map(withIsNew);
      return [...featured, ...regular].slice(0, LIMIT);
    }
    return rawItems.map(withIsNew);
  }, [searchResult?.items, annoncesMiseEnAvant, page, featuredOffset]);
  const needsRotation = carouselSlides.length > MAX_VISIBLE;

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const pageWindow = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    let end = start + windowSize - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <section className="pt-10 pb-16 md:py-16 bg-white">
      <div className="container mx-auto px-8">
        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: À LA UNE (Annonces Premium + carte CTA en slider)        */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        <div className="mb-10 md:mb-16">
          {/* En-tête de section */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-5 gap-4">
            <div>
              <p className="text-amber-600 font-bold text-sm uppercase tracking-wider">
                Sélection
              </p>
              <h2 className="font-bold text-[#1A2942]" style={{ fontSize: '1.8rem' }}>
                Coups de cœur
              </h2>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto" />
          </div>

          {/* Slider horizontal des annonces premium + CTA */}
          {isLoadingPremium ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <SkPropertyCards count={4} />
            </div>
          ) : (
            <div
              className="relative pl-2"
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
                opts={{ align: "start", loop: carouselSlides.length > MAX_VISIBLE, slidesToScroll: "auto" }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {carouselSlides.map((slide) =>
                    slide.type === "cta" ? (
                      <CarouselItem
                        key="cta-card"
                        className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                      >
                        <CTACarouselCard />
                      </CarouselItem>
                    ) : (
                      <CarouselItem
                        key={slide.data.id}
                        className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                      >
                        <PropertyCard
                          property={slide.data as any}
                          isApiData={true}
                        />
                      </CarouselItem>
                    )
                  )}
                </CarouselContent>
                {carouselSlides.length > MAX_VISIBLE && (
                  <>
                    <CarouselPrevious className="left-2 bg-white/70 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400" />
                    <CarouselNext className="right-2 bg-white/70 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400" />
                  </>
                )}
              </Carousel>
            </div>
          )}
        </div>

        {/* ── BANNEmarketing ── */}
        <div className="mb-10 md:mb-16">
           <MarketingBanner />
        </div>

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* SECTION 2: DERNIÈRES ANNONCES (Grille classique)                     */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">
                {hasPremium ? "À explorer" : "Les dernières"}
              </p>
              <h2 className="font-bold text-[#1A2942]" style={{ fontSize: '1.8rem' }}>
                Nouvelles annonces
              </h2>
              <p className="text-slate-400 mt-1.5 text-sm">
                Fraîchement publiées — à ne pas manquer
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              <Select value={sort} onValueChange={(val) => { setSort(val); setPage(1); }}>
                <SelectTrigger className="w-44 h-9 text-sm border-slate-200 text-[#1A2942] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link to="/annonces">
                <Button variant="outline" className="h-9 px-6 border-slate-200 text-[#1A2942] hover:border-[#0C1A35] text-sm bg-white">
                  Voir toutes les annonces
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <SkPropertyCards count={LIMIT} />
          ) : dernieresAnnonces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6H9v6H3.75A.75.75 0 013 21V9.75z" />
              </svg>
              <p className="text-[#1A2942] font-semibold text-lg">Aucun bien disponible pour le moment</p>
              <p className="text-slate-400 text-sm mt-1">Nos propriétaires publient chaque jour — revenez très vite !</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {dernieresAnnonces.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property as any}
                    isApiData={true}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination 
                    page={page}
                    totalPages={totalPages}
                    pageWindow={pageWindow}
                    total={total}
                    pageSize={LIMIT}
                    goTo={handlePageChange}
                    goNext={() => handlePageChange(Math.min(totalPages, page + 1))}
                    goPrev={() => handlePageChange(Math.max(1, page - 1))}
                    reset={() => handlePageChange(1)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
