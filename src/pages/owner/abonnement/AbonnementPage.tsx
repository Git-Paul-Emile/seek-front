import { useState } from "react";
import {
  Crown,
  Loader2,
  CheckCircle,
  Download,
  Clock,
  Infinity,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  useOwnerAbonnementActif,
  useOwnerAbonnements,
  useOwnerPlans,
  useSouscrireAbonnement,
} from "@/hooks/useMonetisation";
import type { PlanAbonnement, AbonnementProprietaire } from "@/api/monetisation";
import { generateRecu } from "@/lib/generateRecu";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const fmtMontant = (n: number) =>
  n === 0 ? "Gratuit" : new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const STATUT_CONFIG: Record<string, { label: string; cls: string }> = {
  EN_ATTENTE: { label: "En attente de confirmation", cls: "bg-yellow-100 text-yellow-700" },
  ACTIF: { label: "Actif", cls: "bg-green-100 text-green-700" },
  EXPIRE: { label: "Expiré", cls: "bg-slate-100 text-slate-500" },
  RESILIE: { label: "Résilié", cls: "bg-red-100 text-red-600" },
};

const MODE_PAIEMENT = ["Orange Money", "Wave"];

// ─── Modal souscription ───────────────────────────────────────────────────────

function SouscriptionModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: PlanAbonnement;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const souscrire = useSouscrireAbonnement();
  const [modePaiement, setModePaiement] = useState(MODE_PAIEMENT[0]);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!reference.trim()) {
      toast.error("La référence de paiement est requise");
      return;
    }
    souscrire.mutate(
      { planId: plan.id, modePaiement, reference, note: note || undefined },
      {
        onSuccess: () => {
          toast.success("Demande d'abonnement envoyée. En attente de confirmation admin.");
          onSuccess();
          onClose();
        },
        onError: (err: unknown) =>
          toast.error((err as any)?.response?.data?.message ?? "Erreur"),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h2 className="font-bold text-[#0C1A35] text-base">
              Souscrire au plan {plan.nom}
            </h2>
            <p className="text-xs text-slate-400">{fmtMontant(plan.prix)} / 30 jours</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Mode de paiement
            </label>
            <div className="flex gap-2">
              {MODE_PAIEMENT.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModePaiement(m)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                    modePaiement === m
                      ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Référence de paiement *
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: OM-1234567890"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm
                text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              Envoyez {fmtMontant(plan.prix)} sur {modePaiement} et copiez la référence ici.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Note (optionnel)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Informations complémentaires…"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm
                text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={souscrire.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A843] text-white
              text-sm font-semibold rounded-xl hover:bg-[#c49a36] transition-colors disabled:opacity-50"
          >
            {souscrire.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Soumettre la demande
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl
              hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Carte plan ───────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isActive,
  onSelect,
}: {
  plan: PlanAbonnement;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-5 transition-all ${
        isActive
          ? "border-[#D4A843] shadow-lg shadow-[#D4A843]/10"
          : "border-slate-100 shadow-sm hover:border-[#D4A843]/40"
      }`}
    >
      {isActive && (
        <span className="absolute -top-2 left-4 text-[10px] font-bold px-2 py-0.5 bg-[#D4A843] text-white rounded-full">
          PLAN ACTUEL
        </span>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-[#0C1A35]">{plan.nom}</h3>
          {plan.description && (
            <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#D4A843]">{fmtMontant(plan.prix)}</p>
          {plan.prix > 0 && <p className="text-xs text-slate-400">/ 30 jours</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-4">
        {plan.maxAnnonces === null ? (
          <>
            <Infinity className="w-4 h-4 text-[#D4A843]" />
            <span>Annonces illimitées</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-[#D4A843]" />
            <span>{plan.maxAnnonces} annonce(s) active(s)</span>
          </>
        )}
      </div>
      {!isActive && (
        <button
          onClick={onSelect}
          className="w-full py-2 text-sm font-semibold bg-[#D4A843]/10 text-[#D4A843] rounded-xl
            hover:bg-[#D4A843] hover:text-white transition-colors"
        >
          Souscrire
        </button>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AbonnementPage() {
  const { data: abonnementActif, isLoading: loadingActif } = useOwnerAbonnementActif();
  const { data: historique = [], isLoading: loadingHist } = useOwnerAbonnements();
  const { data: plans = [], isLoading: loadingPlans } = useOwnerPlans();

  const [selectedPlan, setSelectedPlan] = useState<PlanAbonnement | null>(null);

  const handleDownloadRecu = (abo: AbonnementProprietaire) => {
    generateRecu({
      type: "abonnement",
      proprietaireNom: "Mon compte",
      planNom: abo.plan.nom,
      montant: abo.montant,
      modePaiement: abo.modePaiement ?? "Mobile Money",
      reference: abo.reference ?? "—",
      dateDebut: abo.dateDebut,
      dateFin: abo.dateFin,
      createdAt: abo.createdAt,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Breadcrumb items={[{ label: "Mon abonnement" }]} />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
          <Crown className="w-5 h-5 text-[#D4A843]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0C1A35]">Mon abonnement</h1>
          <p className="text-sm text-slate-400">Gérez votre plan et vos annonces</p>
        </div>
      </div>

      {/* Plan actuel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Plan actuel</h2>
        {loadingActif ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement…
          </div>
        ) : abonnementActif ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4A843]" />
                <span className="font-bold text-[#0C1A35]">{abonnementActif.plan.nom}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  ACTIF
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                Expire le {fmtDate(abonnementActif.dateFin)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#D4A843]">
                {fmtMontant(abonnementActif.montant)} / mois
              </p>
              <p className="text-xs text-slate-400">
                {abonnementActif.plan.maxAnnonces === null
                  ? "Illimité"
                  : `${abonnementActif.plan.maxAnnonces} annonces`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Plan Basic (gratuit)</p>
              <p className="text-xs text-slate-400">1 annonce active incluse. Souscrivez un plan pour plus d'annonces.</p>
            </div>
          </div>
        )}
      </div>

      {/* Plans disponibles */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Plans disponibles</h2>
        {loadingPlans ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun plan disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={abonnementActif?.planId === plan.id}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Historique des abonnements</h2>
        {loadingHist ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : historique.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun historique d'abonnement.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Période</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historique.map((abo) => {
                  const conf = STATUT_CONFIG[abo.statut] ?? {
                    label: abo.statut,
                    cls: "bg-slate-100 text-slate-500",
                  };
                  return (
                    <tr key={abo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0C1A35]">{abo.plan.nom}</td>
                      <td className="px-4 py-3 text-slate-600">{fmtMontant(abo.montant)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {fmtDate(abo.dateDebut)} → {fmtDate(abo.dateFin)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conf.cls}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {abo.statut === "ACTIF" && (
                          <button
                            onClick={() => handleDownloadRecu(abo)}
                            className="flex items-center gap-1 text-xs text-[#D4A843] hover:text-[#c49a36]
                              font-medium transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Reçu PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal souscription */}
      {selectedPlan && (
        <SouscriptionModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
