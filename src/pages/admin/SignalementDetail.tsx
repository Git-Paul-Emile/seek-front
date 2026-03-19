import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ArrowLeft, Loader2, AlertTriangle, MapPin, Home, Eye, ExternalLink, User, Phone, Mail, Image } from "lucide-react";
import { toast } from "sonner";
import { SkDetailSections } from "@/components/ui/Skeleton";
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
      <div className="py-20">
        <SkDetailSections sections={2} />
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
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Signalements", to: "/admin/signalements" }, { label: "Détail" }]} />
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
            <p className="text-slate-400 text-xs font-medium mb-1">Date</p>
            <p className="text-slate-500">{new Date(signalement.createdAt).toLocaleString("fr-FR")}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-400 text-xs font-medium mb-1">Motif</p>
            <p className="font-medium text-slate-700">{signalement.motif}</p>
          </div>
        </div>

        {/* Contact du signaleur */}
        {(signalement.signaleParNom || signalement.signaleParTel) && (
          <div className="bg-blue-50 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-blue-700 mb-2">Contact du signaleur</p>
            {signalement.signaleParNom && (
              <p className="text-sm text-slate-700">
                <span className="text-slate-400 text-xs">Nom :</span>{" "}
                <span className="font-medium">{signalement.signaleParNom}</span>
              </p>
            )}
            {signalement.signaleParTel && (
              <p className="text-sm text-slate-700">
                <span className="text-slate-400 text-xs">Tél :</span>{" "}
                <a href={`tel:${signalement.signaleParTel}`} className="font-medium text-blue-700 hover:underline">
                  {signalement.signaleParTel}
                </a>
              </p>
            )}
            {signalement.signaleParEmail && (
              <p className="text-sm text-slate-700">
                <span className="text-slate-400 text-xs">Email :</span>{" "}
                <a href={`mailto:${signalement.signaleParEmail}`} className="font-medium text-blue-700 hover:underline">
                  {signalement.signaleParEmail}
                </a>
              </p>
            )}
          </div>
        )}

        {signalement.description && (
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Description</p>
            <p className="text-slate-700 text-sm bg-slate-50 rounded-xl p-3">{signalement.description}</p>
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

      {/* Détails du bien signalé */}
      {signalement.bien && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0C1A35] flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-400" />
              Bien signalé
            </h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${signalement.bien.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {signalement.bien.actif ? "Actif" : "Désactivé"}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                {signalement.bien.statutAnnonce}
              </span>
              <Link
                to={`/admin/annonces/${signalement.bien.id}`}
                className="flex items-center gap-1 text-xs text-[#D4A843] hover:underline font-medium"
              >
                Voir <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Photos */}
          {signalement.bien.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {signalement.bien.photos.slice(0, 5).map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt=""
                  className="w-24 h-20 object-cover rounded-xl shrink-0 border border-slate-100"
                />
              ))}
              {signalement.bien.photos.length > 5 && (
                <div className="w-24 h-20 rounded-xl shrink-0 border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                  <Image className="w-4 h-4 mb-1" />
                  <span className="text-xs">+{signalement.bien.photos.length - 5}</span>
                </div>
              )}
            </div>
          )}

          {/* Titre & type */}
          <div>
            <p className="font-semibold text-[#0C1A35] text-base">{signalement.bien.titre ?? "Sans titre"}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {[signalement.bien.typeLogement?.nom, signalement.bien.typeTransaction?.nom].filter(Boolean).join(" · ")}
              {signalement.bien.statutBien && <span className="ml-2 text-slate-500">· {signalement.bien.statutBien.nom}</span>}
            </p>
          </div>

          {/* Localisation */}
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span>
              {[signalement.bien.adresse, signalement.bien.quartier, signalement.bien.ville, signalement.bien.pays]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>

          {/* Stats & caractéristiques */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {signalement.bien.prix !== null && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Prix</p>
                <p className="text-sm font-semibold text-[#0C1A35]">
                  {new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(signalement.bien.prix)}
                  {signalement.bien.frequencePaiement === "MENSUEL" ? "/mois" : signalement.bien.frequencePaiement === "ANNUEL" ? "/an" : ""}
                </p>
              </div>
            )}
            {signalement.bien.surface !== null && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Surface</p>
                <p className="text-sm font-semibold text-[#0C1A35]">{signalement.bien.surface} m²</p>
              </div>
            )}
            {signalement.bien.nbChambres !== null && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Chambres</p>
                <p className="text-sm font-semibold text-[#0C1A35]">{signalement.bien.nbChambres}</p>
              </div>
            )}
            {signalement.bien.nbSdb !== null && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Salles de bain</p>
                <p className="text-sm font-semibold text-[#0C1A35]">{signalement.bien.nbSdb}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {signalement.bien.nbVues} vues</span>
            {signalement.bien.meuble && <span className="px-2 py-0.5 rounded-lg bg-slate-100">Meublé</span>}
            <span>Publié le {new Date(signalement.bien.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>

          {/* Description */}
          {signalement.bien.description && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 line-clamp-4">{signalement.bien.description}</p>
            </div>
          )}

          {/* Propriétaire */}
          {signalement.bien.proprietaire && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-400 mb-2">Propriétaire</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-700">
                    {signalement.bien.proprietaire.prenom} {signalement.bien.proprietaire.nom}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <a href={`tel:${signalement.bien.proprietaire.telephone}`} className="flex items-center gap-1 hover:text-[#D4A843]">
                      <Phone className="w-3 h-3" />{signalement.bien.proprietaire.telephone}
                    </a>
                    {signalement.bien.proprietaire.email && (
                      <a href={`mailto:${signalement.bien.proprietaire.email}`} className="flex items-center gap-1 hover:text-[#D4A843]">
                        <Mail className="w-3 h-3" />{signalement.bien.proprietaire.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
