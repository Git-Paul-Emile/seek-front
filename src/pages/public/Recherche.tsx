import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import PropertyCard from "@/components/PropertyCard";
import Pagination from "@/components/ui/Pagination";
import { useRecherchePublique, useLieux } from "@/hooks/useRecherche";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useTypeTransactions } from "@/hooks/useTypeTransactions";

const parseBudget = (v: string) => parseInt(v.replace(/\u00a0|\s/g, ""), 10) || undefined;
const formatBudget = (v: string) => {
  const num = v.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
};

const RecherchePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [quartier, setQuartier]              = useState(searchParams.get("quartier") ?? "");
  const [typeLogement, setTypeLogement]      = useState(searchParams.get("typeLogement") ?? "");
  const [typeTransaction, setTypeTransaction] = useState(searchParams.get("typeTransaction") ?? "");
  const [budgetMin, setBudgetMin]            = useState(searchParams.get("prixMin") ?? "");
  const [budgetMax, setBudgetMax]            = useState(searchParams.get("prixMax") ?? "");
  const [filtersOpen, setFiltersOpen]        = useState(false);

  const activeParams = {
    quartier:        searchParams.get("quartier")        || undefined,
    typeLogement:    searchParams.get("typeLogement")    || undefined,
    typeTransaction: searchParams.get("typeTransaction") || undefined,
    prixMin:  searchParams.get("prixMin")  ? parseInt(searchParams.get("prixMin")!)  : undefined,
    prixMax:  searchParams.get("prixMax")  ? parseInt(searchParams.get("prixMax")!)  : undefined,
    page:     parseInt(searchParams.get("page") ?? "1"),
    limit:    12,
  };

  const { data, isLoading, isFetching }  = useRecherchePublique(activeParams);
  const { data: typesLogement = [] }     = useTypeLogements();
  const { data: typesTransaction = [] }  = useTypeTransactions();
  const { data: lieux }                  = useLieux();

  // Sync formulaire si URL change (retour arrière)
  useEffect(() => {
    setQuartier(searchParams.get("quartier") ?? "");
    setTypeLogement(searchParams.get("typeLogement") ?? "");
    setTypeTransaction(searchParams.get("typeTransaction") ?? "");
    setBudgetMin(searchParams.get("prixMin") ?? "");
    setBudgetMax(searchParams.get("prixMax") ?? "");
  }, [searchParams]);

  const applyFilters = (overridePage?: number) => {
    const next = new URLSearchParams();
    if (quartier)         next.set("quartier",        quartier);
    if (typeLogement)     next.set("typeLogement",    typeLogement);
    if (typeTransaction)  next.set("typeTransaction", typeTransaction);
    const mn = parseBudget(budgetMin);
    const mx = parseBudget(budgetMax);
    if (mn) next.set("prixMin", String(mn));
    if (mx) next.set("prixMax", String(mx));
    next.set("page", String(overridePage ?? 1));
    setSearchParams(next);
  };

  const clearFilters = () => {
    setQuartier("");
    setTypeLogement("");
    setTypeTransaction("");
    setBudgetMin("");
    setBudgetMax("");
    setSearchParams({ page: "1" });
  };

  const goTo = (p: number) => applyFilters(p);

  const hasFilters = !!(
    searchParams.get("quartier") ||
    searchParams.get("typeLogement") ||
    searchParams.get("typeTransaction") ||
    searchParams.get("prixMin") ||
    searchParams.get("prixMax")
  );

  const items       = data?.items      ?? [];
  const total       = data?.total      ?? 0;
  const totalPages  = data?.totalPages ?? 1;
  const currentPage = activeParams.page;

  // Options pour les selects
  const lieuOptions = [
    ...(lieux?.quartiers ?? []).map((q) => ({ value: q, label: q, group: "Quartiers" })),
    ...(lieux?.villes    ?? []).map((v) => ({ value: v, label: v, group: "Villes"    })),
  ];
  const typeLogementOptions    = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));
  const typeTransactionOptions = typesTransaction.map((t) => ({ value: t.slug, label: t.nom }));

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      {/* ── Barre de recherche ── */}
      <div className="bg-[#0C1A35] py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Quartier / ville */}
            <div className="flex-1">
              <SearchableSelect
                value={quartier}
                onChange={setQuartier}
                options={lieuOptions}
                placeholder="Quartier ou ville…"
                searchPlaceholder="Rechercher un lieu…"
                dark
              />
            </div>

            {/* Type de logement */}
            <div className="w-full md:w-52">
              <SearchableSelect
                value={typeLogement}
                onChange={setTypeLogement}
                options={typeLogementOptions}
                placeholder="Tous les types"
                searchPlaceholder="Rechercher un type…"
                dark
              />
            </div>

            {/* Type de transaction */}
            <div className="w-full md:w-44">
              <SearchableSelect
                value={typeTransaction}
                onChange={setTypeTransaction}
                options={typeTransactionOptions}
                placeholder="Vente & Location"
                searchPlaceholder="Rechercher…"
                dark
              />
            </div>

            {/* Bouton budget */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="h-11 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Budget
            </Button>

            {/* Rechercher */}
            <Button
              onClick={() => applyFilters()}
              className="h-11 bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold flex-shrink-0"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Budget (panneau dépliable) */}
          {filtersOpen && (
            <div className="mt-3 flex flex-wrap gap-3 items-end pt-3 border-t border-white/10">
              <div>
                <label className="text-white/50 text-xs block mb-1">Budget min (FCFA)</label>
                <Input
                  placeholder="Min"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(formatBudget(e.target.value))}
                  className="h-10 w-40 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">Budget max (FCFA)</label>
                <Input
                  placeholder="Max"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(formatBudget(e.target.value))}
                  className="h-10 w-40 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Résultats ── */}
      <div className="container mx-auto px-4 py-8">
        {/* Entête résultats */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1A2942]">
              {isLoading ? (
                "Recherche en cours…"
              ) : total === 0 ? (
                "Aucun résultat"
              ) : (
                <>
                  <span className="text-[#D4A843]">{total}</span>{" "}
                  {total === 1 ? "annonce trouvée" : "annonces trouvées"}
                </>
              )}
            </h1>

            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-2">
                {searchParams.get("quartier") && (
                  <span className="inline-flex items-center gap-1 bg-[#0C1A35]/10 text-[#0C1A35] text-xs px-2.5 py-1 rounded-full font-medium">
                    <MapPin className="w-3 h-3" />
                    {searchParams.get("quartier")}
                  </span>
                )}
                {searchParams.get("typeLogement") && (
                  <span className="inline-flex items-center gap-1 bg-[#0C1A35]/10 text-[#0C1A35] text-xs px-2.5 py-1 rounded-full font-medium">
                    {typeLogementOptions.find((t) => t.value === searchParams.get("typeLogement"))?.label ?? searchParams.get("typeLogement")}
                  </span>
                )}
                {searchParams.get("typeTransaction") && (
                  <span className="inline-flex items-center gap-1 bg-[#0C1A35]/10 text-[#0C1A35] text-xs px-2.5 py-1 rounded-full font-medium">
                    {typeTransactionOptions.find((t) => t.value === searchParams.get("typeTransaction"))?.label ?? searchParams.get("typeTransaction")}
                  </span>
                )}
                {(searchParams.get("prixMin") || searchParams.get("prixMax")) && (
                  <span className="inline-flex items-center gap-1 bg-[#0C1A35]/10 text-[#0C1A35] text-xs px-2.5 py-1 rounded-full font-medium">
                    {searchParams.get("prixMin") && `Min\u00a0: ${parseInt(searchParams.get("prixMin")!).toLocaleString("fr-FR")}\u00a0FCFA`}
                    {searchParams.get("prixMin") && searchParams.get("prixMax") && " — "}
                    {searchParams.get("prixMax") && `Max\u00a0: ${parseInt(searchParams.get("prixMax")!).toLocaleString("fr-FR")}\u00a0FCFA`}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 bg-red-50 text-red-500 text-xs px-2.5 py-1 rounded-full font-medium hover:bg-red-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>

          {isFetching && !isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-[#D4A843]" />
          )}
        </div>

        {/* Grille */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-[#D4A843]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Building2 className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-slate-400 text-lg font-medium mb-1">Aucune annonce ne correspond à votre recherche</p>
            <p className="text-slate-300 text-sm">Essayez d'élargir vos critères de recherche</p>
            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4 border-slate-200 text-[#1A2942] hover:border-[#0C1A35]"
              >
                <X className="w-4 h-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((bien) => (
                <PropertyCard key={bien.id} property={bien} isApiData />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  total={total}
                  pageSize={activeParams.limit}
                  goTo={goTo}
                  goNext={() => goTo(currentPage + 1)}
                  goPrev={() => goTo(currentPage - 1)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecherchePage;
