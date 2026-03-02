import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, Navigation, Info, Bell, Loader2, CheckCircle, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import heroBg from "@/assets/hero-bg.jpg";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useStats } from "@/hooks/useStats";
import { useLieux } from "@/hooks/useRecherche";
import { creerAlerte } from "@/api/alerte";

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: typesLogement = [] }    = useTypeLogements();
  const { data: statsData }             = useStats();
  const { data: lieux }                 = useLieux();

  // État pour les onglets
  const [activeTab, setActiveTab] = useState<"recherche" | "alerte">("recherche");

  // État commun pour les champs
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType]     = useState("");
  const [budgetMin, setBudgetMin]           = useState("");
  const [budgetMax, setBudgetMax]           = useState("");
  const [advancedOpen, setAdvancedOpen]     = useState(false);
  const [preciseAddress, setPreciseAddress] = useState("");

  // État spécifique à l'alerte
  const [telephone, setTelephone] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState("");

  const formatBudget = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set("quartier", searchLocation);
    if (propertyType)   params.set("typeLogement", propertyType);
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
        ville: searchLocation || undefined,
        prixMin: prixMinValue,
        prixMax: prixMaxValue,
        canalPrefere: "SMS",
      });
      setAlertSuccess(true);
      setTelephone("");
      setPropertyType("");
      setSearchLocation("");
      setBudgetMin("");
      setBudgetMax("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setAlertError(axiosError.response?.data?.message || "Erreur lors de la création de l'alerte");
    } finally {
      setAlertLoading(false);
    }
  };

  // Options lieu : quartiers groupés sous "Quartiers", villes sous "Villes"
  const lieuOptions = [
    ...(lieux?.quartiers ?? []).map((q) => ({ value: q, label: q, group: "Quartiers" })),
    ...(lieux?.villes    ?? []).map((v) => ({ value: v, label: v, group: "Villes"    })),
  ];

  // Options pour les villes seulement (pour l'alerte)
  const villeOptions = [
    ...(lieux?.villes ?? []).map((v) => ({ value: v, label: v })),
  ];

  const typeLogementOptions = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));

  // Styles communs pour les champs
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
          <div className="flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]"></span>
            <span className="text-sm font-medium">Annonces vérifiées</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]"></span>
            <span className="text-sm font-medium">Propriétaires certifiés</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]"></span>
            <span className="text-sm font-medium">Paiement sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]"></span>
            <span className="text-sm font-medium">Contrats digitaux</span>
          </div>
        </div>

        {/* Onglets Recherche et Alerte */}
        <div className="max-w-3xl bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
          {/* Navigation des onglets */}
          <div className="flex border-b border-white/10 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("recherche")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === "recherche"
                  ? "border-[#D4A843] text-white"
                  : "border-transparent text-white/50 hover:text-white/75"
              }`}
            >
              <Search className="w-4 h-4" />
              Recherche
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("alerte")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === "alerte"
                  ? "border-[#D4A843] text-white"
                  : "border-transparent text-white/50 hover:text-white/75"
              }`}
            >
              <Bell className="w-4 h-4" />
              Alerte
            </button>
          </div>

          {/* Contenu de l'onglet Recherche */}
          {activeTab === "recherche" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className={labelClasses}>Quartier / Ville</label>
                  <SearchableSelect
                    value={searchLocation}
                    onChange={setSearchLocation}
                    options={lieuOptions}
                    placeholder="Almadies, Dakar…"
                    searchPlaceholder="Rechercher un lieu…"
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
                    type="button"
                    onClick={handleSearch}
                    className="h-11 w-full bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>

              {/* Recherche par point précis - uniquement dans l'onglet Recherche */}
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
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5 ml-0.5">
                        Lieu précis
                        <div className="relative group/info">
                          <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-default transition-colors" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0C1A35] border border-white/10 text-white/80 text-xs px-3 py-2 rounded-xl leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-30">
                            La recherche à partir d'un point permet de trouver des biens immobiliers situés à proximité d'un lieu précis, plutôt que simplement dans un quartier.
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1A35]" />
                          </div>
                        </div>
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Ex : Avenue Bourguiba, Dakar"
                          value={preciseAddress}
                          onChange={(e) => setPreciseAddress(e.target.value)}
                          className="pl-9 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Contenu de l'onglet Alerte */}
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
                  <Button
                    variant="link"
                    onClick={() => setAlertSuccess(false)}
                    className="mt-3 text-white/60 hover:text-white"
                  >
                    Créer une autre alerte
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className={labelClasses}>Quartier / Ville</label>
                      <SearchableSelect
                        value={searchLocation}
                        onChange={setSearchLocation}
                        options={lieuOptions}
                        placeholder="Almadies, Dakar…"
                        searchPlaceholder="Rechercher un lieu…"
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
                        {alertLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Créer alerte
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Champ téléphone pour l'alerte */}
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
