import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
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
  Image,
  Phone,
  Mail,
  Share2,
  Heart,
  Flag,
  X,
  ChevronLeft,
  ChevronRight,
  School,
  ShoppingBag,
  Hospital,
  Cross,
  Bus,
  University,
  Building2,
  Church,
  Landmark,
  GraduationCap,
  Store,
  Crown,
  Shield,
  Baby,
  ChefHat,
  Search,
  Home,
  TrendingDown,
  Bell,
  Send,
  MessageCircle,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAnnoncePublique, signalerAnnonce, fetchAnnoncesSimilaires, type SignalerAnnoncePayload } from "@/api/bien";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyCard from "@/components/PropertyCard";
import CarteBienDetail from "@/components/carte/CarteBienDetail";
import ScrollToTop from "@/components/ui/ScrollToTop";

// ─── Types ────────────────────────────────────────────────────────────────────

const MOTIFS_SIGNALEMENT = [
  { value: "arnaque", label: "Arnaque ou fraude" },
  { value: "photo_fausse", label: "Photos fausses ou volées" },
  { value: "prix_incorrect", label: "Prix incorrect ou abusif" },
  { value: "deja_loue", label: "Bien déjà loué/vendu" },
  { value: "infos_manquantes", label: "Informations manquantes" },
  { value: "autre", label: "Autre raison" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
  }).format(price);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "à l'instant";
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
  return formatDate(dateString);
}

// Fonction pour calculer le pourcentage de baisse de prix
const calculatePriceDropPercentage = (prixActuel: number | null, prixAncien: number | null): number | null => {
  if (!prixActuel || !prixAncien || prixAncien <= prixActuel) return null;
  const pourcentage = ((prixAncien - prixActuel) / prixAncien) * 100;
  return pourcentage >= 5 ? Math.round(pourcentage) : null;
};

// Fonction pour vérifier si la baisse est récente (moins de 30 jours)
const isPriceDropRecent = (dateModification: string | null): boolean => {
  if (!dateModification) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(dateModification) >= thirtyDaysAgo;
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 w-32 shrink-0 mt-0.5">{label}</span>
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

const ETABLISSEMENT_LABELS: Record<string, string> = {
  hopital: "Hôpital",
  pharmacie: "Pharmacie",
  ecole_maternelle: "École maternelle",
  ecole_primaire: "École primaire",
  college: "Collège",
  lycee: "Lycée",
  universite: "Université",
  supermarche: "Supermarché",
  marche: "Marché",
  boulangerie: "Boulangerie",
  mosquee: "Mosquée",
  eglise: "Église",
  gendarmerie: "Gendarmerie",
  pompiers: "Caserne des pompiers",
  mairie: "Mairie",
  arret_bus: "Arrêt de bus",
  station_brt: "Station BRT",
  route_principale: "Route principale",
};

function EtablissementIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ElementType> = {
    hopital: Hospital,
    pharmacie: Cross,
    ecole_maternelle: Baby,
    ecole_primaire: School,
    college: School,
    lycee: GraduationCap,
    universite: University,
    supermarche: ShoppingBag,
    marche: Store,
    boulangerie: ChefHat,
    mosquee: Landmark,
    eglise: Church,
    gendarmerie: Shield,
    pompiers: Building2,
    mairie: Building2,
    arret_bus: Bus,
    station_brt: Bus,
    route_principale: MapPin,
  };
  const Icon = iconMap[type] || Building2;
  return <Icon className="w-4 h-4" />;
}

// ─── Modal de signalement ───────────────────────────────────────────────────

function ReportModal({
  bienId,
  onClose,
}: {
  bienId: string;
  onClose: () => void;
}) {
  const [motif, setMotif] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: (payload: SignalerAnnoncePayload) => signalerAnnonce(bienId, payload),
    onSuccess: () => {
      toast.success("Signalement enregistré. Merci de votre vigilance.");
      queryClient.invalidateQueries({ queryKey: ["annonce-publie", bienId] });
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors du signalement. Veuillez réessayer.");
    },
  });

  const handleSubmit = () => {
    if (!motif) {
      toast.error("Veuillez sélectionner un motif de signalement");
      return;
    }
    reportMutation.mutate({ motif, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#0C1A35] flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Signaler cette annonce
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Vous êtes sur le point de signaler cette annonce. Notre équipe examinera votre signalement dans les plus brefs délais.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500">
            Motif du signalement <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {MOTIFS_SIGNALEMENT.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  motif === m.value
                    ? "border-[#D4A843] bg-[#D4A843]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="motif"
                  value={m.value}
                  checked={motif === m.value}
                  onChange={(e) => setMotif(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    motif === m.value ? "border-[#D4A843]" : "border-slate-300"
                  }`}
                >
                  {motif === m.value && <div className="w-2 h-2 rounded-full bg-[#D4A843]" />}
                </div>
                <span className="text-sm text-[#0C1A35]">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">
            Description (facultatif)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Décrivez le problème en quelques mots..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm
              outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={reportMutation.isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={reportMutation.isPending || !motif}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm
              font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {reportMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Signaler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire inline du panneau génie ──────────────────────────────────────

function AlertPanelForm({ bienId, onClose }: { bienId: string; onClose: () => void }) {
  const [motif, setMotif] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: (payload: SignalerAnnoncePayload) => signalerAnnonce(bienId, payload),
    onSuccess: () => {
      toast.success("Signalement enregistré. Merci de votre vigilance.");
      queryClient.invalidateQueries({ queryKey: ["annonce-publie", bienId] });
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors du signalement. Veuillez réessayer.");
    },
  });

  return (
    <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
      <p className="text-xs text-slate-500">
        Notre équipe examinera votre signalement dans les plus brefs délais.
      </p>

      <div className="space-y-1.5">
        {MOTIFS_SIGNALEMENT.map((m) => (
          <label
            key={m.value}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
              motif === m.value
                ? "border-[#D4A843] bg-[#D4A843]/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="motif-panel"
              value={m.value}
              checked={motif === m.value}
              onChange={(e) => setMotif(e.target.value)}
              className="sr-only"
            />
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                motif === m.value ? "border-[#D4A843]" : "border-slate-300"
              }`}
            >
              {motif === m.value && <div className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />}
            </div>
            <span className="text-xs text-[#0C1A35]">{m.label}</span>
          </label>
        ))}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Décrivez le problème (facultatif)…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none"
      />

      <button
        onClick={() => {
          if (!motif) { toast.error("Sélectionnez un motif"); return; }
          reportMutation.mutate({ motif, description });
        }}
        disabled={reportMutation.isPending || !motif}
        className="w-full h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {reportMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Envoyer le signalement
      </button>
    </div>
  );
}

// ─── Modal Demande de visite ──────────────────────────────────────────────────

function DemandeVisiteModal({
  bien,
  onClose,
}: {
  bien: { titre?: string; proprietaire?: { email?: string | null; telephone?: string | null } | null };
  onClose: () => void;
}) {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "Bonjour, je suis intéressé(e) par ce bien. Est-il possible de programmer une visite ? Merci."
  );

  const handleSubmit = () => {
    if (!nom.trim() || !telephone.trim()) {
      toast.error("Veuillez remplir le nom et le numéro de téléphone");
      return;
    }
    if (bien.proprietaire?.email) {
      const subject = encodeURIComponent(`Demande de visite - ${bien.titre ?? "bien"}`);
      const body = encodeURIComponent(
        `Nom : ${nom}\nTéléphone : ${telephone}${email ? `\nEmail : ${email}` : ""}\n\n${message}`
      );
      window.open(`mailto:${bien.proprietaire.email}?subject=${subject}&body=${body}`, "_blank");
    }
    toast.success("Votre demande de visite a été envoyée !");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#0C1A35] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D4A843]" />
            Email
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Votre nom"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+221 XX XXX XX XX"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-10 rounded-xl bg-[#D4A843] hover:bg-[#C49830] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function AnnonceDetail() {
  const { id } = useParams<{ id: string }>();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVisiteModal, setShowVisiteModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [alertClosing, setAlertClosing] = useState(false);

  const openAlertPanel = () => {
    setAlertClosing(false);
    setShowAlertPanel(true);
  };
  const closeAlertPanel = () => {
    setAlertClosing(true);
    setTimeout(() => {
      setShowAlertPanel(false);
      setAlertClosing(false);
    }, 350);
  };

  // Smooth scroll vers le haut au montage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const { data: bien, isLoading, isError } = useQuery({
    queryKey: ["annonce-publie", id],
    queryFn: () => fetchAnnoncePublique(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch similar announcements
  const { data: similaires } = useQuery({
    queryKey: ["annonces-similaires", id],
    queryFn: () => fetchAnnoncesSimilaires(id!, 4),
    enabled: !!id && !!bien,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (isError || !bien) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Image className="w-8 h-8 text-slate-300" />
          </div>
          <h1 className="font-display text-xl font-bold text-[#0C1A35] mb-2">
            Annonce introuvable
          </h1>
          <p className="text-slate-500 mb-6">
            Cette annonce n'existe pas ou a été retirée.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0C1A35] text-white text-sm font-medium hover:bg-[#1A2942] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const photos = bien.photos ?? [];
  const options = [
    { label: "Meublé", value: bien.meuble, icon: Sofa },
    { label: "Fumeurs", value: bien.fumeurs, icon: Cigarette },
    { label: "Animaux", value: bien.animaux, icon: PawPrint },
    { label: "Parking", value: bien.parking, icon: ParkingSquare },
    { label: "Ascenseur", value: bien.ascenseur, icon: ArrowUpDown },
  ].filter((o) => o.value);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1.5 py-3 text-sm">
            <Link
              to="/"
              className="flex items-center gap-1 text-slate-500 hover:text-[#0C1A35] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <Link
              to="/#properties"
              className="text-slate-500 hover:text-[#0C1A35] transition-colors"
            >
              Annonces
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {bien.typeLogement && (
              <>
                <Link
                  to={`/biens?type=${bien.typeLogement.slug}`}
                  className="text-slate-500 hover:text-[#0C1A35] transition-colors"
                >
                  {bien.typeLogement.nom}
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </>
            )}
            <span className="text-[#0C1A35] font-medium truncate max-w-[200px]">
              {bien.titre || "Annonce"}
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div />
            <div className="flex items-center gap-2">
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {photos.length > 0 && (
              <Section title="Photos">
                {/* Main Photo */}
                <div 
                  className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video cursor-pointer group"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={photos[photoIndex]}
                    alt={`Photo ${photoIndex + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                    {photoIndex + 1} / {photos.length}
                  </span>
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex - 1 + photos.length) % photos.length); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % photos.length); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                      </button>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {photos.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          i === photoIndex ? "border-[#D4A843]" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Title & Price */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
                    {bien.typeLogement?.nom} · {bien.typeTransaction?.nom}
                  </p>
                  <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
                    {bien.titre || "Annonce"}
                  </h1>
                  {/* Statut du bien - Badge visible et coloré */}
                  {bien.statutBien && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold">
                      {bien.statutBien.nom.toLowerCase().includes('disponible') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {bien.statutBien.nom}
                        </span>
                      )}
                      {bien.statutBien.nom.toLowerCase().includes('offre') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {bien.statutBien.nom}
                        </span>
                      )}
                      {(bien.statutBien.nom.toLowerCase().includes('vendu') || bien.statutBien.nom.toLowerCase().includes('loué')) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          {bien.statutBien.nom}
                        </span>
                      )}
                      {bien.statutBien.nom.toLowerCase().includes('réservé') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          {bien.statutBien.nom}
                        </span>
                      )}
                      {!bien.statutBien.nom.toLowerCase().includes('disponible') && 
                       !bien.statutBien.nom.toLowerCase().includes('offre') && 
                       !bien.statutBien.nom.toLowerCase().includes('vendu') && 
                       !bien.statutBien.nom.toLowerCase().includes('loué') &&
                       !bien.statutBien.nom.toLowerCase().includes('réservé') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-slate-500" />
                          {bien.statutBien.nom}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {bien.prix && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#D4A843]">
                      {formatPrice(bien.prix)}
                    </p>
                    {bien.frequencePaiement && (
                      <p className="text-xs text-slate-400">{bien.frequencePaiement}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4 text-[#D4A843]" />
                <span className="text-sm">
                  {[bien.adresse, bien.quartier, bien.ville, bien.region, bien.pays]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              {/* Date de publication */}
              {bien.createdAt && (
                <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Publiée {getTimeAgo(bien.createdAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {bien.description && (
              <Section title="Description">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {bien.description}
                </p>
              </Section>
            )}

            {/* Characteristics */}
            <Section title="Caractéristiques">
              <div className="relative">
                {/* Flèches de navigation */}
                <button
                  onClick={() => {
                    const container = document.getElementById('caracteristiques-scroll');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('caracteristiques-scroll');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Scrollable container - Masquer la scrollbar */}
                <div
                  id="caracteristiques-scroll"
                  className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-1 -my-1"
                >
                  <style>{`
                    #caracteristiques-scroll::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {[
                    { icon: Ruler, label: "Surface", value: bien.surface ? `${bien.surface} m²` : null },
                    { icon: BedDouble, label: "Chambres", value: bien.nbChambres },
                    { icon: Bath, label: "Salles de bain", value: bien.nbSdb },
                    { icon: Sofa, label: "Salons", value: bien.nbSalons },
                    { icon: UtensilsCrossed, label: "Cuisines", value: bien.nbCuisines },
                    { icon: Toilet, label: "WC", value: bien.nbWc },
                    { icon: Layers, label: "Étage", value: bien.etage },
                    { icon: Layers, label: "Nb étages", value: bien.nbEtages },
                  ]
                    .filter((c) => c.value !== null && c.value !== undefined)
                    .map(({ icon: Icon, label, value }) => (
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4A843]/10 text-[#D4A843]"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Equipment, Furniture & Nearby - Tabs */}
            <Section title="Informations supplémentaires">
              <Tabs defaultValue="equipements" className="w-full">
                <TabsList className="w-full justify-start bg-slate-50 p-1 rounded-xl h-auto flex-wrap">
                  <TabsTrigger
                    value="equipements"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Équipements
                  </TabsTrigger>
                  <TabsTrigger
                    value="objets"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Sofa className="w-4 h-4" />
                    Mobilier
                  </TabsTrigger>
                  <TabsTrigger
                    value="proximite"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    À proximité
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="equipements" className="mt-4">
                  {bien.equipements && bien.equipements.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {bien.equipements.map((e) => (
                        <span
                          key={e.equipementId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700"
                        >
                          {e.equipement.nom}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucun équipement disponible pour ce bien
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="objets" className="mt-4">
                  {bien.meubles && bien.meubles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {bien.meubles.map((m) => (
                        <span
                          key={m.meubleId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700"
                        >
                          {m.meuble.nom} × {m.quantite}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucun mobilier disponible pour ce bien
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="proximite" className="mt-4">
                  {bien.latitude !== null && bien.longitude !== null && (
                    <div className="mb-4">
                      <CarteBienDetail
                        latitude={bien.latitude}
                        longitude={bien.longitude}
                        titreBien={bien.titre}
                        etablissements={bien.etablissements ?? []}
                      />
                    </div>
                  )}
                  {bien.etablissements && bien.etablissements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bien.etablissements.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                        >
                          <div className="w-9 h-9 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                            <EtablissementIcon type={e.type} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#D4A843] uppercase tracking-wide">
                              {ETABLISSEMENT_LABELS[e.type] ?? e.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm font-medium text-[#0C1A35] truncate">
                              {e.nom || "—"}
                            </p>
                            {e.distance && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {e.distance < 1000
                                  ? `${e.distance} m`
                                  : `${(e.distance / 1000).toFixed(1)} km`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucun établissement à proximité n'a été ajouté pour ce bien
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </Section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-5">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                  Contacter le propriétaire
                </h3>
                
                {/* Owner Info */}
                {bien.proprietaire && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#0C1A35] flex items-center justify-center shrink-0">
                      <span className="text-white text-lg font-bold">
                        {bien.proprietaire.prenom?.[0]?.toUpperCase() ?? "P"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0C1A35]">
                        {bien.proprietaire.prenom} {bien.proprietaire.nom}
                      </p>
                      <p className="text-xs text-slate-400">Propriétaire</p>
                    </div>
                  </div>
                )}

                {/* Nombre d'annonces du propriétaire */}
                {bien.nombreAnnoncesProprietaire !== undefined && bien.nombreAnnoncesProprietaire > 0 && (
                  <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-600">
                      <span className="font-semibold text-[#0C1A35]">{bien.nombreAnnoncesProprietaire}</span> {bien.nombreAnnoncesProprietaire === 1 ? 'annonce' : 'annonces'} {bien.nombreAnnoncesProprietaire === 1 ? 'publiée' : 'publiées'} sur Seek
                    </span>
                  </div>
                )}

                {/* Phone */}
                {bien.proprietaire?.telephone && (
                  <a
                    href={`tel:${bien.proprietaire.telephone}`}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#0C1A35] text-white font-medium hover:bg-[#1A2942] transition-colors mb-3"
                  >
                    <Phone className="w-4 h-4" />
                    {bien.proprietaire.telephone}
                  </a>
                )}

                {/* WhatsApp */}
                {bien.proprietaire?.telephone && (
                  <a
                    href={`https://wa.me/${bien.proprietaire.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je vous contacte pour l'annonce "${bien.titre}". Est-il possible d'organiser une visite ?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#1EBE57] transition-colors mb-3"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}

                {/* Demander une visite */}
                <button
                  onClick={() => setShowVisiteModal(true)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#D4A843] text-[#D4A843] font-medium hover:bg-[#D4A843]/5 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>

              {/* Pricing Details */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                  Détails du prix
                </h3>
                {/* Badge de baisse de prix */}
                {(() => {
                  const pourcentageBaisse = calculatePriceDropPercentage(bien.prix, bien.prixAncien);
                  const baisseRecente = isPriceDropRecent(bien.dateDerniereModificationPrix);
                  const afficherBaisse = pourcentageBaisse !== null && baisseRecente;
                  
                  if (!afficherBaisse) return null;
                  
                  return (
                    <div className="mb-4 flex items-center gap-2 text-red-600 font-bold">
                      🔻 -{pourcentageBaisse}%
                    </div>
                  );
                })()}
                <div className="space-y-2">
                  <InfoRow label="Loyer" value={bien.prix ? formatPrice(bien.prix) : null} />
                  <InfoRow label="Fréquence" value={bien.frequencePaiement} />
                  <InfoRow label="Caution" value={bien.caution ? formatPrice(bien.caution) : null} />
                  <InfoRow label="Charges incluses" value={bien.chargesIncluses ? "Oui" : "Non"} />
                </div>
                {bien.disponibleLe && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Disponible le{" "}
                      {new Date(bien.disponibleLe).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Classification */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                  Classification
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Type de bien" value={bien.typeLogement?.nom} />
                  <InfoRow label="Transaction" value={bien.typeTransaction?.nom} />
                  <InfoRow label="Statut" value={bien.statutBien?.nom} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
            className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img
            src={photos[photoIndex]}
            alt={`Photo ${photoIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
            className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === photoIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && bien && (
        <ReportModal bienId={bien.id} onClose={() => setShowReportModal(false)} />
      )}

      {/* Demande de visite Modal */}
      {showVisiteModal && bien && (
        <DemandeVisiteModal bien={bien} onClose={() => setShowVisiteModal(false)} />
      )}

      {/* Similar Announcements Section */}
      {similaires && similaires.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
              Annonces similaires
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similaires.map((item) => (
                <PropertyCard key={item.id} property={item} isApiData={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <ScrollToTop />

      {/* ── Floating Alert Button (Lampe du génie) ─────────────────────────── */}
      <style>{`
        @keyframes genieOut {
          0%   { transform: scale(0.05) translate(40px, 40px); opacity: 0; }
          45%  { transform: scale(1.04) translate(-3px, -3px); opacity: 1; }
          65%  { transform: scale(0.97) translate(1px, 1px); }
          80%  { transform: scale(1.01) translate(-1px, -1px); }
          100% { transform: scale(1) translate(0, 0); opacity: 1; }
        }
        @keyframes genieIn {
          0%   { transform: scale(1) translate(0, 0); opacity: 1; }
          100% { transform: scale(0.05) translate(40px, 40px); opacity: 0; }
        }
        @keyframes lampPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
        .genie-panel-open  { animation: genieOut 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) forwards; transform-origin: bottom right; }
        .genie-panel-close { animation: genieIn  0.32s cubic-bezier(0.36, 0, 0.66, 0) forwards; transform-origin: bottom right; }
        .lamp-btn { animation: lampPulse 2.4s ease-in-out infinite; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Panel génie */}
        {showAlertPanel && (
          <div
            className={`w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ${alertClosing ? "genie-panel-close" : "genie-panel-open"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0C1A35] to-[#1A2942]">
              <h2 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#D4A843]" />
                Signaler cette annonce
              </h2>
              <button
                onClick={closeAlertPanel}
                className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <AlertPanelForm bienId={bien.id} onClose={closeAlertPanel} />
          </div>
        )}

        {/* Bouton lampe */}
        <button
          onClick={showAlertPanel ? closeAlertPanel : openAlertPanel}
          title="Signaler cette annonce"
          className={`lamp-btn w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-150 ${showAlertPanel ? "rotate-12 bg-red-600" : "bg-red-500"}`}
        >
          <Megaphone className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* No Similar Announcements Message */}
      {(!similaires || similaires.length === 0) && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#0C1A35] mb-2">
              Aucune annonce similaire trouvée
            </h3>
            <p className="text-sm text-slate-500">
              Nous n'avons pas trouvé d'annonces similaires dans cette zone pour le moment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

