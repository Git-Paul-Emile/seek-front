import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Loader2, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useSignalementDetail, useTraiterSignalement } from "@/hooks/useSignalement";

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  EN_COURS: "bg-blue-100 text-blue-700",
  TRAITE: "bg-green-100 text-green-700",
  REJETE: "bg-slate-100 text-slate-500",
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TRAITE: "Traité",
  REJETE: "Rejeté",
};

const ACTIONS = [
  { id: "EN_COURS", label: "Marquer En cours", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { id: "IGNORER", label: "Ignorer (rejeter)", color: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
  { id: "AVERTIR", label: "Avertir le signalé", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
  { id: "DESACTIVER_ANNONCE", label: "Désactiver l'annonce", color: "bg-red-50 text-red-700 hover:bg-red-100" },
  { id: "TRAITE", label: "Marquer Traité", color: "bg-green-50 text-green-700 hover:bg-green-100" },
];

export default function SignalementDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: signalement, isLoading } = useSignalementDetail(id);
  const { mutate: traiter, isPending } = useTraiterSignalement();
  const [note, setNote] = useState("");

  const handleAction = (action: string) => {
    traiter(
      { id, action, note: note || undefined },
      {
        onSuccess: () => {
          toast.success("Signalement mis à jour");
          setNote("");
        },
        onError: () => toast.error("Erreur lors du traitement"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (!signalement) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-400">
        <AlertTriangle className="w-10 h-10 mb-2 opacity-30" />
        <p>Signalement introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0C1A35] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#0C1A35]">Signalement</h1>
        <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${STATUT_COLORS[signalement.statut] ?? ""}`}>
          {STATUT_LABELS[signalement.statut] ?? signalement.statut}
        </span>
      </div>

      {/* Infos principales */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Type</p>
            <p className="font-semibold text-slate-700">{signalement.type}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Signalé par</p>
            <p className="font-medium text-slate-700">{signalement.signalePar}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Motif</p>
            <p className="font-medium text-slate-700">{signalement.motif}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Date</p>
            <p className="text-slate-500">{new Date(signalement.createdAt).toLocaleString("fr-FR")}</p>
          </div>
        </div>
        {signalement.description && (
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Description</p>
            <p className="text-slate-700 text-sm bg-slate-50 rounded-xl p-3">{signalement.description}</p>
          </div>
        )}
        {signalement.bien && (
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Bien signalé</p>
            <p className="text-slate-700 text-sm font-medium">{signalement.bien.titre ?? "Sans titre"} — {signalement.bien.ville}</p>
          </div>
        )}
        {signalement.proprietaireSignale && (
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Propriétaire signalé</p>
            <p className="text-slate-700 text-sm font-medium">
              {signalement.proprietaireSignale.prenom} {signalement.proprietaireSignale.nom} — {signalement.proprietaireSignale.telephone}
            </p>
          </div>
        )}
        {signalement.locataireSignale && (
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Locataire signalé</p>
            <p className="text-slate-700 text-sm font-medium">
              {signalement.locataireSignale.prenom} {signalement.locataireSignale.nom} — {signalement.locataireSignale.telephone}
            </p>
          </div>
        )}
        {signalement.noteAdmin && (
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Note admin</p>
            <p className="text-slate-600 text-sm bg-yellow-50 rounded-xl p-3">{signalement.noteAdmin}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[#0C1A35]">Traiter le signalement</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note admin (optionnelle)…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700
            placeholder:text-slate-300 outline-none focus:border-[#D4A843] resize-none bg-slate-50"
        />
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              disabled={isPending}
              onClick={() => handleAction(action.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${action.color}`}
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historique */}
      {signalement.historique && signalement.historique.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-[#0C1A35] mb-4">
            Historique sur la même cible ({signalement.historique.length})
          </h2>
          <div className="space-y-2">
            {signalement.historique.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 text-sm">
                <div>
                  <span className="font-medium text-slate-700">{h.motif}</span>
                  <span className="text-slate-400 ml-2 text-xs">· {h.signalePar}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUT_COLORS[h.statut] ?? ""}`}>
                    {STATUT_LABELS[h.statut] ?? h.statut}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
