import { useMemo, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
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
  Shield,
  Search,
  X,
} from "lucide-react";
import { useLocataires, useDeleteLocataire, usePendingVerificationsCount } from "@/hooks/useLocataire";
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
  const cfg = STATUT_CONFIG[statut] ?? { label: statut, color: "bg-slate-100 text-slate-500", icon: <XCircle className="w-3 h-3" /> };
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
  const { data: pendingData } = usePendingVerificationsCount();
  const pendingCount = pendingData?.count ?? 0;
  const deleteLocataire = useDeleteLocataire();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<StatutLocataire | "TOUS">("TOUS");

  const filtered = useMemo(() => {
    let result = filterStatut === "TOUS" ? locataires : locataires.filter((l) => l.statut === filterStatut);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.prenom.toLowerCase().includes(q) ||
        l.nom.toLowerCase().includes(q) ||
        l.telephone.includes(q) ||
        l.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [locataires, filterStatut, search]);

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
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Locataires" }]} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843]">
            <Users className="w-3.5 h-3.5" />
            Locataires
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </div>
          {locataires.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {locataires.length} locataire{locataires.length !== 1 ? "s" : ""}
              {pendingCount > 0 && (
                <span className="ml-2 text-amber-600">
                  • {pendingCount} vérification{pendingCount !== 1 ? "s" : ""} en attente
                </span>
              )}
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

      {/* Barre de recherche + filtres statut */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email…"
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#D4A843] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(["TOUS", "ACTIF", "INVITE", "INACTIF"] as const).map((s) => {
            const cfg = s !== "TOUS" ? STATUT_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatut(s)}
                className={`h-10 px-3 rounded-xl text-xs font-medium transition-colors ${
                  filterStatut === s
                    ? "bg-[#0C1A35] text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s === "TOUS" ? `Tous (${locataires.length})` : `${cfg!.label} (${locataires.filter(l => l.statut === s).length})`}
              </button>
            );
          })}
        </div>
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm text-slate-400">Aucun locataire ne correspond à votre recherche.</p>
          <button onClick={() => { setSearch(""); setFilterStatut("TOUS"); }} className="mt-3 text-xs text-[#D4A843] underline underline-offset-2">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((loc) => {
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
