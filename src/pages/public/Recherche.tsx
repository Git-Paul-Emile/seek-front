import { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, MapPin, X, Loader2, Building2,
  BedDouble, Maximize2, ShowerHead,
  ArrowRight, Car, Armchair, ChevronDown, SlidersHorizontal,
  LayoutGrid, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import PropertyCard from "@/components/PropertyCard";
import Pagination from "@/components/ui/Pagination";
import { useRecherchePublique, useLieux } from "@/hooks/useRecherche";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useTypeTransactions } from "@/hooks/useTypeTransactions";
import type { Bien } from "@/api/bien";

const CarteAnnonces = lazy(() => import("@/components/carte/CarteAnnonces"));

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
            {bien.surface && (
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
            {bien.parking && (
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />Parking
              </span>
            )}
            {bien.meuble && (
              <span className="flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5" />Meublé
              </span>
            )}
          </div>
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
  const [showAvanced,  setShowAdvanced] = useState(false);
  const [prixMin,      setPrixMin]      = useState(searchParams.get("prixMin") ?? "");
  const [prixMax,      setPrixMax]      = useState(searchParams.get("prixMax") ?? "");
  const [chambres,     setChambres]     = useState(searchParams.get("chambres") ?? "");
  const [surfaceMin,   setSurfaceMin]   = useState(searchParams.get("surfaceMin") ?? "");
  const [surfaceMax,   setSurfaceMax]   = useState(searchParams.get("surfaceMax") ?? "");
  const [meuble,       setMeuble]       = useState(searchParams.get("meuble") === "1");
  const [parking,      setParking]      = useState(searchParams.get("parking") === "1");

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
    meuble:     sp.get("meuble")  === "1" ? "1" as const : undefined,
    parking:    sp.get("parking") === "1" ? "1" as const : undefined,
    sortBy:    isProximityMode ? undefined : sortParams.sortBy,
    sortOrder: isProximityMode ? undefined : sortParams.sortOrder,
    page:  parseInt(sp.get("page") ?? "1"),
    limit: 12,
    lat:    proximityLat,
    lng:    proximityLng,
    radius: isProximityMode ? proximityRadius : undefined,
  };

  const { data, isLoading, isFetching } = useRecherchePublique(activeParams);
  const { data: typesLogement = [] }    = useTypeLogements();
  const { data: typesTransaction = [] } = useTypeTransactions();
  const { data: lieux }                 = useLieux();

  const items      = data?.items      ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

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
    setMeuble(searchParams.get("meuble") === "1");
    setParking(searchParams.get("parking") === "1");
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
    if (meuble)         next.set("meuble",          "1");
    if (parking)        next.set("parking",         "1");
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
    setMeuble(false); setParking(false);
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
  if (sp.get("meuble") === "1")
    chips.push({ label: "Meublé", onRemove: () => removeFilter("meuble") });
  if (sp.get("parking") === "1")
    chips.push({ label: "Parking", onRemove: () => removeFilter("parking") });

  const nbAdvancedActive = [sp.get("prixMin"), sp.get("prixMax"), sp.get("chambres"),
    sp.get("surfaceMin"), sp.get("surfaceMax"),
    sp.get("meuble"), sp.get("parking")].filter(Boolean).length;

  const hasFilters = chips.length > 0;

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  return (
    <div className="min-h-screen bg-[#F8F5EE]">

      {/* ── Barre de recherche sticky ── */}
      <div className="bg-[#0C1A35] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-wrap gap-2.5 items-center">

            <div className="flex-1 min-w-36">
              <SearchableSelect
                value={ville}
                onChange={(val) => {
                  setVille(val);
                  setSearchParams(buildParams(1, undefined, { ville: val }));
                }}
                options={villeOptions}
                placeholder="Ville / Région…"
                searchPlaceholder="Rechercher une ville…"
                dark
              />
            </div>

            <div className="flex-1 min-w-36">
              <SearchableSelect
                value={quartier}
                onChange={(val) => {
                  setQuartier(val);
                  setSearchParams(buildParams(1, undefined, { quartier: val }));
                }}
                options={quartierOptions}
                placeholder="Quartier…"
                searchPlaceholder="Rechercher un quartier…"
                dark
              />
            </div>

            <div className="w-full sm:w-48">
              <SearchableSelect
                value={typeLogement}
                onChange={(val) => {
                  setTypeLogement(val);
                  setSearchParams(buildParams(1, undefined, { typeLogement: val }));
                }}
                options={typeLogementOptions}
                placeholder="Tous les types"
                searchPlaceholder="Rechercher un type…"
                dark
              />
            </div>

            <div className="w-full sm:w-40">
              <SearchableSelect
                value={typeTransaction}
                onChange={(val) => {
                  setTypeTransaction(val);
                  setSearchParams(buildParams(1, undefined, { typeTransaction: val }));
                }}
                options={typeTransactionOptions}
                placeholder="Vente & Location"
                searchPlaceholder="Rechercher…"
                dark
              />
            </div>

            {!isProximityMode && (
              <div className="relative w-full sm:w-44">
                <select
                  value={sort}
                  onChange={(e) => applySort(e.target.value as SortKey)}
                  className="w-full h-11 appearance-none bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 pr-8 focus:outline-none focus:border-white/40 cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0C1A35] text-white">
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              </div>
            )}
            {isProximityMode && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-white/50 hidden sm:block">Rayon :</span>
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
                    className={`h-9 px-2.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 ${
                      proximityRadius === km
                        ? "bg-[#D4A843] border-[#D4A843] text-white"
                        : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAdvanced(prev => !prev)}
              className={`h-11 flex items-center gap-2 px-4 rounded-lg border text-sm font-medium transition-colors flex-shrink-0 w-full sm:w-auto justify-center ${
                showAvanced || nbAdvancedActive > 0
                  ? "border-[#D4A843] bg-[#D4A843]/20 text-[#D4A843]"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {nbAdvancedActive > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#D4A843] text-white text-xs flex items-center justify-center font-bold">
                  {nbAdvancedActive}
                </span>
              )}
            </button>

            <Button
              onClick={() => applyFilters()}
              className="h-11 bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold flex-shrink-0 w-full sm:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Panneau filtres avancés */}
          {showAvanced && (
            <div className="border-t border-white/10 pt-4 mt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Prix min */}
              <div>
                <label className="block text-xs text-white/60 mb-1">Prix min (FCFA)</label>
                <input
                  type="number"
                  min={0}
                  value={prixMin}
                  onChange={e => setPrixMin(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30"
                />
              </div>
              {/* Prix max */}
              <div>
                <label className="block text-xs text-white/60 mb-1">Prix max (FCFA)</label>
                <input
                  type="number"
                  min={0}
                  value={prixMax}
                  onChange={e => setPrixMax(e.target.value)}
                  placeholder="Illimité"
                  className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30"
                />
              </div>
              {/* Chambres */}
              <div>
                <label className="block text-xs text-white/60 mb-1">Chambres min</label>
                <div className="relative">
                  <select
                    value={chambres}
                    onChange={e => setChambres(e.target.value)}
                    className="w-full h-9 appearance-none bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 pr-7 focus:outline-none focus:border-white/40"
                  >
                    <option value="" className="bg-[#0C1A35]">Toutes</option>
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n} className="bg-[#0C1A35]">{n}+</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                </div>
              </div>
              {/* Surface min */}
              <div>
                <label className="block text-xs text-white/60 mb-1">Surface min (m²)</label>
                <input
                  type="number"
                  min={0}
                  value={surfaceMin}
                  onChange={e => setSurfaceMin(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30"
                />
              </div>
              {/* Surface max */}
              <div>
                <label className="block text-xs text-white/60 mb-1">Surface max (m²)</label>
                <input
                  type="number"
                  min={0}
                  value={surfaceMax}
                  onChange={e => setSurfaceMax(e.target.value)}
                  placeholder="Illimitée"
                  className="w-full h-9 bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-white/40 placeholder:text-white/30"
                />
              </div>
              {/* Options */}
              <div className="flex flex-col gap-2 justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meuble}
                    onChange={e => setMeuble(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 text-[#D4A843] focus:ring-[#D4A843]"
                  />
                  <span className="text-sm text-white/80 flex items-center gap-1">
                    <Armchair className="w-3.5 h-3.5" /> Meublé
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parking}
                    onChange={e => setParking(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 text-[#D4A843] focus:ring-[#D4A843]"
                  />
                  <span className="text-sm text-white/80 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" /> Parking
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="container mx-auto px-4 py-7">

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
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-8 w-8 flex items-center justify-center transition-colors ${
                  viewMode === "grid" ? "bg-[#0C1A35] text-white" : "bg-white text-slate-400 hover:text-slate-600"
                }`}
                title="Vue grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`h-8 w-8 flex items-center justify-center transition-colors border-l border-slate-200 ${
                  viewMode === "map" ? "bg-[#0C1A35] text-white" : "bg-white text-slate-400 hover:text-slate-600"
                }`}
                title="Vue carte"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Résultats ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
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
        ) : viewMode === "map" ? (
          <Suspense fallback={<div className="h-[520px] bg-slate-100 rounded-2xl animate-pulse" />}>
            <CarteAnnonces items={items} />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((bien) => (
              <div key={bien.id} className="relative">
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
  );
};

export default RecherchePage;
