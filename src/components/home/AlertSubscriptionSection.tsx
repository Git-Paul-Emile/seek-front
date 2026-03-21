import { useState } from "react";
import { Bell, Loader2, CheckCircle, AlertCircle, Phone, MapPin, Home, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { creerAlerte } from "@/api/alerte";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useLieux } from "@/hooks/useRecherche";

interface AlertSubscriptionSectionProps {
  variant?: "hero" | "standalone";
}

const AlertSubscriptionSection = ({ variant = "hero" }: AlertSubscriptionSectionProps) => {
  const { data: typesLogement = [] } = useTypeLogements();
  const { data: lieux } = useLieux();

  const [telephone, setTelephone] = useState("");
  const [typeLogement, setTypeLogement] = useState("");
  const [ville, setVille] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Options pour les selects
  const typeLogementOptions = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));
  
  const lieuOptions = [
    ...(lieux?.villes ?? []).map((v) => ({ value: v, label: v })),
  ];

  const formatBudget = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!telephone || telephone.length < 8) {
      setError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    const prixMaxValue = prixMax ? parseInt(prixMax.replace(/\u00a0/g, ""), 10) : undefined;

    setLoading(true);
    try {
      await creerAlerte({
        telephone,
        typeLogement: typeLogement || undefined,
        ville: ville || undefined,
        prixMax: prixMaxValue,
        canalPrefere: "SMS",
      });
      setSuccess(true);
      setTelephone("");
      setTypeLogement("");
      setVille("");
      setPrixMax("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Erreur lors de la création de l'alerte");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={variant === "hero" ? "bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6" : "bg-white rounded-2xl p-6 shadow-lg border border-gray-100"}>
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold text-white">Alerte créée avec succès !</p>
            <p className="text-sm text-white/60">Vous recevrez nos nouvelles annonces par SMS</p>
          </div>
        </div>
        <Button
          variant="link"
          onClick={() => setSuccess(false)}
          className="mt-3 text-white/60 hover:text-white"
        >
          Créer une autre alerte
        </Button>
      </div>
    );
  }

  const containerClasses = variant === "hero"
    ? "bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6"
    : "bg-white rounded-2xl p-6 shadow-lg border border-gray-100";

  const titleClasses = variant === "hero"
    ? "text-white font-display text-xl font-bold mb-2"
    : "text-gray-900 font-display text-xl font-bold mb-2";

  const textClasses = variant === "hero"
    ? "text-white/60 text-sm mb-4"
    : "text-gray-600 text-sm mb-4";

  const inputClasses = variant === "hero"
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#D4A843]";

  const labelClasses = variant === "hero"
    ? "text-white/50 text-xs font-medium block mb-1.5 ml-0.5"
    : "text-gray-500 text-xs font-medium block mb-1.5 ml-0.5";

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-[#D4A843]" />
        <h3 className={titleClasses}>
          Recevez les nouvelles annonces
        </h3>
      </div>
      
      <p className={textClasses}>
        Créez une alerte pour être notifié des nouvelles annonces correspondant à vos critères.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {/* Téléphone */}
        <div>
          <label className={labelClasses}>Téléphone *</label>
          <div className="relative">
            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${variant === "hero" ? "text-white/35" : "text-gray-400"}`} />
            <Input
              type="text"
              placeholder="77 xxx xx xx"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className={`pl-10 h-11 ${inputClasses}`}
            />
          </div>
        </div>

        {/* Ville */}
        <div>
          <label className={labelClasses}>Ville</label>
          <div className="relative">
            <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${variant === "hero" ? "text-white/35" : "text-gray-400"}`} />
            <SearchableSelect
              value={ville}
              onChange={setVille}
              options={lieuOptions}
              placeholder="Toutes les villes"
              searchPlaceholder="Rechercher une ville..."
              dark={variant === "hero"}
            />
          </div>
        </div>

        {/* Type de logement */}
        <div>
          <label className={labelClasses}>Type de logement</label>
          <div className="relative">
            <Home className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${variant === "hero" ? "text-white/35" : "text-gray-400"} z-10`} />
            <SearchableSelect
              value={typeLogement}
              onChange={setTypeLogement}
              options={typeLogementOptions}
              placeholder="Tous les types"
              searchPlaceholder="Rechercher un type..."
              dark={variant === "hero"}
            />
          </div>
        </div>

        {/* Prix max */}
        <div>
          <label className={labelClasses}>Budget maximum (FCFA)</label>
          <div className="relative">
            <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${variant === "hero" ? "text-white/35" : "text-gray-400"}`} />
            <Input
              type="text"
              placeholder="Ex: 500 000"
              value={prixMax}
              onChange={(e) => setPrixMax(formatBudget(e.target.value))}
              className={`pl-10 h-11 ${inputClasses}`}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Créer une alerte
            </>
          )}
        </Button>

        <p className={`text-xs text-center ${variant === "hero" ? "text-white/35" : "text-gray-400"}`}>
          Gratuit. Désinscription possible à tout moment.
        </p>
      </form>
    </div>
  );
};

export default AlertSubscriptionSection;
