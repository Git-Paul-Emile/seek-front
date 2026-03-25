import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Send, AlertTriangle } from "lucide-react";
import { createSignalement, MotifSignalement } from "@/api/signalement";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";

const MOTIFS: { value: MotifSignalement; label: string }[] = [
  { value: "ARNAQUE", label: "Arnaque / Fraude" },
  { value: "FAUSSES_INFOS", label: "Fausses informations" },
  { value: "INDISPONIBLE", label: "Annonce indisponible" },
  { value: "DOUBLON", label: "Annonce en doublon" },
  { value: "INAPPROPRIE", label: "Contenu inapproprié" },
  { value: "AUTRE", label: "Autre" },
];

interface SignalementModalProps {
  bien: { id: string; titre?: string | null };
  onClose: () => void;
}

export default function SignalementModal({ bien, onClose }: SignalementModalProps) {
  const { compte } = useComptePublicAuth();
  
  const [motif, setMotif] = useState<MotifSignalement>("ARNAQUE");
  const [commentaire, setCommentaire] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");

  useEffect(() => {
    if (compte) {
      setNom(`${compte.prenom} ${compte.nom}`);
      setTelephone(compte.telephone || "");
    }
  }, [compte]);

  const mutation = useMutation({
    mutationFn: () => createSignalement({
      bienId: bien.id,
      motif,
      commentaire,
      nom,
      telephone,
    }),
    onSuccess: () => {
      toast.success("Votre signalement a bien été envoyé.");
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Une erreur est survenue lors de l'envoi du signalement.";
      toast.error(message);
    },
  });

  const handleSubmit = () => {
    if (!nom.trim() || !telephone.trim()) {
      toast.error("Veuillez remplir votre nom et votre numéro de téléphone.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#0C1A35] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Signaler cette annonce
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Aidez-nous à maintenir la qualité de Seek en signalant les annonces problématiques. 
          Votre signalement sera examiné par notre équipe.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Motif du signalement <span className="text-red-500">*</span>
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value as MotifSignalement)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition appearance-none"
            >
              {MOTIFS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {!compte && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-500">Détails supplémentaires (Optionnel)</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              placeholder="Veuillez donner plus de détails sur le problème..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            disabled={mutation.isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            {mutation.isPending ? "Envoi..." : "Signaler"}
          </button>
        </div>
      </div>
    </div>
  );
}
