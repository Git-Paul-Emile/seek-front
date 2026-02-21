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
} from "lucide-react";
import { toast } from "sonner";
import { useBienById } from "@/hooks/useBien";
import { useValiderAnnonce, useDeleteAnnonceAdmin } from "@/hooks/useAnnonces";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { StatutAnnonce } from "@/api/bien";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUT_STYLE: Record<
  StatutAnnonce,
  { bg: string; text: string; icon: React.ElementType; label: string }
> = {
  EN_ATTENTE: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "En attente" },
  PUBLIE:     { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle, label: "Publié" },
  REJETE:     { bg: "bg-red-100",    text: "text-red-700",    icon: XCircle, label: "Rejeté" },
  BROUILLON:  { bg: "bg-slate-100",  text: "text-slate-600",  icon: Building2, label: "Brouillon" },
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

// ─── Modal de rejet ───────────────────────────────────────────────────────────

function RejetModal({
  titre,
  isPending,
  onConfirm,
  onCancel,
}: {
  titre: string;
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
        <h2 className="font-display text-lg font-bold text-[#0C1A35]">Rejeter l'annonce</h2>
        <p className="text-sm text-slate-500">
          Vous êtes sur le point de rejeter{" "}
          <span className="font-semibold text-[#0C1A35]">« {titre} »</span>. Le motif
          sera transmis au propriétaire pour qu'il puisse corriger et resoumettre.
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AnnonceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bien, isLoading, isError } = useBienById(id ?? "");
  const valider = useValiderAnnonce();
  const deleteAdmin = useDeleteAnnonceAdmin();

  const [showRejetModal, setShowRejetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleApprouver = () => {
    if (!bien) return;
    valider.mutate(
      { id: bien.id, action: "APPROUVER" },
      {
        onSuccess: () => { toast.success("Annonce approuvée et publiée"); navigate("/admin/annonces"); },
        onError: () => toast.error("Erreur lors de l'approbation"),
      }
    );
  };

  const handleRejeter = (note: string) => {
    if (!bien) return;
    valider.mutate(
      { id: bien.id, action: "REJETER", note },
      {
        onSuccess: () => { toast.success("Annonce rejetée"); navigate("/admin/annonces"); },
        onError: () => toast.error("Erreur lors du rejet"),
      }
    );
  };

  const handleRevision = () => {
    if (!bien) return;
    valider.mutate(
      { id: bien.id, action: "REVISION" },
      {
        onSuccess: () => { toast.success("Annonce remise en révision"); navigate("/admin/annonces"); },
        onError: () => { toast.error("Erreur lors de la mise en révision"); setShowRevisionModal(false); },
      }
    );
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
  const options = [
    { label: "Meublé",    value: bien.meuble,    icon: Sofa },
    { label: "Fumeurs",   value: bien.fumeurs,   icon: Cigarette },
    { label: "Animaux",   value: bien.animaux,   icon: PawPrint },
    { label: "Parking",   value: bien.parking,   icon: ParkingSquare },
    { label: "Ascenseur", value: bien.ascenseur, icon: ArrowUpDown },
  ].filter((o) => o.value);

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

        <div className="flex items-center gap-2 shrink-0">
          <StatutBadge statut={bien.statutAnnonce} />
          {isEnAttente && (
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
                Approuver
              </button>
              <button
                onClick={() => setShowRejetModal(true)}
                disabled={valider.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
            </>
          )}
          {isPublie && (
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
        </div>
      </div>

      {/* Note de rejet (si rejeté) */}
      {bien.statutAnnonce === "REJETE" && bien.noteAdmin && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Justificatif de rejet transmis au propriétaire :</p>
            <p>{bien.noteAdmin}</p>
          </div>
        </div>
      )}

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
                {/* Photo principale */}
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
                {/* Miniatures */}
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

          {/* Caractéristiques */}
          <Section title="Caractéristiques">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Ruler,            label: "Surface",    value: bien.surface ? `${bien.surface} m²` : null },
                { icon: BedDouble,        label: "Chambres",   value: bien.nbChambres },
                { icon: Bath,             label: "Salles de bain", value: bien.nbSdb },
                { icon: Sofa,             label: "Salons",     value: bien.nbSalons },
                { icon: UtensilsCrossed,  label: "Cuisines",   value: bien.nbCuisines },
                { icon: Toilet,           label: "WC",         value: bien.nbWc },
                { icon: Layers,           label: "Étage",      value: bien.etage },
                { icon: Layers,           label: "Nb étages",  value: bien.nbEtages },
              ]
                .filter((c) => c.value !== null && c.value !== undefined)
                .map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                    <Icon className="w-4 h-4 text-[#D4A843] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{label}</p>
                      <p className="text-sm font-semibold text-[#0C1A35]">{String(value)}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Options */}
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

          {/* Équipements */}
          {bien.equipements && bien.equipements.length > 0 && (
            <Section title="Équipements">
              <div className="flex flex-wrap gap-2">
                {bien.equipements.map((e) => (
                  <span
                    key={e.equipementId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    <BadgeCheck className="w-3 h-3 text-slate-400" />
                    {e.equipement.nom}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Meubles */}
          {bien.meubles && bien.meubles.length > 0 && (
            <Section title="Mobilier">
              <div className="flex flex-wrap gap-2">
                {bien.meubles.map((m) => (
                  <span
                    key={m.meubleId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    <Sofa className="w-3 h-3 text-slate-400" />
                    {m.meuble.nom} × {m.quantite}
                  </span>
                ))}
              </div>
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
            <div className="flex items-start gap-2 mb-3">
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
            <InfoRow label="Type de logement"  value={bien.typeLogement?.nom} />
            <InfoRow label="Type de transaction" value={bien.typeTransaction?.nom} />
            <InfoRow label="Statut du bien"    value={bien.statutBien?.nom} />
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

          {/* Établissements proches */}
          {bien.etablissements && bien.etablissements.length > 0 && (
            <Section title="À proximité">
              <div className="space-y-2">
                {bien.etablissements.map((e) => (
                  <div key={e.id} className="flex items-start justify-between text-sm">
                    <div>
                      <p className="font-medium text-[#0C1A35]">{e.nom || e.type}</p>
                      <p className="text-xs text-slate-400 capitalize">{e.type}</p>
                    </div>
                    {e.distance && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {e.distance < 1000
                          ? `${e.distance} m`
                          : `${(e.distance / 1000).toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* Barre d'actions fixe en bas */}
      {(isEnAttente || isPublie) && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 -mx-6 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isEnAttente ? "Cette annonce est en attente de modération." : "Cette annonce est publiée."}
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
            {isPublie && (
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
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejetModal && (
        <RejetModal
          titre={bien.titre || "Sans titre"}
          isPending={valider.isPending}
          onConfirm={handleRejeter}
          onCancel={() => !valider.isPending && setShowRejetModal(false)}
        />
      )}

      {/* Modal de mise en révision */}
      <ConfirmModal
        open={showRevisionModal}
        title="Mettre en révision"
        message={`L'annonce « ${bien.titre || "cette annonce"} » sera remise en attente de validation. Le propriétaire pourra la modifier et la resoumettre.`}
        confirmLabel="Confirmer"
        variant="warning"
        isPending={valider.isPending}
        onConfirm={handleRevision}
        onCancel={() => !valider.isPending && setShowRevisionModal(false)}
      />

      {/* Modal de suppression */}
      <ConfirmModal
        open={showDeleteModal}
        title="Supprimer l'annonce"
        message={`Vous êtes sur le point de supprimer définitivement « ${bien.titre || "cette annonce"} ». Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
        isPending={deleteAdmin.isPending}
        onConfirm={() => {
          deleteAdmin.mutate(bien.id, {
            onSuccess: () => { toast.success("Annonce supprimée"); navigate("/admin/annonces"); },
            onError: () => { toast.error("Erreur lors de la suppression"); setShowDeleteModal(false); },
          });
        }}
        onCancel={() => !deleteAdmin.isPending && setShowDeleteModal(false)}
      />
    </div>
  );
}
