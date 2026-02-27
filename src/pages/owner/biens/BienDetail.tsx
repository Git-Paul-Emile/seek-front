import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
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
  Edit,
  Trash2,
  Info,
  Image,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  User,
  Phone,
  StopCircle,
  AlertTriangle,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useBienById } from "@/hooks/useBien";
import { useDeleteBien, useRetourBrouillon, useAnnulerAnnonce } from "@/hooks/useBien";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { StatutAnnonce } from "@/api/bien";
import { useBailActif, useTerminerBail, useResilierBail, useProlongerBail } from "@/hooks/useBail";
import BailForm from "./BailForm";
import ContratModal from "./ContratModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUT_STYLE: Record<
  StatutAnnonce,
  { bg: string; text: string; icon: React.ElementType; label: string }
> = {
  BROUILLON:  { bg: "bg-slate-100",  text: "text-slate-700",  icon: FileText,     label: "Brouillon" },
  EN_ATTENTE: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock,        label: "En attente" },
  PUBLIE:     { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle,  label: "Publié" },
  REJETE:     { bg: "bg-red-100",    text: "text-red-700",    icon: XCircle,      label: "Rejeté" },
  ANNULE:     { bg: "bg-gray-200",   text: "text-gray-600",   icon: XCircle,      label: "Annulé" },
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">{title}</h3>
      {children}
    </div>
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BienDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bien, isLoading, isError } = useBienById(id ?? "");
  const deleteMutation = useDeleteBien();
  const retour = useRetourBrouillon();
  const annuler = useAnnulerAnnonce();

  const isLocation = bien?.typeTransaction?.slug === "location";
  const { data: bail, refetch: refetchBail } = useBailActif(
    isLocation ? (id ?? "") : ""
  );
  const terminer = useTerminerBail();
  const resilier = useResilierBail();
  const prolonger = useProlongerBail();

  const [photoIndex, setPhotoIndex] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [retourOpen, setRetourOpen] = useState(false);
  const [annulerOpen, setAnnulerOpen] = useState(false);
  const [showBailForm, setShowBailForm] = useState(false);
  const [showContratModal, setShowContratModal] = useState(false);
  const [activeBailForContrat, setActiveBailForContrat] = useState<typeof bail | null>(null);
  const [isContratCreationFlow, setIsContratCreationFlow] = useState(false);
  const [terminerOpen, setTerminerOpen] = useState(false);
  const [resilierOpen, setResilierOpen] = useState(false);
  const [prolongerOpen, setProlongerOpen] = useState(false);
  const [newDateFin, setNewDateFin] = useState("");

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
        <p className="text-slate-400">Bien introuvable.</p>
        <Link to="/owner/biens" className="text-[#D4A843] text-sm font-medium mt-2 inline-block">
          Retour à mes biens
        </Link>
      </div>
    );
  }

  const photos = bien.photos ?? [];
  const statut = bien.statutAnnonce;

  const options = [
    { label: "Meublé",    value: bien.meuble,    icon: Sofa },
    { label: "Fumeurs",   value: bien.fumeurs,   icon: Cigarette },
    { label: "Animaux",   value: bien.animaux,   icon: PawPrint },
    { label: "Parking",   value: bien.parking,   icon: ParkingSquare },
    { label: "Ascenseur", value: bien.ascenseur, icon: ArrowUpDown },
  ].filter((o) => o.value);

  const hasEquipements = bien.equipements && bien.equipements.length > 0;
  const hasMeubles = bien.meubles && bien.meubles.length > 0;

  const isPendingRevision = bien.hasPendingRevision === true;
  // EN_ATTENTE: Annuler la soumission + Annuler l'annonce (pas Modifier)
  // PUBLIE: Modifier (si pas de révision en attente) + Dépublier + Supprimer
  // BROUILLON/REJETE: Modifier + Annuler l'annonce
  const canEdit    = (statut === "BROUILLON" || statut === "REJETE") ||
                     (statut === "PUBLIE" && !isPendingRevision);
  const canDelete  = statut === "PUBLIE";
  const canRetour  = statut === "EN_ATTENTE" || statut === "PUBLIE";
  const canAnnuler = statut === "BROUILLON" || statut === "EN_ATTENTE" || statut === "REJETE";
  const retourLabel = statut === "EN_ATTENTE" ? "Annuler la soumission" : "Dépublier";
  const retourMessage =
    statut === "EN_ATTENTE"
      ? "L'annonce sera remise en brouillon et retirée de la file d'attente."
      : "L'annonce sera dépubliée et remise en brouillon. Elle ne sera plus visible.";

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/owner/biens"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
              text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Mes biens
            </div>
            <h1 className="font-display text-xl font-bold text-[#0C1A35] truncate">
              {bien.titre || "Annonce sans titre"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
          <StatutBadge statut={statut} />
          {canEdit && (
            <Link
              to={`/owner/biens/ajouter?edit=${bien.id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                bg-[#0C1A35] text-white hover:bg-[#162540] transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier
            </Link>
          )}
          {canRetour && (
            <button
              onClick={() => setRetourOpen(true)}
              disabled={retour.isPending}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {retourLabel}
            </button>
          )}
          
          {canAnnuler && (
            <button
              onClick={() => setAnnulerOpen(true)}
              disabled={annuler.isPending}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Annuler l'annonce
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Bannière révision en attente */}
      {isPendingRevision && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Révision en attente de validation</p>
            <p className="text-blue-600">
              Vos modifications ont été soumises à l'administrateur. L'annonce reste visible avec les informations actuelles jusqu'à validation.
            </p>
          </div>
        </div>
      )}

      {/* Note de rejet de révision */}
      {statut === "PUBLIE" && bien.noteAdmin && !isPendingRevision && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Révision rejetée :</p>
            <p>{bien.noteAdmin}</p>
          </div>
        </div>
      )}

      {/* Note de rejet */}
      {statut === "REJETE" && bien.noteAdmin && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Motif de rejet :</p>
            <p>{bien.noteAdmin}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Galerie */}
          <Section title="Photos">
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 bg-slate-50 rounded-xl text-slate-300">
                <Image className="w-10 h-10 mb-2" />
                <p className="text-sm">Aucune photo</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video">
                  <img src={photos[photoIndex]} alt={`Photo ${photoIndex + 1}`} className="w-full h-full object-cover" />
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
                        <img src={url} alt="" className="w-full h-full object-cover" />
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
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{bien.description}</p>
            </Section>
          )}

          {/* Caractéristiques */}
          <Section title="Caractéristiques">
            <div className="relative">
              <button
                onClick={() => {
                  const el = document.getElementById("bien-caract-scroll");
                  if (el) el.scrollBy({ left: -280, behavior: "smooth" });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("bien-caract-scroll");
                  if (el) el.scrollBy({ left: 280, behavior: "smooth" });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div
                id="bien-caract-scroll"
                className="flex gap-3 overflow-x-auto px-8 py-1 -my-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style>{`#bien-caract-scroll::-webkit-scrollbar { display: none; }`}</style>
                {[
                  { icon: Ruler,           label: "Surface",        value: bien.surface ? `${bien.surface} m²` : null },
                  { icon: BedDouble,       label: "Chambres",       value: bien.nbChambres },
                  { icon: Bath,            label: "Salles de bain", value: bien.nbSdb },
                  { icon: Sofa,            label: "Salons",         value: bien.nbSalons },
                  { icon: UtensilsCrossed, label: "Cuisines",       value: bien.nbCuisines },
                  { icon: Toilet,          label: "WC",             value: bien.nbWc },
                  { icon: Layers,          label: "Étage",          value: bien.etage },
                  { icon: Layers,          label: "Nb étages",      value: bien.nbEtages },
                ]
                  .filter((c) => c.value !== null && c.value !== undefined)
                  .map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 shrink-0 min-w-[130px]">
                      <Icon className="w-4 h-4 text-[#D4A843] shrink-0" />
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
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#D4A843]/10 text-[#D4A843]">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Équipements & Mobilier en onglets */}
          <Section title="Équipements & Mobilier">
            <Tabs defaultValue={hasEquipements ? "equipements" : "mobilier"} className="w-full">
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
                      <span key={e.equipementId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700">
                        <BadgeCheck className="w-4 h-4 text-slate-400" />
                        {e.equipement.nom}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun équipement renseigné</p>
                )}
              </TabsContent>

              <TabsContent value="mobilier" className="mt-4">
                {hasMeubles ? (
                  <div className="flex flex-wrap gap-2">
                    {bien.meubles!.map((m) => (
                      <span key={m.meubleId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700">
                        <Sofa className="w-3.5 h-3.5 text-slate-400" />
                        {m.meuble.nom} × {m.quantite}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun mobilier renseigné</p>
                )}
              </TabsContent>
            </Tabs>
          </Section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Section Locataire — uniquement pour les biens en location */}
          {isLocation && (
            <Section title="Locataire actuel">
              {bail ? (
                <div className="space-y-3">
                  {/* Locataire */}
                  <Link
                    to={`/owner/locataires/${bail.locataireId}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {bail.locataire.prenom[0]}{bail.locataire.nom[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0C1A35]">
                        {bail.locataire.prenom} {bail.locataire.nom}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {bail.locataire.telephone}
                      </p>
                    </div>
                  </Link>

                  {/* Infos bail */}
                  <div className="text-sm space-y-1.5">
                    {bail.typeBail && (
                      <InfoRow label="Type de bail" value={bail.typeBail} />
                    )}
                    <InfoRow
                      label="Début du bail"
                      value={new Date(bail.dateDebutBail).toLocaleDateString("fr-FR")}
                    />
                    {bail.dateFinBail && (
                      <InfoRow
                        label="Fin du bail"
                        value={new Date(bail.dateFinBail).toLocaleDateString("fr-FR")}
                      />
                    )}
                    <InfoRow
                      label="Loyer"
                      value={`${bail.montantLoyer.toLocaleString("fr-FR")} FCFA`}
                    />
                    {bail.renouvellement && (
                      <p className="text-xs text-green-600">✓ Renouvellement possible</p>
                    )}
                  </div>

                  {/* Actions bail */}
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => { setActiveBailForContrat(bail); setIsContratCreationFlow(false); setShowContratModal(true); }}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Voir le contrat
                    </button>
                    <button
                      onClick={() => setProlongerOpen(true)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Prolonger le bail
                    </button>
                    {bail.dateFinBail ? (
                      <button
                        onClick={() => setResilierOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-700 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Résilier le bail
                      </button>
                    ) : (
                      <button
                        onClick={() => setTerminerOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-orange-200 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-50 transition-colors"
                      >
                        <StopCircle className="w-3.5 h-3.5" />
                        Terminer le bail
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 mb-3">
                    Aucun locataire associé
                  </p>
                  <button
                    onClick={() => setShowBailForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Associer un locataire
                  </button>
                </div>
              )}
            </Section>
          )}

          {/* Localisation */}
          <Section title="Localisation">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D4A843] mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600">
                {[bien.adresse, bien.quartier, bien.ville, bien.region, bien.pays].filter(Boolean).join(", ") || "Non spécifiée"}
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
            {bien.prix && (
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4 text-[#D4A843]" />
                <div>
                  <p className="text-lg font-bold text-[#0C1A35]">{bien.prix.toLocaleString("fr-FR")} F</p>
                  {bien.frequencePaiement && <p className="text-xs text-slate-400">{bien.frequencePaiement}</p>}
                </div>
              </div>
            )}
            <InfoRow label="Caution"          value={bien.caution ? `${bien.caution.toLocaleString("fr-FR")} F` : null} />
            <InfoRow label="Charges incluses" value={bien.chargesIncluses ? "Oui" : "Non"} />
            {bien.disponibleLe && (
              <div className="flex items-center gap-2 pt-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">
                  Disponible le {new Date(bien.disponibleLe).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
          </Section>

          {/* Dates */}
          <Section title="Dates">
            <InfoRow label="Créé le" value={new Date(bien.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
            {Math.abs(new Date(bien.updatedAt).getTime() - new Date(bien.createdAt).getTime()) > 5000 && (
              <InfoRow label="Mis à jour" value={new Date(bien.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
            )}
          </Section>
        </div>
      </div>

      {/* Modal retour brouillon */}
      <ConfirmModal
        open={retourOpen}
        title={retourLabel}
        message={retourMessage}
        confirmLabel={retourLabel}
        cancelLabel="Annuler"
        variant="warning"
        isPending={retour.isPending}
        onConfirm={() =>
          retour.mutate(bien.id, {
            onSuccess: () => { toast.success("Annonce remise en brouillon"); setRetourOpen(false); },
            onError: () => { toast.error("Erreur"); setRetourOpen(false); },
          })
        }
        onCancel={() => setRetourOpen(false)}
      />

      {/* Modal annulation */}
      <ConfirmModal
        open={annulerOpen}
        title="Annuler l'annonce"
        message="Cette action annulera définitivement l'annonce. Elle ne sera plus visible ni comptabilisée côté administration."
        confirmLabel="Confirmer l'annulation"
        cancelLabel="Retour"
        variant="danger"
        isPending={annuler.isPending}
        onConfirm={() =>
          annuler.mutate(bien.id, {
            onSuccess: () => { toast.success("Annonce annulée"); navigate("/owner/biens"); },
            onError: () => { toast.error("Erreur lors de l'annulation"); setAnnulerOpen(false); },
          })
        }
        onCancel={() => setAnnulerOpen(false)}
      />

      {/* Modal suppression */}
      <ConfirmModal
        open={deleteOpen}
        title="Supprimer l'annonce"
        message="Cette action est irréversible. L'annonce sera définitivement supprimée."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(bien.id, {
            onSuccess: () => { toast.success("Annonce supprimée"); navigate("/owner/biens"); },
            onError: () => { toast.error("Erreur lors de la suppression"); setDeleteOpen(false); },
          })
        }
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Modal terminer bail */}
      <ConfirmModal
        open={terminerOpen}
        title="Terminer le bail"
        message="Le bail sera marqué comme terminé et le bien reviendra au statut Libre."
        confirmLabel="Terminer le bail"
        cancelLabel="Annuler"
        variant="warning"
        isPending={terminer.isPending}
        onConfirm={() =>
          terminer.mutate(
            { bienId: bien.id, bailId: bail!.id },
            {
              onSuccess: () => {
                toast.success("Bail terminé — le bien est Libre");
                setTerminerOpen(false);
                refetchBail();
              },
              onError: () => { toast.error("Erreur"); setTerminerOpen(false); },
            }
          )
        }
        onCancel={() => setTerminerOpen(false)}
      />

      {/* Modal résilier bail */}
      <ConfirmModal
        open={resilierOpen}
        title="Résilier le bail"
        message="Le bail sera résilié et le bien reviendra au statut Libre. Cette action indique une rupture anticipée du contrat."
        confirmLabel="Résilier le bail"
        cancelLabel="Annuler"
        variant="danger"
        isPending={resilier.isPending}
        onConfirm={() =>
          resilier.mutate(
            { bienId: bien.id, bailId: bail!.id },
            {
              onSuccess: () => {
                toast.success("Bail résilié — le bien est Libre");
                setResilierOpen(false);
                refetchBail();
              },
              onError: () => { toast.error("Erreur"); setResilierOpen(false); },
            }
          )
        }
        onCancel={() => setResilierOpen(false)}
      />

      {/* Modal prolonger bail */}
      {prolongerOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Prolonger le bail</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouvelle date de fin
            </label>
            <input
              type="date"
              value={newDateFin}
              onChange={(e) => setNewDateFin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setProlongerOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!newDateFin) { toast.error("Date requise"); return; }
                  prolonger.mutate(
                    { bienId: bien.id, bailId: bail!.id, dateFinBail: newDateFin },
                    {
                      onSuccess: () => {
                        toast.success("Bail prolongé");
                        setProlongerOpen(false);
                        setNewDateFin("");
                        refetchBail();
                      },
                      onError: () => toast.error("Erreur lors de la prolongation"),
                    }
                  );
                }}
                disabled={prolonger.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {prolonger.isPending ? "Enregistrement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ContratModal */}
      {showContratModal && activeBailForContrat && (
        <ContratModal
          bail={activeBailForContrat}
          isCreationFlow={isContratCreationFlow}
          onClose={() => { setShowContratModal(false); setActiveBailForContrat(null); setIsContratCreationFlow(false); }}
        />
      )}

      {/* BailForm modal */}
      {showBailForm && (
        <BailForm
          bienId={bien.id}
          bien={{
            prix: bien.prix,
            caution: bien.caution,
            frequencePaiement: bien.frequencePaiement,
          }}
          onClose={() => setShowBailForm(false)}
          onBailCreated={(newBail) => {
            setShowBailForm(false);
            refetchBail();
            setActiveBailForContrat(newBail);
            setIsContratCreationFlow(true);
            setShowContratModal(true);
          }}
        />
      )}
    </div>
  );
}
