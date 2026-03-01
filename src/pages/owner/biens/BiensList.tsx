import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  FileText,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  RotateCcw,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { StatutAnnonce } from "@/api/bien";
import { useBiens, useDeleteBien, useRetourBrouillon, useAnnulerAnnonce } from "@/hooks/useBien";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

const STATUT_CONFIG: Record<
  StatutAnnonce,
  { color: string; textColor: string; icon: React.ElementType; label: string }
> = {
  BROUILLON:  { color: "bg-slate-100",  textColor: "text-slate-700",  icon: FileText,    label: "Brouillon" },
  EN_ATTENTE: { color: "bg-yellow-100", textColor: "text-yellow-700", icon: Clock,       label: "En attente" },
  PUBLIE:     { color: "bg-green-100",  textColor: "text-green-700",  icon: CheckCircle, label: "Publié" },
  REJETE:     { color: "bg-red-100",    textColor: "text-red-700",    icon: XCircle,     label: "Rejeté" },
  ANNULE:     { color: "bg-gray-100",   textColor: "text-gray-600",   icon: XCircle,     label: "Annulé" },
};

function StatutBadge({ statut }: { statut: StatutAnnonce }) {
  const { color, textColor, icon: Icon, label } = STATUT_CONFIG[statut];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color} ${textColor}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function BiensList() {
  const [filter, setFilter] = useState<StatutAnnonce | "TOUS" | "ASSOCIE">("TOUS");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [retourTargetId, setRetourTargetId] = useState<string | null>(null);
  const [annulerTargetId, setAnnulerTargetId] = useState<string | null>(null);
  const [showRejetAlert, setShowRejetAlert] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowRejetAlert(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const { data: biens = [], isLoading } = useBiens();
  const deleteMutation = useDeleteBien();
  const retour = useRetourBrouillon();
  const annuler = useAnnulerAnnonce();

  const counts = useMemo(
    () =>
      biens.reduce(
        (acc, b) => {
          acc[b.statutAnnonce] = (acc[b.statutAnnonce] ?? 0) + 1;
          return acc;
        },
        {} as Partial<Record<StatutAnnonce, number>>
      ),
    [biens]
  );

  const associeCount = biens.filter((b) => b.hasBailActif).length;

  const filteredBiens =
    filter === "TOUS" ? biens :
    filter === "ASSOCIE" ? biens.filter((b) => b.hasBailActif) :
    biens.filter((b) => b.statutAnnonce === filter);

  const rejeteCount = counts.REJETE ?? 0;

  const retourTarget = biens.find((b) => b.id === retourTargetId);
  const retourLabel =
    retourTarget?.statutAnnonce === "EN_ATTENTE" ? "Annuler la soumission" : "Dépublier";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843]">
            <Building2 className="w-3.5 h-3.5" />
            Gestion de biens
          </div>
          {biens.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {biens.length} bien{biens.length > 1 ? "s" : ""} au total
            </p>
          )}
        </div>
        <Link
          to="/owner/biens/ajouter"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un bien
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setFilter("TOUS")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === "TOUS" ? "bg-[#0C1A35] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tous
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === "TOUS" ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
            {biens.length}
          </span>
        </button>

        <button
          onClick={() => setFilter("ASSOCIE")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === "ASSOCIE" ? "bg-[#0C1A35] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <UserCheck className={`w-3.5 h-3.5 ${filter === "ASSOCIE" ? "text-white" : "text-indigo-500"}`} />
          Associé
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === "ASSOCIE" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
            {associeCount}
          </span>
        </button>

        {(["BROUILLON", "EN_ATTENTE", "PUBLIE", "REJETE"] as const).map((statut) => {
          const { color, textColor, icon: Icon, label } = STATUT_CONFIG[statut];
          const count = counts[statut] ?? 0;
          const active = filter === statut;
          return (
            <button
              key={statut}
              onClick={() => setFilter(statut)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-[#0C1A35] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : textColor}`} />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : `${color} ${textColor}`}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerte biens rejetés */}
      {showRejetAlert && rejeteCount > 0 && (filter === "TOUS" || filter === "REJETE") && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">
            {rejeteCount} bien{rejeteCount > 1 ? "s" : ""} rejeté
            {rejeteCount > 1 ? "s" : ""}. Consultez le motif et corrigez avant de resoumettre.
          </span>
          <button onClick={() => setShowRejetAlert(false)} className="p-1 hover:bg-red-100 rounded shrink-0">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Liste */}
      {filteredBiens.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#0C1A35] mb-2">Aucun bien trouvé</h3>
          <p className="text-slate-500">
            {filter === "TOUS"
              ? "Vous n'avez pas encore de biens."
              : filter === "ASSOCIE"
              ? "Vous n'avez aucun bien avec un locataire actif."
              : `Vous n'avez aucun bien avec le statut « ${STATUT_CONFIG[filter].label} ».`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bien</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Prix</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBiens.map((bien) => (
                  <Fragment key={bien.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      {/* Bien */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {bien.photos && bien.photos.length > 0 ? (
                            <img src={bien.photos[0]} alt={bien.titre || "Bien"} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-[#0C1A35] truncate">{bien.titre || "Sans titre"}</p>
                            <p className="text-sm text-slate-500 truncate">
                              {bien.ville && bien.quartier ? `${bien.ville}, ${bien.quartier}` : bien.adresse || "Adresse non spécifiée"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-slate-600">
                          {bien.typeLogement?.nom || "-"}
                          {bien.typeTransaction?.nom && ` / ${bien.typeTransaction.nom}`}
                        </span>
                      </td>

                      {/* Prix */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="font-semibold text-[#0C1A35]">
                          {bien.prix ? `${bien.prix.toLocaleString("fr-FR")} F` : "-"}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <StatutBadge statut={bien.statutAnnonce} />
                          {bien.hasPendingRevision && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Révision en attente
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {Math.abs(new Date(bien.updatedAt).getTime() - new Date(bien.createdAt).getTime()) > 5000 ? (
                          <span className="text-sm text-slate-500">
                            {new Date(bien.updatedAt).toLocaleDateString("fr-FR")}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Voir — toujours disponible */}
                          <Link
                            to={`/owner/biens/${bien.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voir
                          </Link>

                          {/* BROUILLON */}
                          {bien.statutAnnonce === "BROUILLON" && (
                            <>
                              <Link
                                to={`/owner/biens/ajouter?edit=${bien.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Modifier
                              </Link>
                              <button
                                onClick={() => setDeleteTargetId(bien.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Supprimer
                              </button>
                            </>
                          )}

                          {/* EN_ATTENTE */}
                          {bien.statutAnnonce === "EN_ATTENTE" && (
                            <>
                              <button
                                onClick={() => setRetourTargetId(bien.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Annuler la soumission
                              </button>
                              <button
                                onClick={() => setAnnulerTargetId(bien.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Annuler l'annonce
                              </button>
                            </>
                          )}

                          {/* PUBLIE */}
                          {bien.statutAnnonce === "PUBLIE" && (
                            <>
                              {bien.hasPendingRevision ? (
                                <span className="text-xs text-blue-500 px-2.5 py-1.5">
                                  Révision en cours…
                                </span>
                              ) : (
                                <Link
                                  to={`/owner/biens/ajouter?edit=${bien.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  Modifier
                                </Link>
                              )}
                              <button
                                onClick={() => setRetourTargetId(bien.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Dépublier
                              </button>
                            </>
                          )}

                          {/* REJETE */}
                          {bien.statutAnnonce === "REJETE" && (
                            <>
                              <Link
                                to={`/owner/biens/ajouter?edit=${bien.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Corriger
                              </Link>
                              <button
                                onClick={() => setDeleteTargetId(bien.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      <ConfirmModal
        open={deleteTargetId !== null}
        title="Supprimer l'annonce"
        message="Cette action est irréversible. L'annonce sera définitivement supprimée."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTargetId)
            deleteMutation.mutate(deleteTargetId, {
              onSuccess: () => setDeleteTargetId(null),
              onError: () => setDeleteTargetId(null),
            });
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Modal retour brouillon / dépublier */}
      <ConfirmModal
        open={retourTargetId !== null}
        title={retourLabel}
        message={
          retourTarget?.statutAnnonce === "EN_ATTENTE"
            ? "La soumission sera annulée. L'annonce repassera en brouillon."
            : "L'annonce sera dépubliée et remise en brouillon. Elle ne sera plus visible."
        }
        confirmLabel={retourLabel}
        cancelLabel="Annuler"
        variant="warning"
        isPending={retour.isPending}
        onConfirm={() => {
          if (retourTargetId)
            retour.mutate(retourTargetId, {
              onSuccess: () => setRetourTargetId(null),
              onError: () => setRetourTargetId(null),
            });
        }}
        onCancel={() => setRetourTargetId(null)}
      />

      {/* Modal annuler l'annonce (EN_ATTENTE) */}
      <ConfirmModal
        open={annulerTargetId !== null}
        title="Annuler l'annonce"
        message="L'annonce sera définitivement annulée et retirée de la file d'attente."
        confirmLabel="Annuler l'annonce"
        cancelLabel="Retour"
        variant="danger"
        isPending={annuler.isPending}
        onConfirm={() => {
          if (annulerTargetId)
            annuler.mutate(annulerTargetId, {
              onSuccess: () => { toast.success("Annonce annulée"); setAnnulerTargetId(null); },
              onError: () => { toast.error("Erreur lors de l'annulation"); setAnnulerTargetId(null); },
            });
        }}
        onCancel={() => setAnnulerTargetId(null)}
      />
    </div>
  );
}
