import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import NominatimAutocomplete, { type NominatimPoint } from "@/components/ui/NominatimAutocomplete";
import herosection from "@/assets/herosection.png";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useStats } from "@/hooks/useStats";
import { useLieux } from "@/hooks/useRecherche";

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: typesLogement = [] } = useTypeLogements();
  const { data: statsData }          = useStats();
  const { data: lieux }              = useLieux();

  // Champs de localisation séparés
  const [searchVille,    setSearchVille]    = useState("");
  const [searchQuartier, setSearchQuartier] = useState("");
  const [propertyType,   setPropertyType]   = useState("");
  const [budgetMin,      setBudgetMin]      = useState("");
  const [budgetMax,      setBudgetMax]      = useState("");
  const [advancedOpen,   setAdvancedOpen]   = useState(false);

  // Point de recherche précise (Nominatim)
  const [selectedPoint, setSelectedPoint] = useState<NominatimPoint | null>(null);
  const [radius,        setRadius]        = useState<number>(5);

  const formatBudget = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedPoint) {
      params.set("lat",        String(selectedPoint.lat));
      params.set("lng",        String(selectedPoint.lng));
      params.set("pointLabel", selectedPoint.label);
      params.set("radius",     String(radius));
    } else {
      if (searchVille)    params.set("ville",    searchVille);
      if (searchQuartier) params.set("quartier", searchQuartier);
    }

    if (propertyType) params.set("typeLogement", propertyType);

    const mn = parseInt(budgetMin.replace(/\u00a0/g, ""), 10);
    const mx = parseInt(budgetMax.replace(/\u00a0/g, ""), 10);
    if (!isNaN(mn) && mn > 0) params.set("prixMin", String(mn));
    if (!isNaN(mx) && mx > 0) params.set("prixMax", String(mx));

    params.set("page", "1");
    navigate(`/annonces?${params.toString()}`);
  };

  const villeOptions        = (lieux?.villes    ?? []).map((v) => ({ value: v, label: v }));
  const quartierOptions     = (lieux?.quartiers ?? []).map((q) => ({ value: q, label: q }));
  const typeLogementOptions = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));

  const inputClasses = "h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all";
  const labelClasses = "text-white/50 text-xs font-medium block mb-1.5 ml-0.5";

  return (
    <section className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center">
      <img
        src={herosection}
        alt="Architecture moderne à Dakar"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/68 to-[#0C1A35]/15" />

      <div className="relative z-10 container mx-auto px-5 md:px-8 pt-24 pb-10 lg:pt-20 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Colonne gauche : textes + stats ── */}
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1]">
              Trouvez votre<br />
              <span className="text-[#D4A843]">propriété idéale</span><br />
              au Sénégal
            </h1>

            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Explorez des milliers d'annonces à Dakar et partout au Sénégal.
            </p>

            {/* Arguments de confiance */}
            <div className="flex flex-wrap gap-4 mb-10">
              {["Annonces vérifiées", "Propriétaires certifiés", "Paiement sécurisé", "Contrats digitaux"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
                  <span className="text-sm font-medium">{t}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            {statsData && (
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {statsData.annoncesActives > 0 ? `${statsData.annoncesActives.toLocaleString("fr-FR")}+` : ""}
                  </div>
                  <div className="text-white/40 text-sm mt-0.5">Annonces actives</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {statsData.proprietaires > 0 ? `${statsData.proprietaires.toLocaleString("fr-FR")}+` : ""}
                  </div>
                  <div className="text-white/40 text-sm mt-0.5">Propriétaires</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {statsData.villesCouvertes.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-white/40 text-sm mt-0.5">Villes couvertes</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Colonne droite : formulaire de recherche ── */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ville / Région */}
              <div>
                <label className={labelClasses}>Ville / Région</label>
                <SearchableSelect
                  value={searchVille}
                  onChange={setSearchVille}
                  options={villeOptions}
                  placeholder="Dakar"
                  searchPlaceholder="Rechercher une ville…"
                  dark
                />
              </div>

              {/* Quartier */}
              <div>
                <label className={labelClasses}>Quartier</label>
                <SearchableSelect
                  value={searchQuartier}
                  onChange={setSearchQuartier}
                  options={quartierOptions}
                  placeholder="Almadies"
                  searchPlaceholder="Rechercher un quartier…"
                  dark
                />
              </div>

              {/* Type de logement */}
              <div>
                <label className={labelClasses}>Type de logement</label>
                <SearchableSelect
                  value={propertyType}
                  onChange={setPropertyType}
                  options={typeLogementOptions}
                  searchPlaceholder="Rechercher un type…"
                  dark
                />
              </div>

              {/* Budget min */}
              <div>
                <label className={labelClasses}>Budget min (FCFA)</label>
                <Input
                  type="text"
                  placeholder="Min"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(formatBudget(e.target.value))}
                  className={inputClasses}
                />
              </div>

              {/* Budget max */}
              <div>
                <label className={labelClasses}>Budget max (FCFA)</label>
                <Input
                  type="text"
                  placeholder="Max"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(formatBudget(e.target.value))}
                  className={inputClasses}
                />
              </div>

              {/* Bouton Rechercher */}
              <div className="flex flex-col justify-end">
                <Button
                  type="button"
                  onClick={handleSearch}
                  className="h-11 w-full bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Recherche par point précis */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-1.5 text-white/45 hover:text-white/75 text-xs transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Recherche par point précis
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`} />
              </button>

              {advancedOpen && (
                <div className="mt-3">
                  <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5 ml-0.5">
                    Lieu précis
                    <div className="relative group/info">
                      <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-default transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-[#0C1A35] border border-white/10 text-white/80 text-xs px-3 py-2 rounded-xl leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-30">
                        Saisissez un lieu précis et sélectionnez une suggestion. Le système trouvera les biens les plus proches, triés par distance.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1A35]" />
                      </div>
                    </div>
                  </label>
                  <NominatimAutocomplete
                    onSelect={(point) => {
                      setSelectedPoint(point);
                      if (point) { setSearchVille(""); setSearchQuartier(""); }
                    }}
                    placeholder="Université Cheikh Anta Diop"
                    dark
                  />

                  {/* Sélecteur de rayon */}
                  <div className="mt-3">
                    <label className="text-white/50 text-xs font-medium block mb-1.5 ml-0.5">
                      Rayon de recherche
                    </label>
                    <div className="flex gap-2">
                      {[1, 3, 5, 10].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setRadius(km)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            radius === km
                              ? "bg-[#D4A843] border-[#D4A843] text-white"
                              : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {km} km
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
