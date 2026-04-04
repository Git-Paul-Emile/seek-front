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
  Search,
  X,
  AlertTriangle,
  Archive,
} from "lucide-react";
import { useLocataires, useDeleteLocataire, usePendingVerificationsCount } from "@/hooks/useLocataire";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import type { BailResume } from "@/api/locataire";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUTS_BAIL_ACTIFS = ["ACTIF", "EN_PREAVIS", "EN_RENOUVELLEMENT", "EN_ATTENTE"] as const;
const STATUTS_BAIL_ANCIENS = ["TERMINE", "RESILIE", "ARCHIVE"] as const;

const BAIL_STATUT_CFG: Record<
  string,
  { label: string; color: string }
> = {
  ACTIF:             { label: "Actif",              color: "bg-green-100 text-green-700" },
  EN_PREAVIS:        { label: "En préavis",          color: "bg-orange-100 text-orange-700" },
  EN_RENOUVELLEMENT: { label: "En renouvellement",   color: "bg-blue-100 text-blue-700" },
  EN_ATTENTE:        { label: "En attente",           color: "bg-amber-100 text-amber-700" },
  TERMINE:           { label: "Terminé",              color: "bg-slate-100 text-slate-500" },
  RESILIE:           { label: "Résilié",              color: "bg-red-100 text-red-600" },
  ARCHIVE:           { label: "Archivé",              color: "bg-slate-100 text-slate-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBailActif = (bails?: BailResume[]) =>
  bails?.find((b) => (STATUTS_BAIL_ACTIFS as readonly string[]).includes(b.statut));

const getBailAncien = (bails?: BailResume[]) =>
  bails?.find((b) => (STATUTS_BAIL_ANCIENS as readonly string[]).includes(b.statut));

const isAncienLocataire = (bails?: BailResume[]) =>
  !getBailActif(bails) && !!getBailAncien(bails);

const isActifLocataire = (bails?: BailResume[]) =>
  !!getBailActif(bails);

const BailStatutBadge = ({ statut }: { statut: string }) => {
  const cfg = BAIL_STATUT_CFG[statut] ?? { label: statut, color: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>
      {statut === "EN_PREAVIS" && <AlertTriangle className="w-2.5 h-2.5" />}
      {cfg.label}
    </span>
  );
};

type ViewTab = "ACTIFS" | "ANCIENS" | "INVITE" | "TOUS";

const LOCATAIRE_STATUT_ICON: Record<string, React.ReactNode> = {
  INVITE:  <Clock className="w-3 h-3" />,
  ACTIF:   <CheckCircle className="w-3 h-3" />,
  INACTIF: <XCircle className="w-3 h-3" />,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocatairesList() {
  const { data: locataires = [], isLoading } = useLocataires();
  const { data: pendingData } = usePendingVerificationsCount();
  const pendingCount = pendingData?.count ?? 0;
  const deleteLocataire = useDeleteLocataire();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ViewTab>("ACTIFS");

  // Dériver les groupes
  const actifs  = useMemo(() => locataires.filter((l) => isActifLocataire(l.bails)), [locataires]);
  const anciens  = useMemo(() => locataires.filter((l) => isAncienLocataire(l.bails)), [locataires]);
  const invites  = useMemo(() => locataires.filter((l) => !isActifLocataire(l.bails) && !isAncienLocataire(l.bails)), [locataires]);

  const baseList = useMemo(() => {
    switch (tab) {
      case "ACTIFS":  return actifs;
      case "ANCIENS": return anciens;
      case "INVITE":  return invites;
      default:        return locataires;
    }
  }, [tab, actifs, anciens, invites, locataires]);

  const filtered = useMemo(() => {
    if (!search.trim()) return baseList;
    const q = search.toLowerCase();
    return baseList.filter(
      (l) =>
        l.prenom.toLowerCase().includes(q) ||
        l.nom.toLowerCase().includes(q) ||
        l.telephone.includes(q) ||
        l.email?.toLowerCase().includes(q)
    );
  }, [baseList, search]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLocataire.mutateAsync(id);
      toast.success("Locataire supprimé");
    } catch (err: unknown) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmId(null);
    }
  };

  const tabs: { key: ViewTab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "ACTIFS",  label: "Actifs",          count: actifs.length,  icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { key: "INVITE",  label: "Sans bail",        count: invites.length, icon: <Clock className="w-3.5 h-3.5" /> },
    { key: "ANCIENS", label: "Anciens",          count: anciens.length, icon: <Archive className="w-3.5 h-3.5" /> },
    { key: "TOUS",    label: "Tous",             count: locataires.length, icon: <Users className="w-3.5 h-3.5" /> },
  ];

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

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-[#0C1A35] text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              tab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
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
          <h3 className="text-base font-semibold text-[#0C1A35] mb-1">Aucun locataire</h3>
          <p className="text-sm text-slate-400 mb-5">Ajoutez votre premier locataire pour commencer</p>
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
          <p className="text-sm text-slate-400">
            {search ? "Aucun locataire ne correspond à votre recherche." : "Aucun locataire dans cette catégorie."}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="mt-3 text-xs text-[#D4A843] underline underline-offset-2">
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {tab === "ANCIENS" && (
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
              <Archive className="w-3.5 h-3.5" />
              Anciens locataires — bail terminé ou résilié
            </div>
          )}
          <div className="divide-y divide-slate-100">
            {filtered.map((loc) => {
              const bailActif = getBailActif(loc.bails);
              const bailAncien = !bailActif ? getBailAncien(loc.bails) : undefined;
              const bailAffiché = bailActif ?? bailAncien;
              const isAncien = !bailActif && !!bailAncien;

              return (
                <div
                  key={loc.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${isAncien ? "opacity-80" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0 ${isAncien ? "bg-slate-400" : "bg-[#0C1A35]"}`}>
                    {loc.prenom[0]}{loc.nom[0]}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#0C1A35] text-sm">
                        {loc.prenom} {loc.nom}
                      </span>
                      {/* Statut compte */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        loc.statut === "INVITE" ? "bg-amber-100 text-amber-700" :
                        loc.statut === "ACTIF"  ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {LOCATAIRE_STATUT_ICON[loc.statut]}
                        {loc.statut === "INVITE" ? "En attente" : loc.statut === "ACTIF" ? "Compte actif" : "Inactif"}
                      </span>
                      {/* Statut bail */}
                      {bailAffiché && <BailStatutBadge statut={bailAffiché.statut} />}
                    </div>

                    <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                      <a
                        href={`tel:${loc.telephone}`}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#D4A843] transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        {loc.telephone}
                      </a>
                      {loc.email && (
                        <a
                          href={`mailto:${loc.email}`}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#D4A843] transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {loc.email}
                        </a>
                      )}
                      {bailAffiché?.bien && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isAncien ? "text-slate-400" : "text-[#D4A843]"}`}>
                          <Home className="w-3 h-3" />
                          {bailAffiché.bien.titre || bailAffiché.bien.ville || "Bien loué"}
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
        onConfirm={() => { if (confirmId) handleDelete(confirmId); }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
