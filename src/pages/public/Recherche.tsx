import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, MapPin, X, Loader2, Building2,
  BedDouble, Maximize2, ShowerHead,
  ArrowRight, Car, Armchair, ChevronDown, ChevronLeft, ChevronRight,
  SlidersHorizontal, ArrowUpDown,
  PawPrint, Cigarette, Check, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import PropertyCard from "@/components/PropertyCard";
import Pagination from "@/components/ui/Pagination";
import { useRecherchePublique, useLieux } from "@/hooks/useRecherche";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useTypeTransactions } from "@/hooks/useTypeTransactions";
import { useEquipements } from "@/hooks/useEquipements";
import { useAnnoncesMiseEnAvant } from "@/hooks/useAnnoncesMiseEnAvant";
import ScrollToTop from "@/components/ui/ScrollToTop";
import type { Bien } from "@/api/bien";

// ─── Tri ──────────────────────────────────────────────────────────────────────

type SortKey = "recent" | "ancien" | "prix_asc" | "prix_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent",    label: "Plus récent"      },
  { value: "ancien",    label: "Plus ancien"      },
  { value: "prix_asc",  label: "Prix croissant"   },
  { value: "prix_desc", label: "Prix décroissant" },
];

function sortToParams(sort: SortKey): { sortBy: "prix" | "createdAt"; sortOrder: "asc" | "desc" } {
  if (sort === "prix_asc")  return { sortBy: "prix",      sortOrder: "asc"  };
  if (sort === "prix_desc") return { sortBy: "prix",      sortOrder: "desc" };
  if (sort === "ancien")    return { sortBy: "createdAt", sortOrder: "asc"  };
  return                           { sortBy: "createdAt", sortOrder: "desc" };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
    <div className="h-52 bg-slate-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-slate-100 rounded-full" />
        <div className="h-8 w-8 bg-slate-100 rounded-full" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex overflow-hidden animate-pulse">
    <div className="w-48 flex-shrink-0 bg-slate-100 h-36" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-1/4" />
    </div>
  </div>
);

// ─── Card liste horizontale ───────────────────────────────────────────────────

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF" }).format(price);

const ListCard = ({ bien }: { bien: Bien }) => {
  const img = bien.photos?.[0] ?? "/placeholder.svg";
  
  // Collecter les caractéristiques (max 5)
  const features: string[] = [];
  if (bien.parking) features.push("Parking");
  if (bien.ascenseur) features.push("Ascenseur");
  if (bien.meuble) features.push("Meublé");
  if (bien.equipements && bien.equipements.length > 0) {
    bien.equipements.forEach((eq) => {
      if (features.length < 5) {
        features.push(eq.equipement.nom);
      }
    });
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex overflow-hidden hover:shadow-md transition-shadow group">
      <div className="w-44 sm:w-56 flex-shrink-0 relative overflow-hidden">
        <img
          src={img}
          alt={bien.titre ?? "Annonce"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[#1A2942] text-base line-clamp-1">
              {bien.titre ?? "Annonce"}
            </h3>
            {bien.prix !== null && (
              <span className="text-[#D4A843] font-bold text-base flex-shrink-0">
                {formatPrice(bien.prix)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#D4A843] flex-shrink-0" />
            {[bien.quartier, bien.region].filter(Boolean).join(", ") || bien.pays}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {bien.surface && bien.surface > 0 && (
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />{bien.surface} m²
              </span>
            )}
            {!!bien.nbChambres && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5" />
                {bien.nbChambres} chambre{bien.nbChambres > 1 ? "s" : ""}
              </span>
            )}
            {!!bien.nbSdb && (
              <span className="flex items-center gap-1">
                <ShowerHead className="w-3.5 h-3.5" />{bien.nbSdb} sdb
              </span>
            )}
          </div>
          {/* Caractéristiques - affichage conditionnel (max 5) */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {features.slice(0, 5).map((feature, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <span className="text-xs text-slate-300">
            {new Date(bien.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <Link
            to={`/annonce/${bien.id}`}
            className="inline-flex items-center gap-1.5 bg-[#0C1A35] hover:bg-[#1A2942] text-white text-xs px-3 h-8 rounded-lg transition-colors"
          >
            Voir détails <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

const RecherchePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [ville,           setVille]           = useState(searchParams.get("ville") ?? "");
  const [quartier,        setQuartier]        = useState(searchParams.get("quartier") ?? "");
  const [typeLogement,    setTypeLogement]    = useState(searchParams.get("typeLogement") ?? "");
  const [typeTransaction, setTypeTransaction] = useState(searchParams.get("typeTransaction") ?? "");
  const [sort,            setSort]            = useState<SortKey>((searchParams.get("sort") as SortKey) ?? "recent");

  // Filtres avancés
  const [showAvanced,      setShowAdvanced]      = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [prixMin,      setPrixMin]      = useState(searchParams.get("prixMin") ?? "");
  const [prixMax,      setPrixMax]      = useState(searchParams.get("prixMax") ?? "");
  const [chambres,     setChambres]     = useState(searchParams.get("chambres") ?? "");
  const [surfaceMin,   setSurfaceMin]   = useState(searchParams.get("surfaceMin") ?? "");
  const [surfaceMax,   setSurfaceMax]   = useState(searchParams.get("surfaceMax") ?? "");
  const [misEnAvant,   setMisEnAvant]   = useState(searchParams.get("misEnAvant") === "1");
  const [meuble,       setMeuble]       = useState(searchParams.get("meuble") === "1");
  const [parking,      setParking]      = useState(searchParams.get("parking") === "1");
  const [ascenseur,    setAscenseur]    = useState(searchParams.get("ascenseur") === "1");
  const [fumeurs,      setFumeurs]      = useState(searchParams.get("fumeurs") === "1");
  const [animaux,      setAnimaux]      = useState(searchParams.get("animaux") === "1");
  const [selectedEquipements, setSelectedEquipements] = useState<string[]>(
    () => searchParams.get("equipementIds")?.split(",").filter(Boolean) ?? []
  );
  const [caracOpen,    setCaracOpen]    = useState(false);
  const [caracSearch,  setCaracSearch]  = useState("");
  const [featuredOffset,  setFeaturedOffset]  = useState(0);
  const caracRef           = useRef<HTMLDivElement>(null);
  const autoFilterTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featuredAutoRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fermer le dropdown caractéristiques au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (caracRef.current && !caracRef.current.contains(e.target as Node))
        setCaracOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-application des filtres avancés (debounce 400ms)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoFilterTimer.current) clearTimeout(autoFilterTimer.current);
    autoFilterTimer.current = setTimeout(() => {
      const next = buildParams(1);
      if (next.toString() !== searchParams.toString()) setSearchParams(next);
    }, 400);
    return () => { if (autoFilterTimer.current) clearTimeout(autoFilterTimer.current); };
  // selectedEquipements.join() évite la comparaison de référence sur le tableau
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prixMin, prixMax, chambres, surfaceMin, surfaceMax,
      misEnAvant, meuble, parking, ascenseur, fumeurs, animaux,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      selectedEquipements.join(",")]);

  const sp = searchParams;
  const sortParams = sortToParams((sp.get("sort") as SortKey) ?? "recent");

  // Mode proximité
  const proximityLat    = sp.get("lat")        ? Number(sp.get("lat"))  : undefined;
  const proximityLng    = sp.get("lng")        ? Number(sp.get("lng"))  : undefined;
  const proximityLabel  = sp.get("pointLabel") ?? undefined;
  const proximityRadius = sp.get("radius")     ? Number(sp.get("radius")) : 5;
  const isProximityMode = proximityLat !== undefined && proximityLng !== undefined;

  const activeParams = {
    ville:           sp.get("ville")           || undefined,
    quartier:        sp.get("quartier")        || undefined,
    typeLogement:    sp.get("typeLogement")    || undefined,
    typeTransaction: sp.get("typeTransaction") || undefined,
    prixMin:    sp.get("prixMin")    ? Number(sp.get("prixMin"))    : undefined,
    prixMax:    sp.get("prixMax")    ? Number(sp.get("prixMax"))    : undefined,
    chambres:   sp.get("chambres")   ? Number(sp.get("chambres"))   : undefined,
    surfaceMin: sp.get("surfaceMin") ? Number(sp.get("surfaceMin")) : undefined,
    surfaceMax: sp.get("surfaceMax") ? Number(sp.get("surfaceMax")) : undefined,
    misEnAvant: sp.get("misEnAvant") === "1" ? "1" as const : undefined,
    meuble:     sp.get("meuble")    === "1" ? "1" as const : undefined,
    parking:    sp.get("parking")   === "1" ? "1" as const : undefined,
    ascenseur:  sp.get("ascenseur") === "1" ? "1" as const : undefined,
    fumeurs:    sp.get("fumeurs")   === "1" ? "1" as const : undefined,
    animaux:    sp.get("animaux")   === "1" ? "1" as const : undefined,
    equipementIds: sp.get("equipementIds") || undefined,
    featuredFirst: "1" as const,
    sortBy:    isProximityMode ? undefined : sortParams.sortBy,
    sortOrder: isProximityMode ? undefined : sortParams.sortOrder,
    page:  parseInt(sp.get("page") ?? "1"),
    limit: 30,
    lat:    proximityLat,
    lng:    proximityLng,
    radius: isProximityMode ? proximityRadius : undefined,
  };

  const { data, isLoading, isFetching } = useRecherchePublique(activeParams);
  const { data: typesLogement = [] }    = useTypeLogements();
  const { data: typesTransaction = [] } = useTypeTransactions();
  const { data: lieux }                 = useLieux();
  const { data: equipements = [] }      = useEquipements();
  const { data: miseEnAvantData }       = useAnnoncesMiseEnAvant(100);

  const items              = data?.items      ?? [];
  const total              = data?.total      ?? 0;
  const totalPages         = data?.totalPages ?? 1;
  const annoncesMiseEnAvant = miseEnAvantData?.annonces ?? [];

  // Rotation des 4 premières positions de grille toutes les 30s
  const MAX_FEATURED = 4;
  useEffect(() => {
    if (annoncesMiseEnAvant.length <= MAX_FEATURED) {
      setFeaturedOffset(0);
      if (featuredAutoRef.current) clearInterval(featuredAutoRef.current);
      return;
    }
    featuredAutoRef.current = setInterval(() => {
      setFeaturedOffset(prev => (prev + MAX_FEATURED) % annoncesMiseEnAvant.length);
    }, 30000);
    return () => { if (featuredAutoRef.current) clearInterval(featuredAutoRef.current); };
  }, [annoncesMiseEnAvant.length]);

  // Items à afficher : annonces premium en tête (rotation 30s) + résultats sans doublons
  const displayItems = useMemo(() => {
    if (annoncesMiseEnAvant.length === 0) return items;
    const n = annoncesMiseEnAvant.length;
    const featured = Array.from({ length: Math.min(MAX_FEATURED, n) }, (_, i) =>
      annoncesMiseEnAvant[(featuredOffset + i) % n]
    ) as unknown as typeof items;
    const featuredIds = new Set(featured.map(f => f.id));
    return [...featured, ...items.filter(item => !featuredIds.has(item.id))];
  }, [items, annoncesMiseEnAvant, featuredOffset]);

  useEffect(() => {
    setVille(searchParams.get("ville") ?? "");
    setQuartier(searchParams.get("quartier") ?? "");
    setTypeLogement(searchParams.get("typeLogement") ?? "");
    setTypeTransaction(searchParams.get("typeTransaction") ?? "");
    setSort((searchParams.get("sort") as SortKey) ?? "recent");
    setPrixMin(searchParams.get("prixMin") ?? "");
    setPrixMax(searchParams.get("prixMax") ?? "");
    setChambres(searchParams.get("chambres") ?? "");
    setSurfaceMin(searchParams.get("surfaceMin") ?? "");
    setSurfaceMax(searchParams.get("surfaceMax") ?? "");
    setMisEnAvant(searchParams.get("misEnAvant") === "1");
    setMeuble(searchParams.get("meuble") === "1");
    setParking(searchParams.get("parking") === "1");
    setAscenseur(searchParams.get("ascenseur") === "1");
    setFumeurs(searchParams.get("fumeurs") === "1");
    setAnimaux(searchParams.get("animaux") === "1");
    setSelectedEquipements(searchParams.get("equipementIds")?.split(",").filter(Boolean) ?? []);
  }, [searchParams]);

  const buildParams = (
    overridePage?: number,
    overrideSort?: SortKey,
    overrides?: { ville?: string; quartier?: string; typeLogement?: string; typeTransaction?: string }
  ) => {
    const s  = overrideSort ?? sort;
    const v  = overrides?.ville           !== undefined ? overrides.ville           : ville;
    const q  = overrides?.quartier        !== undefined ? overrides.quartier        : quartier;
    const tl = overrides?.typeLogement    !== undefined ? overrides.typeLogement    : typeLogement;
    const tt = overrides?.typeTransaction !== undefined ? overrides.typeTransaction : typeTransaction;
    const next = new URLSearchParams();
    if (v)              next.set("ville",           v);
    if (q)              next.set("quartier",        q);
    if (tl)             next.set("typeLogement",    tl);
    if (tt)             next.set("typeTransaction", tt);
    if (prixMin)        next.set("prixMin",         prixMin);
    if (prixMax)        next.set("prixMax",         prixMax);
    if (chambres)       next.set("chambres",        chambres);
    if (surfaceMin)     next.set("surfaceMin",      surfaceMin);
    if (surfaceMax)     next.set("surfaceMax",      surfaceMax);
    if (misEnAvant)                      next.set("misEnAvant",     "1");
    if (meuble)                         next.set("meuble",         "1");
    if (parking)                        next.set("parking",        "1");
    if (ascenseur)                      next.set("ascenseur",      "1");
    if (fumeurs)                        next.set("fumeurs",        "1");
    if (animaux)                        next.set("animaux",        "1");
    if (selectedEquipements.length > 0) next.set("equipementIds", selectedEquipements.join(","));
    if (s !== "recent") next.set("sort",            s);
    // Conserver les params de proximité s'ils sont actifs
    if (isProximityMode) {
      if (proximityLat)    next.set("lat",        String(proximityLat));
      if (proximityLng)    next.set("lng",        String(proximityLng));
      if (proximityLabel)  next.set("pointLabel", proximityLabel);
      next.set("radius", String(proximityRadius));
    }
    next.set("page", String(overridePage ?? 1));
    return next;
  };

  const applyFilters = (overridePage?: number) => setSearchParams(buildParams(overridePage));

  const applySort = (s: SortKey) => {
    setSort(s);
    setSearchParams(buildParams(1, s));
  };

  const clearFilters = () => {
    setVille(""); setQuartier(""); setTypeLogement(""); setTypeTransaction(""); setSort("recent");
    setPrixMin(""); setPrixMax(""); setChambres(""); setSurfaceMin(""); setSurfaceMax("");
    setMisEnAvant(false); setMeuble(false); setParking(false); setAscenseur(false); setFumeurs(false); setAnimaux(false);
    setSelectedEquipements([]);
    setSearchParams({ page: "1" }); // supprime aussi lat/lng/pointLabel
  };

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  // ── Options ──
  const villeOptions    = (lieux?.villes    ?? []).map((v) => ({ value: v, label: v }));
  const quartierOptions = (lieux?.quartiers ?? []).map((q) => ({ value: q, label: q }));
  const typeLogementOptions    = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));
  const typeTransactionOptions = typesTransaction.map((t) => ({ value: t.slug, label: t.nom }));

  // ── Groupement équipements par catégorie ──
  const equipementsGroupes = useMemo(() => {
    const map = new Map<string, { categorie: string; items: typeof equipements }>();
    equipements.filter((e) => e.actif).forEach((e) => {
      const cat = e.categorie.nom;
      if (!map.has(cat)) map.set(cat, { categorie: cat, items: [] });
      map.get(cat)!.items.push(e);
    });
    return Array.from(map.values());
  }, [equipements]);

  // ── Chips ──
  interface Chip { label: string; onRemove: () => void }
  const chips: Chip[] = [];

  // Chip mode proximité
  if (isProximityMode) {
    const shortLabel = proximityLabel ? proximityLabel.split(",")[0] : "Point sélectionné";
    chips.push({
      label: `Proximité : ${shortLabel} (${proximityRadius} km)`,
      onRemove: () => {
        const next = new URLSearchParams(searchParams);
        next.delete("lat"); next.delete("lng"); next.delete("pointLabel");
        next.set("page", "1");
        setSearchParams(next);
      },
    });
  }

  if (sp.get("ville"))
    chips.push({ label: sp.get("ville")!, onRemove: () => removeFilter("ville") });
  if (sp.get("quartier"))
    chips.push({ label: sp.get("quartier")!, onRemove: () => removeFilter("quartier") });
  if (sp.get("typeLogement"))
    chips.push({
      label: typeLogementOptions.find((t) => t.value === sp.get("typeLogement"))?.label ?? sp.get("typeLogement")!,
      onRemove: () => removeFilter("typeLogement"),
    });
  if (sp.get("typeTransaction"))
    chips.push({
      label: typeTransactionOptions.find((t) => t.value === sp.get("typeTransaction"))?.label ?? sp.get("typeTransaction")!,
      onRemove: () => removeFilter("typeTransaction"),
    });
  if (sp.get("prixMin") || sp.get("prixMax")) {
    const min = sp.get("prixMin"), max = sp.get("prixMax");
    const label = min && max ? `${Number(min).toLocaleString("fr-FR")} – ${Number(max).toLocaleString("fr-FR")} FCFA`
      : min ? `≥ ${Number(min).toLocaleString("fr-FR")} FCFA`
      : `≤ ${Number(max).toLocaleString("fr-FR")} FCFA`;
    chips.push({ label, onRemove: () => { removeFilter("prixMin"); removeFilter("prixMax"); } });
  }
  if (sp.get("chambres"))
    chips.push({ label: `${sp.get("chambres")}+ chambre(s)`, onRemove: () => removeFilter("chambres") });
  if (sp.get("surfaceMin") || sp.get("surfaceMax")) {
    const min = sp.get("surfaceMin"), max = sp.get("surfaceMax");
    const label = min && max ? `${min}–${max} m²` : min ? `≥ ${min} m²` : `≤ ${max} m²`;
    chips.push({ label, onRemove: () => { removeFilter("surfaceMin"); removeFilter("surfaceMax"); } });
  }
  if (sp.get("misEnAvant") === "1") chips.push({ label: "À la une", onRemove: () => removeFilter("misEnAvant") });
  if (sp.get("meuble")    === "1") chips.push({ label: "Meublé",    onRemove: () => removeFilter("meuble") });
  if (sp.get("parking")   === "1") chips.push({ label: "Parking",   onRemove: () => removeFilter("parking") });
  if (sp.get("ascenseur") === "1") chips.push({ label: "Ascenseur", onRemove: () => removeFilter("ascenseur") });
  if (sp.get("fumeurs")   === "1") chips.push({ label: "Fumeurs",   onRemove: () => removeFilter("fumeurs") });
  if (sp.get("animaux")   === "1") chips.push({ label: "Animaux",   onRemove: () => removeFilter("animaux") });
  const activeEqIds = sp.get("equipementIds")?.split(",").filter(Boolean) ?? [];
  activeEqIds.forEach((eqId) => {
    const eq = equipements.find((e) => e.id === eqId);
    if (eq) chips.push({
      label: eq.nom,
      onRemove: () => {
        const remaining = activeEqIds.filter((id) => id !== eqId);
        const next = new URLSearchParams(searchParams);
        if (remaining.length > 0) next.set("equipementIds", remaining.join(","));
        else next.delete("equipementIds");
        next.set("page", "1");
        setSearchParams(next);
      },
    });
  });

  const nbAdvancedActive = [
    sp.get("prixMin"), sp.get("prixMax"), sp.get("chambres"),
    sp.get("surfaceMin"), sp.get("surfaceMax"),
    sp.get("misEnAvant"), sp.get("meuble"), sp.get("parking"), sp.get("ascenseur"),
    sp.get("fumeurs"), sp.get("animaux"),
  ].filter(Boolean).length + activeEqIds.length;

  const hasFilters = chips.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F5EE]">

      {/* ── Barre de recherche ── */}
      {/* Mobile : bouton compact + panneau plein écran */}
      <div className="lg:hidden bg-[#0C1A35] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between gap-3">
          <span className="text-white/60 text-sm">
            {isLoading ? "Recherche…" : `${total} annonce${total > 1 ? "s" : ""}`}
          </span>
          <button
            onClick={() => setShowMobileFilters(prev => !prev)}
            className={`h-10 flex items-center gap-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
              chips.length > 0
                ? "border-[#D4A843] bg-[#D4A843]/20 text-[#D4A843]"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {chips.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D4A843] text-white text-xs flex items-center justify-center font-bold">
                {chips.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile : panneau filtres plein écran */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0C1A35] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <span className="text-white font-semibold text-base">Filtres</span>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-1">Ville / Région</label>
              <SearchableSelect
                value={ville}
                onChange={(val) => { setVille(val); setSearchParams(buildParams(1, undefined, { ville: val })); }}
                options={villeOptions}
                placeholder="Ville / Région…"
                searchPlaceholder="Rechercher une ville…"
                dark
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Quartier</label>
              <SearchableSelect
                value={quartier}
                onChange={(val) => { setQuartier(val); setSearchParams(buildParams(1, undefined, { quartier: val })); }}
                options={quartierOptions}
                placeholder="Quartier…"
                searchPlaceholder="Rechercher un quartier…"
                dark
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Type de logement</label>
              <SearchableSelect
                value={typeLogement}
                onChange={(val) => { setTypeLogement(val); setSearchParams(buildParams(1, undefined, { typeLogement: val })); }}
                options={typeLogementOptions}
                placeholder="Tous les types"
                searchPlaceholder="Rechercher un type…"
                dark
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Type de transaction</label>
              <SearchableSelect
                value={typeTransaction}
                onChange={(val) => { setTypeTransaction(val); setSearchParams(buildParams(1, undefined, { typeTransaction: val })); }}
                options={typeTransactionOptions}
                placeholder="Vente & Location"
                searchPlaceholder="Rechercher…"
                dark
              />
            </div>
            {!isProximityMode && (
              <div>
                <label className="block text-xs text-white/60 mb-1">Trier par</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => applySort(e.target.value as SortKey)}
                    className="w-full h-11 appearance-none bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 pr-8 focus:outline-none focus:border-white/40 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-[#0C1A35] text-white">{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                </div>
              </div>
            )}
            {isProximityMode && (
              <div>
                <label className="block text-xs text-white/60 mb-1">Rayon</label>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set("radius", String(km));
                        next.set("page", "1");
                        setSearchParams(next);
                      }}
                      className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        proximityRadius === km
                          ? "bg-[#D4A843] border-[#D4A843] text-white"
                          : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Options rapides mobile */}
            <div className="border-t border-white/10 pt-4 flex gap-2 flex-wrap">
              <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-sm transition-all ${misEnAvant ? "bg-[#D4A843]/15 border-[#D4A843]/40 text-white" : "bg-white/5 border-white/10 text-white/70"}`}>
                <input type="checkbox" checked={misEnAvant} onChange={e => setMisEnAvant(e.target.checked)} className="sr-only" />
                <Star className={`w-3.5 h-3.5 ${misEnAvant ? "text-[#D4A843]" : "text-white/40"}`} />
                À la une
              </label>
              <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-sm transition-all ${meuble ? "bg-[#D4A843]/15 border-[#D4A843]/40 text-white" : "bg-white/5 border-white/10 text-white/70"}`}>
                <input type="checkbox" checked={meuble} onChange={e => setMeuble(e.target.checked)} className="sr-only" />
                <Armchair className={`w-3.5 h-3.5 ${meuble ? "text-[#D4A843]" : "text-white/40"}`} />
                Meublé
              </label>
            </div>

            {/* Filtres avancés dans le panneau mobile */}
            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Prix min (FCFA)</label>
                <input type="number" value={prixMin} onChange={e => setPrixMin(e.target.value)} placeholder="0" className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Prix max (FCFA)</label>
                <input type="number" value={prixMax} onChange={e => setPrixMax(e.target.value)} placeholder="Illimité" className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Chambres min</label>
                <div className="relative">
                  <select value={chambres} onChange={e => setChambres(e.target.value)} className="w-full h-9 appearance-none bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 pr-7 focus:outline-none focus:border-white/40">
                    <option value="" className="bg-[#0C1A35]">Toutes</option>
                    {[1,2,3,4,5].map(n => (<option key={n} value={n} className="bg-[#0C1A35]">{n}+</option>))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Surface min (m²)</label>
                <input type="number" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)} placeholder="0" className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Surface max (m²)</label>
                <input type="number" value={surfaceMax} onChange={e => setSurfaceMax(e.target.value)} placeholder="Illimitée" className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
              </div>
              {/* Caractéristiques multi-select (identique au desktop) */}
              {(() => {
                const BOOL_OPTIONS = [
                  { key: "meuble",    label: "Meublé",           Icon: Armchair,    state: meuble,    set: setMeuble    },
                  { key: "parking",   label: "Parking",          Icon: Car,         state: parking,   set: setParking   },
                  { key: "ascenseur", label: "Ascenseur",        Icon: ArrowUpDown, state: ascenseur, set: setAscenseur },
                  { key: "fumeurs",   label: "Fumeurs acceptés", Icon: Cigarette,   state: fumeurs,   set: setFumeurs   },
                  { key: "animaux",   label: "Animaux acceptés", Icon: PawPrint,    state: animaux,   set: setAnimaux   },
                ];
                const nbBoolSelected = BOOL_OPTIONS.filter(o => o.state).length;
                const totalSelected  = nbBoolSelected + selectedEquipements.length;
                const btnLabel = totalSelected === 0 ? "Caractéristiques"
                  : totalSelected === 1
                    ? (BOOL_OPTIONS.find(o => o.state)?.label
                        ?? equipements.find(e => e.id === selectedEquipements[0])?.nom
                        ?? "1 sélectionné")
                  : `${totalSelected} sélectionnés`;

                const lowerSearch = caracSearch.toLowerCase();
                const filteredGroups = equipementsGroupes.map(g => ({
                  ...g,
                  items: g.items.filter(e => e.nom.toLowerCase().includes(lowerSearch)),
                })).filter(g => g.items.length > 0);

                return (
                  <div className="relative col-span-2">
                    <label className="block text-xs text-white/60 mb-1">Caractéristiques</label>
                    <button
                      type="button"
                      onClick={() => setCaracOpen(p => !p)}
                      className={`w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg border text-sm transition-colors ${
                        totalSelected > 0
                          ? "bg-[#D4A843]/15 border-[#D4A843]/50 text-[#D4A843]"
                          : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <span className="truncate text-left">{btnLabel}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {totalSelected > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#D4A843] text-white text-[10px] flex items-center justify-center font-bold">
                            {totalSelected}
                          </span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${caracOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {caracOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#0C1A35] border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-2 border-b border-white/10">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                            <input
                              type="text"
                              value={caracSearch}
                              onChange={e => setCaracSearch(e.target.value)}
                              placeholder="Filtrer…"
                              className="w-full h-8 bg-white/10 border border-white/15 text-white text-xs rounded-lg pl-8 pr-3 focus:outline-none focus:border-white/30 placeholder:text-white/25"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-72">
                          {BOOL_OPTIONS.filter(o => o.label.toLowerCase().includes(lowerSearch)).length > 0 && (
                            <div>
                              <div className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-white/25 font-semibold">Options</div>
                              {BOOL_OPTIONS.filter(o => o.label.toLowerCase().includes(lowerSearch)).map(({ key, label, Icon, state: val, set }) => (
                                <label
                                  key={key}
                                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all duration-100 ${
                                    val ? "bg-[#D4A843]/10" : "hover:bg-white/6"
                                  }`}
                                >
                                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="sr-only" />
                                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-150 flex-shrink-0 ${
                                    val ? "bg-[#D4A843] border-[#D4A843] shadow-[0_0_6px_rgba(212,168,67,0.4)]" : "bg-transparent border-white/20"
                                  }`}>
                                    {val && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                  </span>
                                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${val ? "text-[#D4A843]/80" : "text-white/35"}`} />
                                  <span className={`text-sm transition-colors ${val ? "text-white font-medium" : "text-white/70"}`}>{label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {filteredGroups.map(group => (
                            <div key={group.categorie}>
                              <div className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-white/25 font-semibold">{group.categorie}</div>
                              {group.items.map(eq => {
                                const isChecked = selectedEquipements.includes(eq.id);
                                return (
                                  <label
                                    key={eq.id}
                                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all duration-100 ${
                                      isChecked ? "bg-[#D4A843]/10" : "hover:bg-white/6"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={e => {
                                        setSelectedEquipements(prev =>
                                          e.target.checked ? [...prev, eq.id] : prev.filter(id => id !== eq.id)
                                        );
                                      }}
                                      className="sr-only"
                                    />
                                    <span className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-150 flex-shrink-0 ${
                                      isChecked ? "bg-[#D4A843] border-[#D4A843] shadow-[0_0_6px_rgba(212,168,67,0.4)]" : "bg-transparent border-white/20"
                                    }`}>
                                      {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                    </span>
                                    <span className={`text-sm transition-colors ${isChecked ? "text-white font-medium" : "text-white/70"}`}>{eq.nom}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ))}
                          {filteredGroups.length === 0 && BOOL_OPTIONS.filter(o => o.label.toLowerCase().includes(lowerSearch)).length === 0 && (
                            <p className="text-xs text-white/30 text-center py-4">Aucun résultat</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Boutons d'action mobile — toujours visibles en bas */}
          <div className="flex-shrink-0 flex gap-3 p-4 border-t border-white/10 bg-[#0C1A35]">
            <button
              onClick={() => { clearFilters(); setShowMobileFilters(false); }}
              className="flex-1 h-11 rounded-lg border border-white/20 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Tout effacer
            </button>
            <Button
              onClick={() => { applyFilters(); setShowMobileFilters(false); }}
              className="flex-1 h-11 bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      )}

      {/* ── Layout desktop : sidebar gauche + contenu ── */}
      <div className="lg:flex">

        {/* ── Sidebar filtres (desktop uniquement) ── */}
        <aside className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-100 z-30 transition-all duration-300 ${sidebarCollapsed ? "w-14" : "w-72"}`}>

          {/* Header sidebar */}
          <div className={`flex items-center border-b border-slate-100 flex-shrink-0 ${sidebarCollapsed ? "justify-center px-0 py-4" : "justify-between px-4 py-4"}`}>
            {!sidebarCollapsed && (
              <span className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4A843]" />
                Filtres
                {nbAdvancedActive > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#D4A843] text-white text-xs flex items-center justify-center font-bold">
                    {nbAdvancedActive}
                  </span>
                )}
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(p => !p)}
              title={sidebarCollapsed ? "Afficher les filtres" : "Réduire les filtres"}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsed : icône filtres + badge */}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center gap-3 pt-4">
              <div className="relative">
                <SlidersHorizontal className="w-5 h-5 text-slate-400" />
                {nbAdvancedActive > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#D4A843] text-white text-[9px] flex items-center justify-center font-bold">
                    {nbAdvancedActive}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Corps scrollable (masqué quand réduit) */}
          {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            <div>
              <label className="block text-xs text-slate-500 mb-1">Ville / Région</label>
              <SearchableSelect
                value={ville}
                onChange={(val) => { setVille(val); setSearchParams(buildParams(1, undefined, { ville: val })); }}
                options={villeOptions}
                placeholder="Ville / Région…"
                searchPlaceholder="Rechercher une ville…"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Quartier</label>
              <SearchableSelect
                value={quartier}
                onChange={(val) => { setQuartier(val); setSearchParams(buildParams(1, undefined, { quartier: val })); }}
                options={quartierOptions}
                placeholder="Quartier…"
                searchPlaceholder="Rechercher un quartier…"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Type de logement</label>
              <SearchableSelect
                value={typeLogement}
                onChange={(val) => { setTypeLogement(val); setSearchParams(buildParams(1, undefined, { typeLogement: val })); }}
                options={typeLogementOptions}
                placeholder="Tous les types"
                searchPlaceholder="Rechercher un type…"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Type de transaction</label>
              <SearchableSelect
                value={typeTransaction}
                onChange={(val) => { setTypeTransaction(val); setSearchParams(buildParams(1, undefined, { typeTransaction: val })); }}
                options={typeTransactionOptions}
                placeholder="Vente & Location"
                searchPlaceholder="Rechercher…"
              />
            </div>

            {!isProximityMode && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Trier par</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => applySort(e.target.value as SortKey)}
                    className="w-full h-9 appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-white text-slate-700">{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {isProximityMode && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Rayon</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[1, 3, 5, 10].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set("radius", String(km));
                        next.set("page", "1");
                        setSearchParams(next);
                      }}
                      className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        proximityRadius === km
                          ? "bg-[#D4A843] border-[#D4A843] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick toggles : À la une + Meublé */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs text-slate-500 mb-2">Options rapides</label>
              <div className="flex flex-col gap-2">
                <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer border transition-all ${misEnAvant ? "bg-[#D4A843]/10 border-[#D4A843]/40" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}>
                  <input type="checkbox" checked={misEnAvant} onChange={e => setMisEnAvant(e.target.checked)} className="sr-only" />
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${misEnAvant ? "bg-[#D4A843] border-[#D4A843]" : "bg-transparent border-slate-300"}`}>
                    {misEnAvant && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <Star className={`w-3.5 h-3.5 flex-shrink-0 ${misEnAvant ? "text-[#D4A843]" : "text-slate-300"}`} />
                  <span className={`text-sm ${misEnAvant ? "text-[#D4A843] font-medium" : "text-slate-500"}`}>À la une</span>
                </label>
                <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer border transition-all ${meuble ? "bg-[#D4A843]/10 border-[#D4A843]/40" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}>
                  <input type="checkbox" checked={meuble} onChange={e => setMeuble(e.target.checked)} className="sr-only" />
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${meuble ? "bg-[#D4A843] border-[#D4A843]" : "bg-transparent border-slate-300"}`}>
                    {meuble && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <Armchair className={`w-3.5 h-3.5 flex-shrink-0 ${meuble ? "text-[#D4A843]" : "text-slate-300"}`} />
                  <span className={`text-sm ${meuble ? "text-[#D4A843] font-medium" : "text-slate-500"}`}>Meublé</span>
                </label>
              </div>
            </div>

            {/* Prix + Surface + Chambres */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-500">Prix max (FCFA)</label>
                  <span className="text-xs font-semibold text-[#D4A843]">
                    {prixMax && Number(prixMax) < 5000000
                      ? Number(prixMax).toLocaleString("fr-FR")
                      : "Illimité"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000000}
                  step={50000}
                  value={prixMax && Number(prixMax) <= 5000000 ? Number(prixMax) : 5000000}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setPrixMax(v >= 5000000 ? "" : String(v));
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#D4A843] bg-slate-200"
                />
                <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                  <span>0</span><span>Illimité</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Chambres min</label>
                  <div className="relative">
                    <select value={chambres} onChange={e => setChambres(e.target.value)} className="w-full h-9 appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 pr-7 focus:outline-none focus:border-slate-400">
                      <option value="" className="bg-white">Toutes</option>
                      {[1,2,3,4,5].map(n => (<option key={n} value={n} className="bg-white">{n}+</option>))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Surface min (m²)</label>
                  <input type="number" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)} placeholder="0" className="w-full h-9 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Surface max (m²)</label>
                  <input type="number" value={surfaceMax} onChange={e => setSurfaceMax(e.target.value)} placeholder="Illimitée" className="w-full h-9 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" />
                </div>
              </div>
            </div>

            {/* Caractéristiques multi-select sidebar */}
            {(() => {
              const BOOL_OPTIONS_SIDEBAR = [
                { key: "parking",   label: "Parking",          Icon: Car,         state: parking,   set: setParking   },
                { key: "ascenseur", label: "Ascenseur",        Icon: ArrowUpDown, state: ascenseur, set: setAscenseur },
                { key: "fumeurs",   label: "Fumeurs acceptés", Icon: Cigarette,   state: fumeurs,   set: setFumeurs   },
                { key: "animaux",   label: "Animaux acceptés", Icon: PawPrint,    state: animaux,   set: setAnimaux   },
              ];
              const nbBoolSelected = BOOL_OPTIONS_SIDEBAR.filter(o => o.state).length;
              const totalSelected  = nbBoolSelected + selectedEquipements.length;
              const btnLabel = totalSelected === 0 ? "Caractéristiques"
                : totalSelected === 1
                  ? (BOOL_OPTIONS_SIDEBAR.find(o => o.state)?.label
                      ?? equipements.find(e => e.id === selectedEquipements[0])?.nom
                      ?? "1 sélectionné")
                : `${totalSelected} sélectionnés`;

              const lowerSearch = caracSearch.toLowerCase();
              const filteredGroups = equipementsGroupes.map(g => ({
                ...g,
                items: g.items.filter(e => e.nom.toLowerCase().includes(lowerSearch)),
              })).filter(g => g.items.length > 0);

              return (
                <div ref={caracRef} className="relative border-t border-slate-100 pt-3">
                  <label className="block text-xs text-slate-500 mb-1">Caractéristiques</label>
                  <button
                    type="button"
                    onClick={() => setCaracOpen(p => !p)}
                    className={`w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg border text-sm transition-colors ${
                      totalSelected > 0
                        ? "bg-[#D4A843]/10 border-[#D4A843]/50 text-[#D4A843]"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <span className="truncate text-left">{btnLabel}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {totalSelected > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#D4A843] text-white text-[10px] flex items-center justify-center font-bold">
                          {totalSelected}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${caracOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {caracOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                          <input type="text" value={caracSearch} onChange={e => setCaracSearch(e.target.value)} placeholder="Filtrer…" className="w-full h-8 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-8 pr-3 focus:outline-none focus:border-slate-400 placeholder:text-slate-300" />
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-60">
                        {BOOL_OPTIONS_SIDEBAR.filter(o => o.label.toLowerCase().includes(lowerSearch)).length > 0 && (
                          <div>
                            <div className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Options</div>
                            {BOOL_OPTIONS_SIDEBAR.filter(o => o.label.toLowerCase().includes(lowerSearch)).map(({ key, label, Icon, state: val, set }) => (
                              <label key={key} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all duration-100 ${val ? "bg-[#D4A843]/8" : "hover:bg-slate-50"}`}>
                                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="sr-only" />
                                <span className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-150 flex-shrink-0 ${val ? "bg-[#D4A843] border-[#D4A843]" : "bg-transparent border-slate-300"}`}>
                                  {val && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                </span>
                                <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${val ? "text-[#D4A843]/80" : "text-slate-300"}`} />
                                <span className={`text-sm transition-colors ${val ? "text-slate-800 font-medium" : "text-slate-500"}`}>{label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {filteredGroups.map(group => (
                          <div key={group.categorie}>
                            <div className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{group.categorie}</div>
                            {group.items.map(eq => {
                              const isChecked = selectedEquipements.includes(eq.id);
                              return (
                                <label key={eq.id} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all duration-100 ${isChecked ? "bg-[#D4A843]/8" : "hover:bg-slate-50"}`}>
                                  <input type="checkbox" checked={isChecked} onChange={e => { setSelectedEquipements(prev => e.target.checked ? [...prev, eq.id] : prev.filter(id => id !== eq.id)); }} className="sr-only" />
                                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-150 flex-shrink-0 ${isChecked ? "bg-[#D4A843] border-[#D4A843]" : "bg-transparent border-slate-300"}`}>
                                    {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                  </span>
                                  <span className={`text-sm transition-colors ${isChecked ? "text-slate-800 font-medium" : "text-slate-500"}`}>{eq.nom}</span>
                                </label>
                              );
                            })}
                          </div>
                        ))}
                        {filteredGroups.length === 0 && BOOL_OPTIONS_SIDEBAR.filter(o => o.label.toLowerCase().includes(lowerSearch)).length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-4">Aucun résultat</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
          )}
        </aside>

        {/* ── Contenu principal ── */}
        <div className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-7">

        {/* En-tête résultats */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1A2942]">
              {isLoading ? (
                <span className="inline-block h-6 w-48 bg-slate-200 rounded animate-pulse" />
              ) : total === 0 ? (
                "Aucun résultat"
              ) : (
                <>
                  <span className="text-[#D4A843]">{total}</span>{" "}
                  {total === 1 ? "annonce" : "annonces"}
                  {isProximityMode && proximityLabel ? (
                    <span className="font-normal text-slate-500"> proches de {proximityLabel.split(",")[0]}</span>
                  ) : sp.get("quartier") ? (
                    <span className="font-normal text-slate-500"> à {sp.get("quartier")}</span>
                  ) : null}
                </>
              )}
            </h1>

            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 bg-[#0C1A35]/8 border border-[#0C1A35]/15 text-[#1A2942] text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 bg-red-50 text-red-400 text-xs px-2.5 py-1 rounded-full font-medium hover:bg-red-100 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Tout effacer
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isFetching && !isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-[#D4A843]" />
            )}
          </div>
        </div>

        {/* ── Résultats ── */}
        {isLoading ? (
          <div className="px-4 sm:px-0">
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarCollapsed ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"}`}>
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-[#1A2942] font-semibold text-lg mb-1">Aucune annonce trouvée</p>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Aucun bien ne correspond à vos critères. Essayez d'élargir votre recherche.
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-slate-200 text-[#1A2942] hover:border-[#0C1A35]"
              >
                <X className="w-4 h-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="px-4 sm:px-0">
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarCollapsed ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"}`}>
              {displayItems.map((bien) => (
                <div key={bien.id} className="relative h-full">
                  {isProximityMode && bien.distance !== undefined && (
                    <div className="absolute top-2 left-2 z-10 bg-[#0C1A35]/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
                      <MapPin className="w-3 h-3 text-[#D4A843]" />
                      {bien.distance < 1
                        ? `${Math.round(bien.distance * 1000)} m`
                        : `${bien.distance.toFixed(1)} km`}
                    </div>
                  )}
                  <PropertyCard property={bien} isApiData />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (() => {
          const cur   = activeParams.page;
          const start = Math.max(1, Math.min(cur - 2, totalPages - 4));
          const end   = Math.min(totalPages, start + 4);
          const pageWindow = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          return (
            <div className="mt-10 flex justify-center">
              <Pagination
                page={cur}
                totalPages={totalPages}
                total={total}
                pageSize={activeParams.limit}
                pageWindow={pageWindow}
                goTo={(p) => applyFilters(p)}
                goNext={() => applyFilters(cur + 1)}
                goPrev={() => applyFilters(cur - 1)}
                reset={() => applyFilters(1)}
              />
            </div>
          );
        })()}
          </div>
        </div>
      </div>
      {!showMobileFilters && <ScrollToTop />}
    </div>
  );
};

export default RecherchePage;
