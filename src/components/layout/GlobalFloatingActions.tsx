import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Phone, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { creerAlerte, creerAlerteCompteApi } from "@/api/alerte";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useLieux } from "@/hooks/useRecherche";

const GlobalFloatingActions = () => {
  const { data: typesLogement = [] } = useTypeLogements();
  const { data: lieux } = useLieux();
  const { compte, isAuthenticated } = useComptePublicAuth();

  // Panneau alerte flottant
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [alertClosing, setAlertClosing] = useState(false);

  // Alerte form state
  const [telephone, setTelephone] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState("");
  
  // Alerte specific fields
  const [alertVille, setAlertVille] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertBudgetMin, setAlertBudgetMin] = useState("");
  const [alertBudgetMax, setAlertBudgetMax] = useState("");

  useEffect(() => {
    if (isAuthenticated && compte?.telephone) {
      setTelephone(compte.telephone);
    }
  }, [compte?.telephone, isAuthenticated]);

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
      if (isAuthenticated) {
        await creerAlerteCompteApi({
          typeLogement: alertType || undefined,
          ville: alertVille || undefined,
          prixMin: prixMinValue,
          prixMax: prixMaxValue,
          canalPrefere: "SMS",
        });
      } else {
        await creerAlerte({
          telephone,
          typeLogement: alertType || undefined,
          ville: alertVille || undefined,
          prixMin: prixMinValue,
          prixMax: prixMaxValue,
          canalPrefere: "SMS",
        });
      }
      setAlertSuccess(true);
      setTelephone(isAuthenticated ? compte?.telephone ?? "" : "");
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

  const villeOptions = (lieux?.villes ?? []).map((v) => ({ value: v, label: v }));
  const typeLogementOptions = typesLogement.map((t) => ({ value: t.slug, label: t.nom }));

  return (
    <>
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
            <div className="p-4 bg-white">
              {alertSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center bg-white">
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
                <form onSubmit={handleAlertSubmit} noValidate className="space-y-3 bg-white">
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
                        type="text"
                        placeholder="77 xxx xx xx"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        readOnly={isAuthenticated}
                        className="pl-9 h-9 text-xs"
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

        {/* Action Buttons Row */}
        <div className="flex items-end gap-3 flex-row-reverse w-full">
          {/* Bouton Lampe */}
          <button
            onClick={showAlertPanel ? closeAlertPanel : openAlertPanel}
            title="Créer une alerte SMS"
            className={`lamp-glow-btn w-14 h-14 rounded-full bg-[#0C1A35] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 ${showAlertPanel ? "rotate-12" : ""}`}
          >
            <Bell className={`w-6 h-6 transition-colors duration-200 ${showAlertPanel ? "text-white/60" : "text-[#D4A843]"}`} />
          </button>

        </div>
      </div>
    </>
  );
};

export default GlobalFloatingActions;
