import { Link } from "react-router-dom";
import {
  AlertCircle,
  TrendingDown,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Bell,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useBiensEnRetard } from "@/hooks/useBail";
import { useEnvoyerRappel } from "@/hooks/useQuittance";
import { toast } from "sonner";

const fmt = (n: number) => n.toLocaleString("fr-FR");

const joursLabel = (j: number) =>
  j === 0 ? "aujourd'hui" : j === 1 ? "1 jour" : `${j} jours`;

export default function LoyersEnRetardPage() {
  const { data: biens = [], isLoading } = useBiensEnRetard();
  const { mutate: envoyerRappel, isPending: isSending } = useEnvoyerRappel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/owner/dashboard" },
          { label: "Loyers en retard" },
        ]}
      />

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Loyers en retard
          </div>
          <h1 className="font-display text-xl font-bold text-[#0C1A35]">
            Suivi des impayés
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {biens.length === 0
              ? "Aucun loyer en retard"
              : `${biens.length} bien${biens.length > 1 ? "s" : ""} avec des échéances en retard`}
          </p>
        </div>
      </div>

      {biens.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-[#0C1A35]">
            Tout est à jour !
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Aucun loyer en retard pour l'instant.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {biens.map((b) => (
            <div
              key={b.bailId}
              className="bg-white rounded-2xl border border-red-100 p-5 space-y-4"
            >
              {/* En-tête bien */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
                    <h2 className="font-semibold text-[#0C1A35] truncate">
                      {b.bien.titre || "Logement sans titre"}
                    </h2>
                  </div>
                  {(b.bien.ville || b.bien.pays) && (
                    <p className="text-xs text-slate-400 ml-6">
                      {[b.bien.adresse, b.bien.ville, b.bien.pays]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <Link
                  to={`/owner/biens/${b.bien.id}/paiements`}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                    border border-[#D4A843]/40 text-[#D4A843] hover:bg-[#D4A843]/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir paiements
                </Link>
              </div>

              {/* Résumé retard */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-red-600">
                    {b.nbEcheancesEnRetard}
                  </p>
                  <p className="text-[10px] text-red-400 font-medium mt-0.5">
                    échéance{b.nbEcheancesEnRetard > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-red-600">
                    {fmt(b.totalRetard)}
                  </p>
                  <p className="text-[10px] text-red-400 font-medium mt-0.5">
                    FCFA dûs
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-red-600">
                    {joursLabel(b.joursRetardMax)}
                  </p>
                  <p className="text-[10px] text-red-400 font-medium mt-0.5">
                    de retard max
                  </p>
                </div>
              </div>

              {/* Locataire */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-xs font-semibold text-[#0C1A35]">
                    {b.locataire.prenom} {b.locataire.nom}
                  </p>
                  <p className="text-[11px] text-slate-400">{b.locataire.telephone}</p>
                </div>
                <button
                  onClick={() => {
                    const firstEch = b.echeancesEnRetard[0];
                    if (!firstEch) return;
                    envoyerRappel(
                      { bienId: b.bien.id, bailId: b.bailId, echeanceId: firstEch.id },
                      {
                        onSuccess: (data) => toast.success(data.message ?? "Relance envoyée"),
                        onError: () => toast.error("Erreur lors de l'envoi de la relance"),
                      }
                    );
                  }}
                  disabled={isSending}
                  title="Envoyer une relance SMS + Email au locataire"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                    border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-60"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Bell className="w-3.5 h-3.5" />
                  )}
                  Relance
                </button>
              </div>

              {/* Détail des échéances en retard */}
              <div className="space-y-1.5">
                {b.echeancesEnRetard.map((e) => {
                  const jours = Math.max(
                    0,
                    Math.floor(
                      (Date.now() - new Date(e.dateEcheance).getTime()) / 86400000
                    )
                  );
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-50 border border-red-100"
                    >
                      <span className="text-xs text-slate-600">
                        {new Date(e.dateEcheance).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-500 font-medium">
                          {joursLabel(jours)} de retard
                        </span>
                        <span className="text-xs font-bold text-[#0C1A35]">
                          {fmt(e.montant)} F
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
