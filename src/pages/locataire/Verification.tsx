import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useLocataireVerificationStatus } from "@/hooks/useLocataireVerification";
import { useCreateLocataireDiditSession } from "@/hooks/useDidit";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function LocataireVerification() {
  const { data: verification, isLoading } = useLocataireVerificationStatus();
  const createSession = useCreateLocataireDiditSession();
  const queryClient = useQueryClient();

  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const handleStartVerification = async () => {
    try {
      const session = await createSession.mutateAsync();
      setVerificationUrl(session.verificationUrl);
    } catch {
      toast.error("Impossible de démarrer la vérification. Réessayez.");
    }
  };

  const handleCloseModal = () => {
    setVerificationUrl(null);
    queryClient.invalidateQueries({ queryKey: ["locataireVerification"] });
    toast.info("Vérification en cours de traitement. Le statut sera mis à jour sous peu.");
  };

  const statut = verification?.statut ?? "NOT_VERIFIED";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
        <Shield className="w-3.5 h-3.5" />
        Vérification d'identité
      </div>
      <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
        Vérifiez votre identité
      </h1>
      <p className="text-slate-400 text-sm">
        La vérification est assurée par Didit, un service de KYC certifié.
      </p>

      {statut === "VERIFIED" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-800">Identité vérifiée</h2>
            <p className="text-sm text-emerald-700 mt-0.5">
              Votre identité a été vérifiée avec succès.
            </p>
          </div>
        </div>
      )}

      {statut === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-800">Vérification en cours</h2>
            <p className="text-sm text-amber-700 mt-0.5">
              Votre dossier est en cours d'analyse. Vous serez notifié du résultat.
            </p>
          </div>
        </div>
      )}

      {statut === "REJECTED" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <XCircle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-800">Vérification refusée</h2>
            <p className="text-sm text-red-700 mt-0.5">
              Votre vérification n'a pas abouti. Vous pouvez recommencer.
            </p>
          </div>
        </div>
      )}

      {statut !== "VERIFIED" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#D4A843]/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-[#D4A843]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0C1A35] mb-2">
                {statut === "REJECTED" ? "Recommencer" : "Démarrer la vérification"}
              </h2>
              <p className="text-slate-500 text-sm">
                Munissez-vous de votre pièce d'identité et d'une bonne luminosité. Le
                processus prend 2 à 3 minutes.
              </p>
            </div>

            <ul className="text-left space-y-2 text-sm text-slate-600">
              {[
                "Photo de votre pièce d'identité",
                "Selfie en temps réel (détection de vivacité)",
                "Résultat immédiat dans la plupart des cas",
              ].map((step) => (
                <li key={step} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {step}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
              Powered by <span className="font-semibold text-slate-500">Didit</span> —
              vérification KYC certifiée
            </div>

            <button
              onClick={handleStartVerification}
              disabled={createSession.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Préparation…
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  {statut === "REJECTED" ? "Recommencer la vérification" : "Démarrer la vérification"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          to="/locataire/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>

      {/* Didit verification modal */}
      {verificationUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg h-[680px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0C1A35]">
                <Shield className="w-4 h-4 text-[#D4A843]" />
                Vérification d'identité — Didit
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              src={verificationUrl}
              title="Vérification d'identité Didit"
              allow="camera; microphone; fullscreen; autoplay; encrypted-media"
              className="flex-1 w-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
