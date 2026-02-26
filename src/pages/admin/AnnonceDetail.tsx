import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Ruler,
  BedDouble,
  Bath,
  Sofa,
  UtensilsCrossed,
  Toilet,
  Layers,
  BadgeCheck,
  Cigarette,
  PawPrint,
  ParkingSquare,
  ArrowUpDown,
  Banknote,
  Calendar,
  Info,
  Image,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useBienById } from "@/hooks/useBien";
import { useValiderAnnonce, useDeleteAnnonceAdmin } from "@/hooks/useAnnonces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StatutAnnonce, Bien, BienPendingRevision } from "@/api/bien";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUT_STYLE: Record<
  StatutAnnonce,
  { bg: string; text: string; icon: React.ElementType; label: string }
> = {
  EN_ATTENTE: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock,        label: "En attente" },
  PUBLIE:     { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle,  label: "Publié" },
  REJETE:     { bg: "bg-red-100",    text: "text-red-700",    icon: XCircle,      label: "Rejeté" },
  BROUILLON:  { bg: "bg-slate-100",  text: "text-slate-600",  icon: Building2,    label: "Brouillon" },
  ANNULE:     { bg: "bg-gray-100",   text: "text-gray-600",   icon: XCircle,      label: "Annulé" },
};

function StatutBadge({ statut }: { statut: StatutAnnonce }) {
  const { bg, text, icon: Icon, label } = STATUT_STYLE[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 w-36 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-[#0C1A35]">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Modal rejet (EN_ATTENTE) ─────────────────────────────────────────────────

function RejetModal({
  titre,
  isPending,
  onConfirm,
  onCancel,
  isRevision = false,
}: {
  titre: string;
  isPending: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
  isRevision?: boolean;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm"
        onClick={!isPending ? onCancel : undefined}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#0C1A35]">
          {isRevision ? "Rejeter la révision" : "Rejeter l'annonce"}
        </h2>
        <p className="text-sm text-slate-500">
          {isRevision ? (
            <>
              Vous allez rejeter la révision soumise pour{" "}
              <span className="font-semibold text-[#0C1A35]">« {titre} »</span>. L'annonce
              actuelle restera publiée et le propriétaire sera informé du motif.
            </>
          ) : (
            <>
              Vous êtes sur le point de rejeter{" "}
              <span className="font-semibold text-[#0C1A35]">« {titre} »</span>. Le motif
              sera transmis au propriétaire pour qu'il puisse corriger et resoumettre.
            </>
          )}
        </p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">
            Justificatif de rejet <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            placeholder="Décrivez précisément le ou les motifs de rejet (photos insuffisantes, informations manquantes, prix incorrect, etc.)…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm
              outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none"
            autoFocus
          />
          {note.trim().length > 0 && note.trim().length < 10 && (
            <p className="text-xs text-red-500">Le justificatif doit faire au moins 10 caractères.</p>
          )}
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isPending || note.trim().length < 10}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm
              font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal générique avec justificatif (PUBLIE : révision / suppression) ──────

function JustificatifModal({
  title,
  description,
  confirmLabel,
  confirmClass,
  isPending,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  isPending: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm"
        onClick={!isPending ? onCancel : undefined}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#0C1A35]">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">
            Justificatif <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Précisez la raison de cette action…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm
              outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none"
            autoFocus
          />
          {note.trim().length > 0 && note.trim().length < 10 && (
            <p className="text-xs text-red-500">Le justificatif doit faire au moins 10 caractères.</p>
          )}
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isPending || note.trim().length < 10}
            className={`flex-1 h-10 rounded-xl text-white text-sm font-semibold shadow-sm transition-all
              disabled:opacity-50 flex items-center justify-center gap-2 ${confirmClass}`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section révision en attente ─────────────────────────────────────────────

function RevisionSection({ bien, rev }: { bien: Bien; rev: BienPendingRevision }) {
  type ChangeItem = { label: string; old: string; cur: string };

  const fmt = (v: unknown, suffix = ""): string => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "boolean") return v ? "Oui" : "Non";
    if (typeof v === "number") return `${v.toLocaleString("fr-FR")}${suffix}`;
    return String(v);
  };

  const changes: ChangeItem[] = [];

  const add = (label: string, oldVal: unknown, newVal: unknown, suffix = "") => {
    if (newVal === undefined) return;
    const o = fmt(oldVal, suffix);
    const n = fmt(newVal, suffix);
    if (o !== n) changes.push({ label, old: o, cur: n });
  };

  add("Titre", bien.titre, rev.titre);
  add("Prix", bien.prix, rev.prix, " F");
  add("Fréquence paiement", bien.frequencePaiement, rev.frequencePaiement);
  add("Caution", bien.caution, rev.caution, " F");
  add("Charges incluses", bien.chargesIncluses, rev.chargesIncluses);
  add(
    "Disponible le",
    bien.disponibleLe ? new Date(bien.disponibleLe).toLocaleDateString("fr-FR") : null,
    rev.disponibleLe !== undefined
      ? rev.disponibleLe
        ? new Date(rev.disponibleLe).toLocaleDateString("fr-FR")
        : null
      : undefined,
  );
  add("Surface", bien.surface, rev.surface, " m²");
  add("Chambres", bien.nbChambres, rev.nbChambres);
  add("Salles de bain", bien.nbSdb, rev.nbSdb);
  add("Salons", bien.nbSalons, rev.nbSalons);
  add("Cuisines", bien.nbCuisines, rev.nbCuisines);
  add("WC", bien.nbWc, rev.nbWc);
  add("Étage", bien.etage, rev.etage);
  add("Nb étages", bien.nbEtages, rev.nbEtages);
  add("Meublé", bien.meuble, rev.meuble);
  add("Fumeurs", bien.fumeurs, rev.fumeurs);
  add("Animaux", bien.animaux, rev.animaux);
  add("Parking", bien.parking, rev.parking);
  add("Ascenseur", bien.ascenseur, rev.ascenseur);
  add("Type de logement", bien.typeLogement?.nom, rev.typeLogement?.nom);
  add("Type de transaction", bien.typeTransaction?.nom, rev.typeTransaction?.nom);
  add("Statut du bien", bien.statutBien?.nom, rev.statutBien?.nom);
  add("Pays", bien.pays, rev.pays);
  add("Région", bien.region, rev.region);
  add("Ville", bien.ville, rev.ville);
  add("Quartier", bien.quartier, rev.quartier);
  add("Adresse", bien.adresse, rev.adresse);

  if (rev.description !== undefined && rev.description !== bien.description) {
    const trim = (s: string | null | undefined) =>
      s ? s.slice(0, 80) + (s.length > 80 ? "…" : "") : "—";
    changes.push({ label: "Description", old: trim(bien.description), cur: trim(rev.description) });
  }

  if (rev.photos !== undefined) {
    const oldCount = (bien.photos ?? []).length;
    const newCount = rev.photos.length;
    if (oldCount !== newCount)
      changes.push({ label: "Photos", old: `${oldCount} photo(s)`, cur: `${newCount} photo(s)` });
  }

  if (rev.equipementIds !== undefined) {
    const oldCount = (bien.equipements ?? []).length;
    const newCount = rev.equipementIds.length;
    if (oldCount !== newCount)
      changes.push({ label: "Équipements", old: `${oldCount} équipement(s)`, cur: `${newCount} équipement(s)` });
  }

  if (rev.meubles !== undefined) {
    const oldCount = (bien.meubles ?? []).length;
    const newCount = rev.meubles.length;
    if (oldCount !== newCount)
      changes.push({ label: "Mobilier", old: `${oldCount} meuble(s)`, cur: `${newCount} meuble(s)` });
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
        <p className="text-sm font-semibold text-blue-700">
          Révision soumise par le propriétaire
          {changes.length > 0 &&
            ` — ${changes.length} modification${changes.length > 1 ? "s" : ""} proposée${changes.length > 1 ? "s" : ""}`}
        </p>
      </div>
      {changes.length === 0 ? (
        <p className="text-xs text-blue-600">Aucune différence détectée par rapport à la version publiée.</p>
      ) : (
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden text-xs">
          <div className="grid grid-cols-[7rem_1fr_1.5rem_1fr] gap-x-3 px-4 py-2 bg-slate-50 border-b border-blue-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Champ</span>
            <span>Version actuelle</span>
            <span />
            <span>Version proposée</span>
          </div>
          {changes.map(({ label, old, cur }) => (
            <div
              key={label}
              className="grid grid-cols-[7rem_1fr_1.5rem_1fr] gap-x-3 items-start px-4 py-2.5 border-b border-slate-50 last:border-0"
            >
              <span className="text-slate-500 font-medium">{label}</span>
              <span className="text-slate-400 line-through break-all">{old}</span>
              <span className="text-slate-400 text-center">→</span>
              <span className="text-blue-700 font-semibold break-all">{cur}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AnnonceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bien, isLoading, isError } = useBienById(id ?? "");
  const valider = useValiderAnnonce();
  const deleteAdmin = useDeleteAnnonceAdmin();

  const [showRejetModal, setShowRejetModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleApprouver = () => {
    if (!bien) return;
    const isRev = bien.hasPendingRevision === true;
    valider.mutate(
      { id: bien.id, action: "APPROUVER" },
      {
        onSuccess: () => {
          toast.success(isRev ? "Révision validée et publiée" : "Annonce approuvée et publiée");
          navigate("/admin/annonces");
        },
        onError: () => toast.error("Erreur lors de l'approbation"),
      }
    );
  };

  const handleRejeter = (note: string) => {
    if (!bien) return;
    const isRev = bien.hasPendingRevision === true;
    valider.mutate(
      { id: bien.id, action: "REJETER", note },
      {
        onSuccess: () => {
          toast.success(isRev ? "Révision rejetée — l'annonce reste publiée" : "Annonce rejetée");
          navigate("/admin/annonces");
        },
        onError: () => toast.error("Erreur lors du rejet"),
      }
    );
  };

  const handleRevision = (note: string) => {
    if (!bien) return;
    valider.mutate(
      { id: bien.id, action: "REVISION", note },
      {
        onSuccess: () => { toast.success("Annonce remise en révision"); navigate("/admin/annonces"); },
        onError: () => { toast.error("Erreur lors de la mise en révision"); setShowRevisionModal(false); },
      }
    );
  };

  const handleDelete = (_note?: string) => {
    if (!bien) return;
    deleteAdmin.mutate(bien.id, {
      onSuccess: () => { toast.success("Annonce supprimée"); navigate("/admin/annonces"); },
      onError: () => { toast.error("Erreur lors de la suppression"); setShowDeleteModal(false); },
    });
  };

  // ─── États de chargement ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (isError || !bien) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Annonce introuvable.</p>
        <Link to="/admin/annonces" className="text-[#D4A843] text-sm font-medium mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const photos = bien.photos ?? [];
  const isEnAttente = bien.statutAnnonce === "EN_ATTENTE";
  const isPublie = bien.statutAnnonce === "PUBLIE";
  const isRejete = bien.statutAnnonce === "REJETE";
  const isPendingRevision = isPublie && bien.hasPendingRevision === true;
  const rev = bien.pendingRevision;

  const options = [
    { label: "Meublé",    value: bien.meuble,    icon: Sofa },
    { label: "Fumeurs",   value: bien.fumeurs,   icon: Cigarette },
    { label: "Animaux",   value: bien.animaux,   icon: PawPrint },
    { label: "Parking",   value: bien.parking,   icon: ParkingSquare },
    { label: "Ascenseur", value: bien.ascenseur, icon: ArrowUpDown },
  ].filter((o) => o.value);

  const caracteristiques = [
    { icon: Ruler,           label: "Surface",       value: bien.surface ? `${bien.surface} m²` : null },
    { icon: BedDouble,       label: "Chambres",      value: bien.nbChambres },
    { icon: Bath,            label: "Salles de bain",value: bien.nbSdb },
    { icon: Sofa,            label: "Salons",        value: bien.nbSalons },
    { icon: UtensilsCrossed, label: "Cuisines",      value: bien.nbCuisines },
    { icon: Toilet,          label: "WC",            value: bien.nbWc },
    { icon: Layers,          label: "Étage",         value: bien.etage },
    { icon: Layers,          label: "Nb étages",     value: bien.nbEtages },
  ].filter((c) => c.value !== null && c.value !== undefined);

  const hasEquipements = bien.equipements && bien.equipements.length > 0;
  const hasMeubles = bien.meubles && bien.meubles.length > 0;
  const defaultTab = hasEquipements ? "equipements" : hasMeubles ? "mobilier" : "equipements";

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/annonces"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
              text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Modération
            </div>
            <h1 className="font-display text-xl font-bold text-[#0C1A35] truncate">
              {bien.titre || "Annonce sans titre"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <StatutBadge statut={bien.statutAnnonce} />
          {isPendingRevision && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <RefreshCw className="w-3 h-3" />
              Révision en attente
            </span>
          )}
          {(isEnAttente || isPendingRevision) && (
            <>
              <button
                onClick={handleApprouver}
                disabled={valider.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all disabled:opacity-50"
              >
                {valider.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isPendingRevision ? "Valider la révision" : "Approuver"}
              </button>
              <button
                onClick={() => setShowRejetModal(true)}
                disabled={valider.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {isPendingRevision ? "Rejeter la révision" : "Rejeter"}
              </button>
            </>
          )}
          {isPublie && !isPendingRevision && (
            <>
              <button
                onClick={() => setShowRevisionModal(true)}
                disabled={valider.isPending || deleteAdmin.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Mettre en révision
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={valider.isPending || deleteAdmin.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </>
          )}
          {isRejete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteAdmin.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
            >
              {deleteAdmin.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Note de rejet (si rejeté) */}
      {isRejete && bien.noteAdmin && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Justificatif de rejet transmis au propriétaire :</p>
            <p>{bien.noteAdmin}</p>
          </div>
        </div>
      )}

      {/* Révision en attente */}
      {isPendingRevision && rev && <RevisionSection bien={bien} rev={rev} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Galerie photos */}
          <Section title="Photos">
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 bg-slate-50 rounded-xl text-slate-300">
                <Image className="w-10 h-10 mb-2" />
                <p className="text-sm">Aucune photo</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video">
                  <img
                    src={photos[photoIndex]}
                    alt={`Photo ${photoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {photoIndex + 1} / {photos.length}
                  </span>
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          i === photoIndex ? "border-[#D4A843]" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Miniature ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Description */}
          {bien.description && (
            <Section title="Description">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {bien.description}
              </p>
            </Section>
          )}

          {/* Caractéristiques — scroll horizontal avec flèches */}
          {caracteristiques.length > 0 && (
            <Section title="Caractéristiques">
              <div className="relative">
                <button
                  onClick={() => {
                    const el = document.getElementById("admin-carac-scroll");
                    if (el) el.scrollBy({ left: -260, behavior: "smooth" });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full
                    bg-white shadow-lg flex items-center justify-center text-slate-600
                    hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("admin-carac-scroll");
                    if (el) el.scrollBy({ left: 260, behavior: "smooth" });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full
                    bg-white shadow-lg flex items-center justify-center text-slate-600
                    hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div
                  id="admin-carac-scroll"
                  className="flex gap-3 overflow-x-auto px-8 py-1 -my-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
                >
                  <style>{`#admin-carac-scroll::-webkit-scrollbar { display: none; }`}</style>
                  {caracteristiques.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 shrink-0 min-w-[140px]">
                      <Icon className="w-5 h-5 text-[#D4A843] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{label}</p>
                        <p className="text-sm font-semibold text-[#0C1A35]">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {options.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {options.map(({ label, icon: Icon }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#D4A843]/10 text-[#D4A843]"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Équipements & Mobilier — onglets */}
          {(hasEquipements || hasMeubles) && (
            <Section title="Informations supplémentaires">
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="w-full justify-start bg-slate-50 p-1 rounded-xl h-auto">
                  <TabsTrigger
                    value="equipements"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Équipements
                  </TabsTrigger>
                  <TabsTrigger
                    value="mobilier"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Sofa className="w-4 h-4" />
                    Mobilier
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="equipements" className="mt-4">
                  {hasEquipements ? (
                    <div className="flex flex-wrap gap-2">
                      {bien.equipements!.map((e) => (
                        <span
                          key={e.equipementId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                        >
                          <BadgeCheck className="w-3 h-3 text-slate-400" />
                          {e.equipement.nom}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucun équipement renseigné pour ce bien
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="mobilier" className="mt-4">
                  {hasMeubles ? (
                    <div className="flex flex-wrap gap-2">
                      {bien.meubles!.map((m) => (
                        <span
                          key={m.meubleId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                        >
                          <Sofa className="w-3 h-3 text-slate-400" />
                          {m.meuble.nom} × {m.quantite}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucun mobilier renseigné pour ce bien
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </Section>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Propriétaire */}
          {bien.proprietaire && (
            <Section title="Propriétaire">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#0C1A35] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">
                    {bien.proprietaire.prenom?.[0]?.toUpperCase() ?? "P"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#0C1A35] text-sm">
                    {bien.proprietaire.prenom} {bien.proprietaire.nom}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <a
                  href={`tel:${bien.proprietaire.telephone}`}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0C1A35] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {bien.proprietaire.telephone}
                </a>
                {bien.proprietaire.email && (
                  <a
                    href={`mailto:${bien.proprietaire.email}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0C1A35] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {bien.proprietaire.email}
                  </a>
                )}
              </div>
            </Section>
          )}

          {/* Localisation */}
          <Section title="Localisation">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D4A843] mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600">
                {[bien.adresse, bien.quartier, bien.ville, bien.region, bien.pays]
                  .filter(Boolean)
                  .join(", ") || "Non spécifiée"}
              </p>
            </div>
          </Section>

          {/* Classification */}
          <Section title="Classification">
            <InfoRow label="Type de logement"    value={bien.typeLogement?.nom} />
            <InfoRow label="Type de transaction" value={bien.typeTransaction?.nom} />
            <InfoRow label="Statut du bien"      value={bien.statutBien?.nom} />
          </Section>

          {/* Tarifs */}
          <Section title="Tarifs">
            <div className="space-y-3">
              {bien.prix && (
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#D4A843]" />
                  <div>
                    <p className="text-lg font-bold text-[#0C1A35]">
                      {bien.prix.toLocaleString("fr-FR")} F
                    </p>
                    {bien.frequencePaiement && (
                      <p className="text-xs text-slate-400">{bien.frequencePaiement}</p>
                    )}
                  </div>
                </div>
              )}
              <InfoRow label="Caution"          value={bien.caution ? `${bien.caution.toLocaleString("fr-FR")} F` : null} />
              <InfoRow label="Charges incluses" value={bien.chargesIncluses ? "Oui" : "Non"} />
              {bien.disponibleLe && (
                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    Disponible le{" "}
                    {new Date(bien.disponibleLe).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Dates */}
          <Section title="Dates">
            <InfoRow
              label="Créé le"
              value={new Date(bien.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            />
            <InfoRow
              label="Soumis le"
              value={new Date(bien.updatedAt).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            />
          </Section>
        </div>
      </div>

      {/* Barre d'actions fixe en bas */}
      {(isEnAttente || isPublie || isRejete) && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 -mx-6 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isEnAttente && "Cette annonce est en attente de modération."}
            {isPendingRevision && "Une révision de cette annonce est en attente de validation."}
            {isPublie && !isPendingRevision && "Cette annonce est publiée."}
            {isRejete && "Cette annonce a été rejetée."}
          </p>
          <div className="flex gap-3">
            {isEnAttente && (
              <>
                <button
                  onClick={() => setShowRejetModal(true)}
                  disabled={valider.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
                <button
                  onClick={handleApprouver}
                  disabled={valider.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {valider.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approuver et publier
                </button>
              </>
            )}
            {isPendingRevision && (
              <>
                <button
                  onClick={() => setShowRejetModal(true)}
                  disabled={valider.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter la révision
                </button>
                <button
                  onClick={handleApprouver}
                  disabled={valider.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {valider.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Valider la révision
                </button>
              </>
            )}
            {isPublie && !isPendingRevision && (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={valider.isPending || deleteAdmin.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
                <button
                  onClick={() => setShowRevisionModal(true)}
                  disabled={valider.isPending || deleteAdmin.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {valider.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Mettre en révision
                </button>
              </>
            )}
            {isRejete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteAdmin.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
              >
                {deleteAdmin.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer définitivement
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal rejet (EN_ATTENTE ou révision) */}
      {showRejetModal && (
        <RejetModal
          titre={bien.titre || "Sans titre"}
          isPending={valider.isPending}
          onConfirm={handleRejeter}
          onCancel={() => !valider.isPending && setShowRejetModal(false)}
          isRevision={isPendingRevision}
        />
      )}

      {/* Modal mise en révision (PUBLIE) */}
      {showRevisionModal && (
        <JustificatifModal
          title="Mettre en révision"
          description={`L'annonce « ${bien.titre || "cette annonce"} » sera remise en attente. Le propriétaire pourra la modifier et la resoumettre. Indiquez la raison.`}
          confirmLabel="Confirmer la révision"
          confirmClass="bg-amber-500 hover:bg-amber-600"
          isPending={valider.isPending}
          onConfirm={handleRevision}
          onCancel={() => !valider.isPending && setShowRevisionModal(false)}
        />
      )}

      {/* Modal suppression avec justificatif (PUBLIE) ou simple confirmation (REJETE) */}
      {showDeleteModal && isPublie && (
        <JustificatifModal
          title="Supprimer l'annonce"
          description={`Vous êtes sur le point de supprimer définitivement « ${bien.titre || "cette annonce"} ». Cette action est irréversible. Indiquez le motif.`}
          confirmLabel="Supprimer définitivement"
          confirmClass="bg-red-500 hover:bg-red-600"
          isPending={deleteAdmin.isPending}
          onConfirm={handleDelete}
          onCancel={() => !deleteAdmin.isPending && setShowDeleteModal(false)}
        />
      )}
      {showDeleteModal && isRejete && (
        <JustificatifModal
          title="Supprimer l'annonce rejetée"
          description={`Vous êtes sur le point de supprimer définitivement « ${bien.titre || "cette annonce"} ». Cette action est irréversible.`}
          confirmLabel="Supprimer définitivement"
          confirmClass="bg-red-500 hover:bg-red-600"
          isPending={deleteAdmin.isPending}
          onConfirm={handleDelete}
          onCancel={() => !deleteAdmin.isPending && setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
