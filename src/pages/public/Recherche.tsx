import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, MapPin, X, Loader2, Building2,
  BedDouble, Maximize2, ShowerHead,
  ArrowRight, Car, Armchair, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import PropertyCard from "@/components/PropertyCard";
import Pagination from "@/components/ui/Pagination";
import { useRecherchePublique, useLieux } from "@/hooks/useRecherche";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useTypeTransactions } from "@/hooks/useTypeTransactions";
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
  new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(price);

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
        {bien.typeLogement && (
          <span className="absolute top-2 left-2 bg-[#0C1A35]/80 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
            {bien.typeLogement.nom}
          </span>
        )}
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
            {[bien.quartier, bien.ville].filter(Boolean).join(", ")}
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

  const [quartier,        setQuartier]        = useState(searchParams.get("quartier") ?? "");
  const [typeLogement,    setTypeLogement]    = useState(searchParams.get("typeLogement") ?? "");
  const [typeTransaction, setTypeTransaction] = useState(searchParams.get("typeTransaction") ?? "");
  const [sort,            setSort]            = useState<SortKey>((searchParams.get("sort") as SortKey) ?? "recent");

  const sp = searchParams;
  const sortParams = sortToParams((sp.get("sort") as SortKey) ?? "recent");

  const activeParams = {
    quartier:        sp.get("quartier")        || undefined,
    typeLogement:    sp.get("typeLogement")    || undefined,
    typeTransaction: sp.get("typeTransaction") || undefined,
    sortBy:    sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
    page:  parseInt(sp.get("page") ?? "1"),
    limit: 12,
  };

  const { data, isLoading, isFetching } = useRecherchePublique(activeParams);
  const { data: typesLogement = [] }    = useTypeLogements();
  const { data: typesTransaction = [] } = useTypeTransactions();
  const { data: lieux }                 = useLieux();

  const items      = data?.items      ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    setQuartier(searchParams.get("quartier") ?? "");
    setTypeLogement(searchParams.get("typeLogement") ?? "");
    setTypeTransaction(searchParams.get("typeTransaction") ?? "");
    setSort((searchParams.get("sort") as SortKey) ?? "recent");
  }, [searchParams]);

  const buildParams = (overridePage?: number, overrideSort?: SortKey) => {
    const s = overrideSort ?? sort;
    const next = new URLSearchParams();
    if (quartier)        next.set("quartier",        quartier);
    if (typeLogement)    next.set("typeLogement",    typeLogement);
    if (typeTransaction) next.set("typeTransaction", typeTransaction);
    if (s !== "recent")  next.set("sort",            s);
    next.set("page", String(overridePage ?? 1));
    return next;
  };

  const applyFilters = (overridePage?: number) => setSearchParams(buildParams(overridePage));

  const applySort = (s: SortKey) => {
    setSort(s);
    setSearchParams(buildParams(1, s));
  };

  const clearFilters = () => {
    setQuartier(""); setTypeLogement(""); setTypeTransaction(""); setSort("recent");
    setSearchParams({ page: "1" });
  };

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  // ── Options ──
  const lieuOptions = [
    ...(lieux?.quartiers ?? []).map((q) => ({ value: q, label: q, group: "Quartiers" })),
    ...(lieux?.villes    ?? []).map((v) => ({ value: v, label: v, group: "Villes"   })),
  ];
  const typeLogementOptions    = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));
  const typeTransactionOptions = typesTransaction.map((t) => ({ value: t.slug, label: t.nom }));

  // ── Chips ──
  interface Chip { label: string; onRemove: () => void }
  const chips: Chip[] = [];
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

  const hasFilters = chips.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F5EE]">

      {/* ── Barre de recherche sticky ── */}
      <div className="bg-[#0C1A35] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-wrap gap-2.5 items-center">

            <div className="flex-1 min-w-48">
              <SearchableSelect
                value={quartier}
                onChange={setQuartier}
                options={lieuOptions}
                placeholder="Quartier ou ville…"
                searchPlaceholder="Rechercher un lieu…"
                dark
              />
            </div>

            <div className="w-full sm:w-48">
              <SearchableSelect
                value={typeLogement}
                onChange={setTypeLogement}
                options={typeLogementOptions}
                placeholder="Tous les types"
                searchPlaceholder="Rechercher un type…"
                dark
              />
            </div>

            <div className="w-full sm:w-40">
              <SearchableSelect
                value={typeTransaction}
                onChange={setTypeTransaction}
                options={typeTransactionOptions}
                placeholder="Vente & Location"
                searchPlaceholder="Rechercher…"
                dark
              />
            </div>

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

            <Button
              onClick={() => applyFilters()}
              className="h-11 bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold flex-shrink-0 w-full sm:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
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
                  {sp.get("quartier") && (
                    <span className="font-normal text-slate-500"> à {sp.get("quartier")}</span>
                  )}
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((bien) => (
              <PropertyCard key={bien.id} property={bien} isApiData />
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
