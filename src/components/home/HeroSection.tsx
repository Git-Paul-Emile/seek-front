import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, Info, Bell, Loader2, CheckCircle, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import NominatimAutocomplete, { type NominatimPoint } from "@/components/ui/NominatimAutocomplete";
import heroBg from "@/assets/hero-bg.jpg";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useStats } from "@/hooks/useStats";
import { useLieux } from "@/hooks/useRecherche";
import { creerAlerte } from "@/api/alerte";

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: typesLogement = [] } = useTypeLogements();
  const { data: statsData }          = useStats();
  const { data: lieux }              = useLieux();

  const [activeTab, setActiveTab] = useState<"recherche" | "alerte">("recherche");

  // Champs de localisation séparés
  const [searchVille,    setSearchVille]    = useState("");
  const [searchQuartier, setSearchQuartier] = useState("");
  const [propertyType,   setPropertyType]   = useState("");
  const [budgetMin,      setBudgetMin]      = useState("");
  const [budgetMax,      setBudgetMax]      = useState("");
  const [advancedOpen,   setAdvancedOpen]   = useState(false);

  // Point de recherche précise (Nominatim)
  const [selectedPoint, setSelectedPoint] = useState<NominatimPoint | null>(null);
  const [radius,        setRadius]        = useState<number>(5); // km

  // Alerte
  const [telephone,    setTelephone]    = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError,   setAlertError]   = useState("");

  const formatBudget = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedPoint) {
      // Recherche par proximité
      params.set("lat",        String(selectedPoint.lat));
      params.set("lng",        String(selectedPoint.lng));
      params.set("pointLabel", selectedPoint.label);
      params.set("radius",     String(radius));
    } else {
      // Quartier prioritaire sur ville (plus précis)
      const lieu = searchQuartier || searchVille;
      if (lieu) params.set("quartier", lieu);
    }

    if (propertyType) params.set("typeLogement", propertyType);

    const mn = parseInt(budgetMin.replace(/\u00a0/g, ""), 10);
    const mx = parseInt(budgetMax.replace(/\u00a0/g, ""), 10);
    if (!isNaN(mn) && mn > 0) params.set("prixMin", String(mn));
    if (!isNaN(mx) && mx > 0) params.set("prixMax", String(mx));

    params.set("page", "1");
    navigate(`/annonces?${params.toString()}`);
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError("");

    if (!telephone || telephone.length < 8) {
      setAlertError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    const prixMinValue = budgetMin ? parseInt(budgetMin.replace(/\u00a0/g, ""), 10) : undefined;
    const prixMaxValue = budgetMax ? parseInt(budgetMax.replace(/\u00a0/g, ""), 10) : undefined;

    setAlertLoading(true);
    try {
      await creerAlerte({
        telephone,
        typeLogement: propertyType || undefined,
        ville:        searchVille || searchQuartier || undefined,
        prixMin:      prixMinValue,
        prixMax:      prixMaxValue,
        canalPrefere: "SMS",
      });
      setAlertSuccess(true);
      setTelephone("");
      setPropertyType("");
      setSearchVille("");
      setSearchQuartier("");
      setBudgetMin("");
      setBudgetMax("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setAlertError(axiosError.response?.data?.message || "Erreur lors de la création de l'alerte");
    } finally {
      setAlertLoading(false);
    }
  };

  const villeOptions        = (lieux?.villes    ?? []).map((v) => ({ value: v, label: v }));
  const quartierOptions     = (lieux?.quartiers ?? []).map((q) => ({ value: q, label: q }));
  const typeLogementOptions = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));

  const inputClasses = "h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all";
  const labelClasses = "text-white/50 text-xs font-medium block mb-1.5 ml-0.5";

  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-16 overflow-hidden">
      <img
        src={heroBg}
        alt="Architecture moderne à Dakar"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/68 to-[#0C1A35]/15" />

      <div className="relative z-10 container mx-auto px-4 pt-24">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.1] max-w-3xl">
          Trouvez votre<br />
          <span className="text-[#D4A843]">propriété idéale</span><br />
          au Sénégal
        </h1>

        <p className="text-white/60 text-xl mb-8 max-w-2xl leading-relaxed">
          Appartements, villas, studios ou espaces commerciaux, explorez des
          milliers d'annonces à Dakar et partout au Sénégal.
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

        {/* Card principale */}
        <div className="max-w-4xl bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">

          {/* Onglets */}
          <div className="flex border-b border-white/10 mb-4">
            {(["recherche", "alerte"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-[#D4A843] text-white"
                    : "border-transparent text-white/50 hover:text-white/75"
                }`}
              >
                {tab === "recherche" ? <Search className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {tab === "recherche" ? "Recherche" : "Alerte"}
              </button>
            ))}
          </div>

          {/* ── Onglet Recherche ── */}
          {activeTab === "recherche" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
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
                  <div className="mt-3 max-w-sm">
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
            </>
          )}

          {/* ── Onglet Alerte ── */}
          {activeTab === "alerte" && (
            <>
              {alertSuccess ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6">
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <p className="font-semibold text-white">Alerte créée avec succès !</p>
                      <p className="text-sm text-white/60">Vous recevrez nos nouvelles annonces par SMS</p>
                    </div>
                  </div>
                  <Button variant="link" onClick={() => setAlertSuccess(false)} className="mt-3 text-white/60 hover:text-white">
                    Créer une autre alerte
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className={labelClasses}>Ville / Région</label>
                      <SearchableSelect
                        value={searchVille}
                        onChange={setSearchVille}
                        options={villeOptions}
                        placeholder="Dakar, Thiès…"
                        searchPlaceholder="Rechercher une ville…"
                        dark
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Type de logement</label>
                      <SearchableSelect
                        value={propertyType}
                        onChange={setPropertyType}
                        options={typeLogementOptions}
                        placeholder="Tous les types"
                        searchPlaceholder="Rechercher un type…"
                        dark
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Budget</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Min"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(formatBudget(e.target.value))}
                          className={inputClasses}
                        />
                        <Input
                          type="text"
                          placeholder="Max"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(formatBudget(e.target.value))}
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <Button
                        type="submit"
                        disabled={alertLoading}
                        className="h-11 w-full bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
                      >
                        {alertLoading
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création...</>
                          : <><Bell className="w-4 h-4 mr-2" />Créer alerte</>
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClasses}>Téléphone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                          <Input
                            type="tel"
                            placeholder="77 xxx xx xx"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {alertError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-3">
                      <AlertCircle className="w-4 h-4" />
                      <span>{alertError}</span>
                    </div>
                  )}

                  <p className="text-xs text-center text-white/35 mt-3">
                    Gratuit. Désinscription possible à tout moment.
                  </p>
                </form>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        {statsData && (
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl">
            <div>
              <div className="text-2xl font-bold text-white">
                {statsData.annoncesActives > 0 ? `${statsData.annoncesActives.toLocaleString("fr-FR")}+` : "—"}
              </div>
              <div className="text-white/40 text-sm mt-0.5">Annonces actives</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {statsData.proprietaires > 0 ? `${statsData.proprietaires.toLocaleString("fr-FR")}+` : "—"}
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
    </section>
  );
};

export default HeroSection;
