import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, Info, Bell, Loader2, CheckCircle, AlertCircle, Phone, X } from "lucide-react";
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

  // Panneau alerte flottant
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [alertClosing,   setAlertClosing]   = useState(false);

  // Alerte form state
  const [telephone,    setTelephone]    = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError,   setAlertError]   = useState("");
  // Alerte specific fields
  const [alertVille,       setAlertVille]       = useState("");
  const [alertType,        setAlertType]        = useState("");
  const [alertBudgetMin,   setAlertBudgetMin]   = useState("");
  const [alertBudgetMax,   setAlertBudgetMax]   = useState("");

  const openAlertPanel = () => {
    setAlertClosing(false);
    setShowAlertPanel(true);
  };
  const closeAlertPanel = () => {
    setAlertClosing(true);
    setTimeout(() => {
      setShowAlertPanel(false);
      setAlertClosing(false);
    }, 350);
  };

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

    const prixMinValue = alertBudgetMin ? parseInt(alertBudgetMin.replace(/\u00a0/g, ""), 10) : undefined;
    const prixMaxValue = alertBudgetMax ? parseInt(alertBudgetMax.replace(/\u00a0/g, ""), 10) : undefined;

    setAlertLoading(true);
    try {
      await creerAlerte({
        telephone,
        typeLogement: alertType || undefined,
        ville:        alertVille || undefined,
        prixMin:      prixMinValue,
        prixMax:      prixMaxValue,
        canalPrefere: "SMS",
      });
      setAlertSuccess(true);
      setTelephone("");
      setAlertType("");
      setAlertVille("");
      setAlertBudgetMin("");
      setAlertBudgetMax("");
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

        {/* Card recherche */}
        <div className="max-w-4xl bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
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

      {/* ── Bouton flottant Alerte (Lampe du génie) ────────────────────────── */}
      <style>{`
        @keyframes genieAlertOut {
          0%   { transform: scale(0.05) translate(40px, 40px); opacity: 0; }
          45%  { transform: scale(1.05) translate(-4px, -4px); opacity: 1; }
          65%  { transform: scale(0.97) translate(2px, 2px); }
          80%  { transform: scale(1.02) translate(-1px, -1px); }
          100% { transform: scale(1) translate(0, 0); opacity: 1; }
        }
        @keyframes genieAlertIn {
          0%   { transform: scale(1) translate(0, 0); opacity: 1; }
          100% { transform: scale(0.05) translate(40px, 40px); opacity: 0; }
        }
        @keyframes lampGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0.55), 0 8px 32px rgba(0,0,0,0.35); }
          50%       { box-shadow: 0 0 0 14px rgba(212,168,67,0), 0 8px 32px rgba(0,0,0,0.35); }
        }
        .genie-alert-open  { animation: genieAlertOut 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) forwards; transform-origin: bottom right; }
        .genie-alert-close { animation: genieAlertIn  0.32s cubic-bezier(0.36, 0, 0.66, 0) forwards; transform-origin: bottom right; }
        .lamp-glow-btn { animation: lampGlow 2.6s ease-in-out infinite; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {/* Panneau génie */}
        {showAlertPanel && (
          <div className={`w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ${alertClosing ? "genie-alert-close" : "genie-alert-open"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0C1A35] to-[#1A2942]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4A843]" />
                <span className="text-sm font-bold text-white">Créer une alerte</span>
              </div>
              <button
                onClick={closeAlertPanel}
                className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {alertSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0C1A35] text-sm">Alerte créée !</p>
                    <p className="text-xs text-slate-500 mt-0.5">Vous recevrez nos nouvelles annonces par SMS</p>
                  </div>
                  <button
                    onClick={() => setAlertSuccess(false)}
                    className="text-xs text-[#D4A843] hover:underline"
                  >
                    Créer une autre alerte
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit} className="space-y-3">
                  {/* Ville */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Ville / Région</label>
                    <SearchableSelect
                      value={alertVille}
                      onChange={setAlertVille}
                      options={villeOptions}
                      placeholder="Dakar, Thiès…"
                      searchPlaceholder="Rechercher une ville…"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Type de logement</label>
                    <SearchableSelect
                      value={alertType}
                      onChange={setAlertType}
                      options={typeLogementOptions}
                      placeholder="Tous les types"
                      searchPlaceholder="Rechercher un type…"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Budget (FCFA)</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Min"
                        value={alertBudgetMin}
                        onChange={(e) => setAlertBudgetMin(formatBudget(e.target.value))}
                        className="h-9 text-xs"
                      />
                      <Input
                        type="text"
                        placeholder="Max"
                        value={alertBudgetMax}
                        onChange={(e) => setAlertBudgetMax(formatBudget(e.target.value))}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        type="tel"
                        placeholder="77 xxx xx xx"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="pl-9 h-9 text-xs"
                        required
                      />
                    </div>
                  </div>

                  {alertError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{alertError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={alertLoading}
                    className="w-full h-9 bg-[#D4A843] hover:bg-[#C09535] text-white text-xs font-semibold"
                  >
                    {alertLoading
                      ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Création...</>
                      : <><Bell className="w-3.5 h-3.5 mr-1.5" />Créer mon alerte</>
                    }
                  </Button>

                  <p className="text-[10px] text-center text-slate-400">
                    Gratuit · Désinscription possible à tout moment
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bouton lampe */}
        <button
          onClick={showAlertPanel ? closeAlertPanel : openAlertPanel}
          title="Créer une alerte SMS"
          className={`lamp-glow-btn w-14 h-14 rounded-full bg-[#0C1A35] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150 ${showAlertPanel ? "rotate-12" : ""}`}
        >
          <Bell className={`w-6 h-6 transition-colors duration-200 ${showAlertPanel ? "text-white/60" : "text-[#D4A843]"}`} />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
