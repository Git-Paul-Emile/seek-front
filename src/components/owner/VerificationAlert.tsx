import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  Award,
  Phone,
  XCircle,
} from "lucide-react";
import { useVerificationStatus } from "@/hooks/useVerification";

interface VerificationAlertProps {
  variant?: "banner" | "card";
  showBenefits?: boolean;
}

export function VerificationAlert({ variant = "banner", showBenefits = false }: VerificationAlertProps) {
  const { data: status, isLoading } = useVerificationStatus();

  if (isLoading) {
    if (variant === "banner") {
      return (
        <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
      );
    }
    return null;
  }

  // Si vérifié, ne rien afficher (notification envoyée dans les notifications)
  if (status?.statut === "VERIFIED") {
    return null;
  }

  // En attente de vérification
  if (status?.statut === "PENDING") {
    if (variant === "card") {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-800">Demande en cours d'analyse</h3>
              <p className="text-sm text-amber-700 mt-1">
                Votre demande de vérification est en cours d'analyse.
                Nous vous informerons dès validation.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800">
            Votre demande de vérification est en cours d'analyse.
          </p>
          <p className="text-xs text-amber-700">
            Nous vous informerons dès validation.
          </p>
        </div>
      </div>
    );
  }

  // Non vérifié - afficher l'alerte
  if (status?.statut === "NOT_VERIFIED") {
    if (variant === "card") {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#0C1A35]">
                Votre compte n'est pas encore vérifié
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Les propriétaires vérifiés bénéficient de :
              </p>
              {showBenefits && (
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Plus de visibilité
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Award className="w-4 h-4 text-blue-500" />
                    Badge de confiance
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Meilleur taux de contact
                  </li>
                </ul>
              )}
              <Link
                to="/owner/verification"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Vérifier mon identité
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0C1A35]">
            Votre compte n'est pas vérifié. Les annonces des comptes vérifiés inspirent plus de confiance.
          </p>
        </div>
        <Link
          to="/owner/verification"
          className="shrink-0 px-3 py-1.5 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Vérifier
        </Link>
      </div>
    );
  }

  // Rejeté - afficher le message de rejet avec le motif
  if (status?.statut === "REJECTED") {
    const motifRejet = status.documents?.motifRejet;
    
    if (variant === "card") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800">
                Demande de vérification rejetée
              </h3>
              {motifRejet && (
                <p className="text-sm text-red-700 mt-1">
                  Motif : {motifRejet}
                </p>
              )}
              <p className="text-sm text-slate-600 mt-2">
                Vous pouvez soumettre une nouvelle demande.
              </p>
              <Link
                to="/owner/verification"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Soumettre une nouvelle demande
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">
            Votre demande de vérification a été rejetée.
          </p>
          {motifRejet && (
            <p className="text-xs text-red-700">
              Motif : {motifRejet}
            </p>
          )}
        </div>
        <Link
          to="/owner/verification"
          className="shrink-0 px-3 py-1.5 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Refaire
        </Link>
      </div>
    );
  }
}

/**
 * Version compacte pour les formulaires (soft restriction)
 */
export function VerificationBanner({ onDismiss }: { onDismiss?: () => void }) {
  const { data: status, isLoading } = useVerificationStatus();

  if (isLoading || status?.statut === "VERIFIED") {
    return null;
  }

  const isPending = status?.statut === "PENDING";
  const isRejected = status?.statut === "REJECTED";
  const motifRejet = status?.documents?.motifRejet;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
      {isPending ? (
        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
      ) : isRejected ? (
        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800">
          {isPending
            ? "Votre demande de vérification est en cours d'analyse."
            : isRejected
            ? `Demande rejetée${motifRejet ? ` : ${motifRejet}` : ""}`
            : "Votre compte n'est pas vérifié. Les annonces des comptes vérifiés inspirent plus de confiance."}
        </p>
      </div>
      {!isPending && (
        <Link
          to="/owner/verification"
          className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2"
        >
          {isRejected ? "Refaire la demande" : "Vérifier mon identité"}
        </Link>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 text-amber-600 hover:bg-amber-100 rounded"
        >
          <span className="sr-only">Fermer</span>
          ×
        </button>
      )}
    </div>
  );
}
