import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  ArrowLeft, Loader2, AlertTriangle, MapPin, Eye, User,
  Phone, Mail, Flag, CheckCircle, ShieldAlert, Trash2, MessageSquare,
} from "lucide-react";
import {
  useBienSignaleDetail,
  useRejeterSignalements,
  useAvertirProprietaire,
  useSanctionnerAnnonce,
} from "@/hooks/useSignalement";

const MOTIF_LABELS: Record<string, string> = {
  ARNAQUE_SUSPECTEE:     "Arnaque suspectée",
  PHOTOS_NON_CONFORMES:  "Photos non conformes",
  LOGEMENT_INSALUBRE:    "Logement insalubre",
  INFORMATIONS_ERRONEES: "Informations erronées",
  PRIX_INCORRECT:        "Prix incorrect",
  DOUBLON:               "Doublon",
  AUTRE:                 "Autre",
};

export default function AdminSignalementDetail() {
  const { bienId } = useParams<{ bienId: string }>();
  const navigate    = useNavigate();

  const { data: detail, isLoading, isError } = useBienSignaleDetail(bienId ?? null);

  const rejeterMutation    = useRejeterSignalements();
  const avertirMutation    = useAvertirProprietaire();
  const sanctionnerMutation = useSanctionnerAnnonce();

  const [showAvertirModal, setShowAvertirModal]   = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [avertirMessage, setAvertirMessage]       = useState("");

  const handleRejeter = () => {
    if (!bienId) return;
    if (!confirm("Confirmer : les signalements sont jugés abusifs et le compteur sera remis à zéro ?")) return;
    rejeterMutation.mutate(bienId, { onSuccess: () => navigate("/admin/signalements") });
  };

  const handleAvertir = () => {
    if (!bienId || !avertirMessage.trim()) return;
    avertirMutation.mutate(
      { bienId, message: avertirMessage.trim() },
      { onSuccess: () => { setShowAvertirModal(false); setAvertirMessage(""); } }
    );
  };

  const handleSanctionner = () => {
    if (!bienId) return;
    sanctionnerMutation.mutate(bienId, { onSuccess: () => navigate("/admin/signalements") });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-500">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p>Impossible de charger le détail.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#D4A843] hover:underline">Retour</button>
      </div>
    );
  }

  const { proprietaire, signalements, adminAvertissements } = detail;
  const estShadowBanne = detail.statutAnnonce === "SUSPENDU_SIGNALEMENT";

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Signalements", to: "/admin/signalements" },
          { label: detail.titre ?? "Annonce" },
        ]}
      />

      {/* Bouton retour */}
      <button
        onClick={() => navigate("/admin/signalements")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0C1A35] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux signalements
      </button>

      {/* Header annonce */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#0C1A35] truncate">
              {detail.titre ?? "Annonce sans titre"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {detail.ville}{detail.quartier ? ` · ${detail.quartier}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Badge signalements */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
              <Flag className="w-3.5 h-3.5" />
              {detail.reportCount} signalement{detail.reportCount > 1 ? "s" : ""}
            </span>
            {/* Statut shadow ban */}
            {estShadowBanne && (
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                Masquée
              </span>
            )}
            {/* Lien voir l'annonce */}
            <Link
              to={`/annonce/${detail.id}`}
              target="_blank"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#D4A843] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Photo */}
        {detail.photos.length > 0 && (
          <div className="mt-4">
            <img
              src={detail.photos[0]}
              alt="Photo annonce"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Propriétaire */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-[#0C1A35] flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" /> Propriétaire
          </h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-[#0C1A35]">{proprietaire.prenom} {proprietaire.nom}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <Phone className="w-3.5 h-3.5" /> {proprietaire.telephone}
            </div>
            {proprietaire.email && (
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-3.5 h-3.5" /> {proprietaire.email}
              </div>
            )}
            {/* Historique avertissements */}
            {proprietaire.nbAvertissements > 0 && (
              <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-orange-700 font-semibold text-xs">
                  {proprietaire.nbAvertissements} avertissement{proprietaire.nbAvertissements > 1 ? "s" : ""} déjà reçu{proprietaire.nbAvertissements > 1 ? "s" : ""}
                </p>
              </div>
            )}
            {proprietaire.estRestreint && (
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-700 text-xs font-medium">
                Compte restreint
              </div>
            )}
            {proprietaire.estSuspendu && (
              <div className="p-2 bg-red-50 rounded-lg text-red-700 text-xs font-medium">
                Compte suspendu
              </div>
            )}
          </div>
        </div>

        {/* Historique avertissements admin */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-[#0C1A35] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" /> Historique des avertissements
          </h2>
          {adminAvertissements.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun avertissement envoyé.</p>
          ) : (
            <div className="space-y-2">
              {adminAvertissements.map((av, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100">
                  <p className="font-medium text-slate-700 text-xs mb-1">
                    {new Date(av.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="line-clamp-2">{av.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-[#0C1A35] flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-400" /> Signalements actifs ({signalements.length})
        </h2>
        {signalements.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun signalement actif.</p>
        ) : (
          <div className="space-y-3">
            {signalements.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    {MOTIF_LABELS[s.motif as string] ?? s.motif}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {s.justification && (
                  <p className="text-sm text-slate-600">{s.justification}</p>
                )}
                {s.preuve && (
                  <a href={s.preuve} target="_blank" rel="noopener noreferrer" className="text-xs text-[#D4A843] hover:underline">
                    Voir la preuve
                  </a>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {s.signaleParNom && <span>{s.signaleParNom}</span>}
                  <span>{s.signaleParTel}</span>
                  {s.signaleParEmail && <span>{s.signaleParEmail}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions admin */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-[#0C1A35] mb-4">Décision</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rejeter */}
          <button
            onClick={handleRejeter}
            disabled={rejeterMutation.isPending}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-sm">Rejeter</span>
            <span className="text-xs text-center text-green-600">Signalements abusifs — compteur remis à zéro, annonce restaurée</span>
          </button>

          {/* Avertir */}
          <button
            onClick={() => setShowAvertirModal(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors"
          >
            <ShieldAlert className="w-6 h-6" />
            <span className="font-semibold text-sm">Avertir</span>
            <span className="text-xs text-center text-orange-600">Message officiel au propriétaire avec demande de correction</span>
          </button>

          {/* Sanctionner */}
          <button
            onClick={() => setShowSanctionModal(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
          >
            <Trash2 className="w-6 h-6" />
            <span className="font-semibold text-sm">Sanctionner</span>
            <span className="text-xs text-center text-red-600">Suppression définitive de l'annonce</span>
          </button>
        </div>
      </div>

      {/* Modal Avertir */}
      {showAvertirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAvertirModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-[#0C1A35]">Avertir le propriétaire</h3>
            <p className="text-sm text-slate-500">
              Rédigez un message officiel. Il sera envoyé au propriétaire et conservé dans l'historique.
            </p>
            <textarea
              value={avertirMessage}
              onChange={(e) => setAvertirMessage(e.target.value)}
              placeholder="Ex : Veuillez corriger vos photos sous 24h — elles ne correspondent pas au logement décrit."
              rows={5}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/40 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAvertirModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAvertir}
                disabled={!avertirMessage.trim() || avertirMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 text-sm font-semibold disabled:opacity-50"
              >
                {avertirMutation.isPending ? "Envoi…" : "Envoyer l'avertissement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sanctionner */}
      {showSanctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSanctionModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Suppression définitive
            </h3>
            <p className="text-sm text-slate-600">
              Cette action est <strong>irréversible</strong>. L'annonce{" "}
              <strong>{detail.titre ?? "sans titre"}</strong> sera définitivement supprimée de la plateforme.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSanctionModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSanctionner}
                disabled={sanctionnerMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-semibold disabled:opacity-50"
              >
                {sanctionnerMutation.isPending ? "Traitement…" : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
