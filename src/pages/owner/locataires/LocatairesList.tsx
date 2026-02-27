import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Home,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useLocataires, useDeleteLocataire } from "@/hooks/useLocataire";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import type { StatutLocataire } from "@/api/locataire";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<
  StatutLocataire,
  { label: string; color: string; icon: React.ReactNode }
> = {
  INVITE: {
    label: "En attente",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="w-3 h-3" />,
  },
  ACTIF: {
    label: "Actif",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  INACTIF: {
    label: "Inactif",
    color: "bg-slate-100 text-slate-500",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const StatutBadge = ({ statut }: { statut: StatutLocataire }) => {
  const cfg = STATUT_CONFIG[statut];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocatairesList() {
  const { data: locataires = [], isLoading } = useLocataires();
  const deleteLocataire = useDeleteLocataire();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteLocataire.mutateAsync(id);
      toast.success("Locataire supprimé");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la suppression";
      toast.error(msg);
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843]">
            <Users className="w-3.5 h-3.5" />
            Locataires
          </div>
          {locataires.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {locataires.length} locataire{locataires.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          to="/owner/locataires/ajouter"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un locataire
        </Link>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : locataires.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-[#0C1A35] mb-1">
            Aucun locataire
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            Ajoutez votre premier locataire pour commencer
          </p>
          <Link
            to="/owner/locataires/ajouter"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un locataire
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {locataires.map((loc) => {
              const bailActif = loc.bails?.find((b) => b.statut === "ACTIF");
              return (
                <div
                  key={loc.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#0C1A35] flex items-center justify-center font-semibold text-sm text-white shrink-0">
                    {loc.prenom[0]}{loc.nom[0]}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#0C1A35] text-sm">
                        {loc.prenom} {loc.nom}
                      </span>
                      <StatutBadge statut={loc.statut} />
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone className="w-3 h-3" />
                        {loc.telephone}
                      </span>
                      {loc.email && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail className="w-3 h-3" />
                          {loc.email}
                        </span>
                      )}
                      {bailActif && (
                        <span className="flex items-center gap-1 text-xs text-[#D4A843] font-medium">
                          <Home className="w-3 h-3" />
                          {bailActif.bien?.titre || bailActif.bien?.ville || "Bien loué"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmId(loc.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to={`/owner/locataires/${loc.id}`}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#0C1A35] font-medium transition-colors"
                    >
                      Voir
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={confirmId !== null}
        title="Supprimer ce locataire ?"
        message="La fiche sera définitivement supprimée. Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isPending={deleteLocataire.isPending}
        onConfirm={() => {
          if (confirmId) handleDelete(confirmId);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
