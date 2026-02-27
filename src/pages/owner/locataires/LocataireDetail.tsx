import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Users,
  Baby,
  Link2,
  Copy,
  Check,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  Calendar,
  Banknote,
  Trash2,
} from "lucide-react";
import { useLocataireById, useDeleteLocataire, useGetLienActivation } from "@/hooks/useLocataire";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import type { StatutLocataire } from "@/api/locataire";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<
  StatutLocataire,
  { label: string; color: string; icon: React.ReactNode }
> = {
  INVITE: {
    label: "En attente d'activation",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ACTIF: {
    label: "Actif",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  INACTIF: {
    label: "Inactif",
    color: "bg-slate-100 text-slate-500",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const fmt = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("fr-FR") : "—";

const fmtMontant = (n?: number | null) =>
  n != null ? `${n.toLocaleString("fr-FR")} FCFA` : "—";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: locataire, isLoading } = useLocataireById(id!);
  const deleteLocataire = useDeleteLocataire();
  const getLien = useGetLienActivation();
  const [lien, setLien] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleGetLien = async () => {
    try {
      const result = await getLien.mutateAsync(id!);
      setLien(result.lien);
    } catch {
      toast.error("Erreur lors de la récupération du lien");
    }
  };

  const handleCopy = () => {
    if (!lien) return;
    navigator.clipboard.writeText(lien);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await deleteLocataire.mutateAsync(id!);
      toast.success("Locataire supprimé");
      navigate("/owner/locataires");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la suppression";
      toast.error(msg);
    } finally {
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (!locataire) {
    return (
      <div className="text-center py-20 text-slate-400">Locataire introuvable</div>
    );
  }

  const cfg = STATUT_CONFIG[locataire.statut];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/owner/locataires")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-full bg-[#0C1A35] flex items-center justify-center font-bold text-white">
            {locataire.prenom[0]}{locataire.nom[0]}
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-[#0C1A35]">
              {locataire.prenom} {locataire.nom}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 border border-red-100 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Lien d'activation */}
      {locataire.statut === "INVITE" && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-sm">
                Lien d'activation
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Partagez ce lien avec le locataire pour qu'il active son espace.
              </p>
              {lien ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={lien}
                    readOnly
                    className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-slate-700 min-w-0 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A843] text-white rounded-lg text-xs font-medium hover:bg-[#c49a3a] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copié" : "Copier"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGetLien}
                  disabled={getLien.isPending}
                  className="mt-3 px-4 py-1.5 bg-[#D4A843] text-white rounded-lg text-xs font-medium hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
                >
                  {getLien.isPending ? "Génération..." : "Générer le lien"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Infos de base */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Informations de base
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-300" />
              {locataire.telephone}
            </div>
            {locataire.email && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-300" />
                {locataire.email}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-slate-300" />
              {locataire.nbOccupants} occupant
              {locataire.nbOccupants > 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Baby className="w-4 h-4 text-slate-300" />
              Enfants :{" "}
              <span
                className={
                  locataire.presenceEnfants
                    ? "text-green-600 font-medium"
                    : "text-slate-400"
                }
              >
                {locataire.presenceEnfants ? "Oui" : "Non"}
              </span>
            </div>
          </div>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Identité
            {locataire.statut === "INVITE" && (
              <span className="normal-case text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium tracking-normal">
                À compléter
              </span>
            )}
          </h2>
          {locataire.statut === "INVITE" ? (
            <p className="text-sm text-slate-400 italic">
              Le locataire doit activer son compte pour renseigner ces informations.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <Row label="Date de naissance" value={fmt(locataire.dateNaissance)} />
              <Row label="Lieu de naissance" value={locataire.lieuNaissance} />
              <Row label="Nationalité" value={locataire.nationalite} />
              <Row label="Sexe" value={locataire.sexe} />
              <Row
                label="Pièce d'identité"
                value={
                  locataire.typePiece
                    ? `${locataire.typePiece} — ${locataire.numPieceIdentite ?? "—"}`
                    : undefined
                }
              />
              <Row label="Délivrée le" value={fmt(locataire.dateDelivrance)} />
              <Row label="Expire le" value={fmt(locataire.dateExpiration)} />
              <Row label="Autorité de délivrance" value={locataire.autoriteDelivrance} />
              <Row label="Situation professionnelle" value={locataire.situationProfessionnelle} />
            </div>
          )}
        </div>
      </div>

      {/* Baux */}
      {locataire.bails && locataire.bails.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <Home className="w-3.5 h-3.5" />
            Baux ({locataire.bails.length})
          </h2>
          <div className="space-y-3">
            {locataire.bails.map((bail) => (
              <div
                key={bail.id}
                className={`rounded-xl p-4 text-sm border ${
                  bail.statut === "ACTIF"
                    ? "border-green-100 bg-green-50/50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/owner/biens/${bail.bien?.id}`}
                    className="font-medium text-[#0C1A35] hover:text-[#D4A843] transition-colors"
                  >
                    {bail.bien?.titre || bail.bien?.ville || "Bien"}
                  </Link>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      bail.statut === "ACTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {bail.statut === "ACTIF"
                      ? "Actif"
                      : bail.statut === "TERMINE"
                      ? "Terminé"
                      : "Résilié"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Du {fmt(bail.dateDebutBail)}
                    {bail.dateFinBail ? ` au ${fmt(bail.dateFinBail)}` : " (indéterminé)"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    {fmtMontant(bail.montantLoyer)} / mois
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={confirmDelete}
        title="Supprimer ce locataire ?"
        message="La fiche sera définitivement supprimée. Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isPending={deleteLocataire.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

const Row = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex justify-between gap-2">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-700 font-medium text-right">{value || "—"}</span>
  </div>
);
