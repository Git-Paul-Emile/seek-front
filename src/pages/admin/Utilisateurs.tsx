import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserX,
  UserCheck,
  AlertTriangle,
  Search,
  Loader2,
  Building2,
  User,
  Eye,
  Trash2,
  X,
  Home,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  useProprietaires,
  useLocataires,
  useSuspendreProprietaire,
  useReactiverProprietaire,
  useSuspendreLocataire,
  useReactiverLocataire,
  useSupprimerProprietaire,
  useSupprimerLocataire,
  useProprietaireWithBiens,
  useLocataireWithBails,
} from "@/hooks/useSuspension";

// Motifs de suspension standards pour les propriétaires
const SUSPENSION_MOTIFS_PROPRIETAIRE = [
  "Fraude ou activité illégale",
  "Non-respect des conditions d'utilisation",
  "Annonces trompeuses ou frauduleuses",
  "Comportement agressif envers les utilisateurs",
  "Non-paiement répété",
  "Violation de la politique de confidentialité",
  "Usurpation d'identité",
  "Autre raison",
];

// Motifs de suspension pour les locataires
const SUSPENSION_MOTIFS_LOCATAIRE = [
  "Faux document d'identité",
  "Justificatif falsifié",
  "Fausse identité",
  "Tentative de paiement frauduleux",
  "Comportement abusif",
  "Fausses informations",
  "Autre raison",
];

// Types
interface Proprietaire {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  estSuspendu: boolean;
  motifSuspension: string | null;
  dateSuspension: string | null;
  suspenduPar: string | null;
  createdAt: string;
}

interface Locataire {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  estSuspendu: boolean;
  motifSuspension: string | null;
  dateSuspension: string | null;
  suspenduPar: string | null;
  createdAt: string;
}

export default function UtilisateursPage() {
  const { type } = useParams<{ type: "proprietaires" | "locataires" }>();
  const navigate = useNavigate();
  
  // Déterminer le type d'utilisateur en fonction du paramètre d'URL
  // Si type est 'locataires', afficher les locataires
  // Sinon (y compris si undefined), afficher les propriétaires par défaut
  const userType: "proprietaires" | "locataires" = type === "locataires" ? "locataires" : "proprietaires";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProprietaire, setSelectedProprietaire] = useState<Proprietaire | null>(null);
  const [selectedLocataire, setSelectedLocataire] = useState<Locataire | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactiverModal, setShowReactiverModal] = useState(false);
  const [showSupprimerModal, setShowSupprimerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMotif, setSelectedMotif] = useState("");
  const [customMotif, setCustomMotif] = useState("");
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(new Set());

  // Charger les données depuis l'API
  const { data: proprietairesData, isLoading: loadingProprietaires } = useProprietaires({
    search: searchTerm || undefined,
  });

  const { data: locatairesData, isLoading: loadingLocataires } = useLocataires({
    search: searchTerm || undefined,
  });

  // Charger les détails avec les biens/baux
  const { data: proprietaireDetails, isLoading: loadingProprietaireDetails } = useProprietaireWithBiens(
    selectedProprietaire?.id || ""
  );
  const { data: locataireDetails, isLoading: loadingLocataireDetails } = useLocataireWithBails(
    selectedLocataire?.id || ""
  );

  // Mutations
  const suspendreProprietaire = useSuspendreProprietaire();
  const reactiverProprietaire = useReactiverProprietaire();
  const supprimerProprietaire = useSupprimerProprietaire();
  const suspendreLocataire = useSuspendreLocataire();
  const reactiverLocataire = useReactiverLocataire();
  const supprimerLocataire = useSupprimerLocataire();

  const proprietaires = proprietairesData?.data || [];
  const locataires = locatairesData?.data || [];

  const isPending =
    suspendreProprietaire.isPending ||
    reactiverProprietaire.isPending ||
    supprimerProprietaire.isPending ||
    suspendreLocataire.isPending ||
    reactiverLocataire.isPending ||
    supprimerLocataire.isPending;

  const handleSuspendreProprietaire = async () => {
    const motif = selectedMotif === "autre" ? customMotif : selectedMotif;
    if (!motif) {
      toast.error("Veuillez sélectionner ou saisir un motif de suspension");
      return;
    }

    if (!selectedProprietaire) return;

    try {
      await suspendreProprietaire.mutateAsync({
        id: selectedProprietaire.id,
        motif,
        masquerAnnonces: true,
      });
      toast.success("Propriétaire suspendu avec succès");
      setShowSuspendModal(false);
      setSelectedMotif("");
      setCustomMotif("");
      setSelectedProprietaire(null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suspension");
    }
  };

  const handleReactiverProprietaire = async () => {
    if (!selectedProprietaire) return;

    try {
      await reactiverProprietaire.mutateAsync({
        id: selectedProprietaire.id,
        afficherAnnonces: true,
      });
      toast.success("Propriétaire réactivé avec succès");
      setShowReactiverModal(false);
      setSelectedProprietaire(null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la réactivation");
    }
  };

  const handleSupprimerProprietaire = async () => {
    if (!selectedProprietaire) return;

    try {
      await supprimerProprietaire.mutateAsync(selectedProprietaire.id);
      toast.success("Propriétaire supprimé avec succès");
      setShowSupprimerModal(false);
      setSelectedProprietaire(null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    }
  };

  const handleSuspendreLocataire = async () => {
    const motif = selectedMotif === "autre" ? customMotif : selectedMotif;
    if (!motif) {
      toast.error("Veuillez sélectionner ou saisir un motif de suspension");
      return;
    }

    if (!selectedLocataire) return;

    try {
      await suspendreLocataire.mutateAsync({
        id: selectedLocataire.id,
        motif,
      });
      toast.success("Locataire suspendu avec succès");
      setShowSuspendModal(false);
      setSelectedMotif("");
      setCustomMotif("");
      setSelectedLocataire(null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suspension");
    }
  };

  const handleReactiverLocataire = async () => {
    if (!selectedLocataire) return;

    try {
      await reactiverLocataire.mutateAsync(selectedLocataire.id);
      toast.success("Locataire réactivé avec succès");
      setShowReactiverModal(false);
      setSelectedLocataire(null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la réactivation");
    }
  };

  const handleSupprimerLocataire = async () => {
    if (!selectedLocataire) return;

    try {
      await supprimerLocataire.mutateAsync(selectedLocataire.id);
      toast.success("Locataire supprimé avec succès");
      setShowSupprimerModal(false);
      setSelectedLocataire(null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    }
  };

  const openSuspendModal = (item: Proprietaire | Locataire) => {
    if (userType === "proprietaires") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowSuspendModal(true);
  };

  const openReactiverModal = (item: Proprietaire | Locataire) => {
    if (userType === "proprietaires") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowReactiverModal(true);
  };

  const openSupprimerModal = (item: Proprietaire | Locataire) => {
    if (userType === "proprietaires") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowSupprimerModal(true);
  };

  const openDetailsModal = (item: Proprietaire | Locataire) => {
    if (userType === "proprietaires") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowDetailsModal(true);
  };

  const toggleContract = (contractId: string) => {
    setExpandedContracts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  // Fonction pour supprimer les balises HTML du contenu du contrat
  const stripHtml = (html: string | null): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  };

  const proprietairesSuspendus = proprietaires.filter((p) => p.estSuspendu);
  const locataireSuspendus = locataires.filter((l) => l.estSuspendu);

  const renderTableHeader = () => (
    <tr>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
        {userType === "proprietaires" ? "Propriétaire" : "Locataire"}
      </th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Statut</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Créé le</th>
      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
    </tr>
  );

  const renderProprietaireRow = (p: Proprietaire) => (
    <tr key={p.id} className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              p.estSuspendu ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {p.estSuspendu ? (
              <UserX className="w-5 h-5 text-red-600" />
            ) : (
              <Building2 className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#0C1A35]">
              {p.prenom} {p.nom}
            </p>
            <p className="text-sm text-slate-500">ID: {p.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-[#0C1A35]">{p.telephone}</p>
        <p className="text-sm text-slate-500">{p.email || "-"}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            p.estSuspendu ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {p.estSuspendu ? "Suspendu" : "Actif"}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-600">
          {new Date(p.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openDetailsModal(p)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          {p.estSuspendu ? (
            <button
              onClick={() => openReactiverModal(p)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Réactiver"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => openSuspendModal(p)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Suspendre"
            >
              <UserX className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openSupprimerModal(p)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderLocataireRow = (l: Locataire) => (
    <tr key={l.id} className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              l.estSuspendu ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {l.estSuspendu ? (
              <UserX className="w-5 h-5 text-red-600" />
            ) : (
              <User className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#0C1A35]">
              {l.prenom} {l.nom}
            </p>
            <p className="text-sm text-slate-500">ID: {l.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-[#0C1A35]">{l.telephone}</p>
        <p className="text-sm text-slate-500">{l.email || "-"}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            l.estSuspendu ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {l.estSuspendu ? "Suspendu" : "Actif"}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-600">
          {new Date(l.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/locataires/${l.id}/documents`)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voir les documents"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDetailsModal(l)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          {l.estSuspendu ? (
            <button
              onClick={() => openReactiverModal(l)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Réactiver"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => openSuspendModal(l)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Suspendre"
            >
              <UserX className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openSupprimerModal(l)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0C1A35]/10 flex items-center justify-center">
            {userType === "proprietaires" ? (
              <Building2 className="w-6 h-6 text-[#0C1A35]" />
            ) : (
              <User className="w-6 h-6 text-[#0C1A35]" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0C1A35]">
              {userType === "proprietaires" ? "Propriétaire" : "Locataire"}
            </h1>
            <p className="text-slate-500 mt-1">
              {userType === "proprietaires" 
                ? `${proprietairesSuspendus.length} suspendu(s) / ${proprietaires.length} propriétaires`
                : `${locataireSuspendus.length} suspendu(s) / ${locataires.length} locataires`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20 focus:border-[#D4A843]"
        />
      </div>

      {/* Liste des utilisateurs */}
      {userType === "proprietaires" ? (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loadingProprietaires ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">{renderTableHeader()}</thead>
              <tbody className="divide-y divide-slate-100">
                {proprietaires.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Aucun propriétaire trouvé
                    </td>
                  </tr>
                ) : (
                  proprietaires.map(renderProprietaireRow)
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loadingLocataires ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">{renderTableHeader()}</thead>
              <tbody className="divide-y divide-slate-100">
                {locataires.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Aucun locataire trouvé
                    </td>
                  </tr>
                ) : (
                  locataires.map(renderLocataireRow)
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal de suspension */}
      <ConfirmModal
        open={showSuspendModal}
        title={`Suspendre ${
          selectedProprietaire
            ? `${selectedProprietaire.prenom} ${selectedProprietaire.nom}`
            : selectedLocataire
            ? `${selectedLocataire.prenom} ${selectedLocataire.nom}`
            : "le compte"
        }`}
        message={
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Veuillez sélectionner le motif de suspension :
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(userType === "locataires" ? SUSPENSION_MOTIFS_LOCATAIRE : SUSPENSION_MOTIFS_PROPRIETAIRE).map((motif) => (
                <label
                  key={motif}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="motif"
                    value={motif}
                    checked={selectedMotif === motif}
                    onChange={(e) => setSelectedMotif(e.target.value)}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">{motif}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <input
                  type="radio"
                  name="motif"
                  value="autre"
                  checked={selectedMotif === "autre"}
                  onChange={(e) => setSelectedMotif(e.target.value)}
                  className="w-4 h-4 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm text-slate-700">Autre motif</span>
              </label>
              {selectedMotif === "autre" && (
                <input
                  type="text"
                  value={customMotif}
                  onChange={(e) => setCustomMotif(e.target.value)}
                  placeholder="Saisissez le motif..."
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                Cette action empêchera l'utilisateur d'utiliser la plateforme.
              </p>
            </div>
          </div>
        }
        confirmLabel="Confirmer la suspension"
        cancelLabel="Annuler"
        variant="danger"
        isPending={isPending}
        onConfirm={
          userType === "proprietaires" ? handleSuspendreProprietaire : handleSuspendreLocataire
        }
        onCancel={() => {
          setShowSuspendModal(false);
          setSelectedMotif("");
          setCustomMotif("");
          setSelectedProprietaire(null);
          setSelectedLocataire(null);
        }}
      />

      {/* Modal de réactivation */}
      <ConfirmModal
        open={showReactiverModal}
        title={`Réactiver ${
          selectedProprietaire
            ? `${selectedProprietaire.prenom} ${selectedProprietaire.nom}`
            : selectedLocataire
            ? `${selectedLocataire.prenom} ${selectedLocataire.nom}`
            : "le compte"
        }`}
        message={
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Êtes-vous sûr de vouloir réactiver ce compte ? L'utilisateur pourra à nouveau utiliser
              la plateforme.
            </p>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Les annonces du propriétaire seront automatiquement remises en ligne.
              </p>
            </div>
          </div>
        }
        confirmLabel="Confirmer la réactivation"
        cancelLabel="Annuler"
        variant="warning"
        isPending={isPending}
        onConfirm={
          userType === "proprietaires" ? handleReactiverProprietaire : handleReactiverLocataire
        }
        onCancel={() => {
          setShowReactiverModal(false);
          setSelectedProprietaire(null);
          setSelectedLocataire(null);
        }}
      />

      {/* Modal de suppression */}
      <ConfirmModal
        open={showSupprimerModal}
        title={`Supprimer ${
          selectedProprietaire
            ? `${selectedProprietaire.prenom} ${selectedProprietaire.nom}`
            : selectedLocataire
            ? `${selectedLocataire.prenom} ${selectedLocataire.nom}`
            : "le compte"
        }`}
        message={
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.
            </p>
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">
                Cette action supprimera définitivement toutes les données associées.
              </p>
            </div>
          </div>
        }
        confirmLabel="Confirmer la suppression"
        cancelLabel="Annuler"
        variant="danger"
        isPending={isPending}
        onConfirm={
          userType === "proprietaires" ? handleSupprimerProprietaire : handleSupprimerLocataire
        }
        onCancel={() => {
          setShowSupprimerModal(false);
          setSelectedProprietaire(null);
          setSelectedLocataire(null);
        }}
      />

      {/* Modal de détails */}
      {showDetailsModal && (selectedProprietaire || selectedLocataire) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0C1A35]">Détails</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProprietaire(null);
                  setSelectedLocataire(null);
                  setExpandedContracts(new Set());
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userType === "proprietaires" && proprietaireDetails?.data ? (
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-[#0C1A35] mb-3">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Nom complet</p>
                      <p className="font-medium text-[#0C1A35]">
                        {proprietaireDetails.data.prenom} {proprietaireDetails.data.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Téléphone</p>
                      <p className="font-medium text-[#0C1A35]">
                        {proprietaireDetails.data.telephone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-[#0C1A35]">
                        {proprietaireDetails.data.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Statut</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          proprietaireDetails.data.estSuspendu
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {proprietaireDetails.data.estSuspendu ? "Suspendu" : "Actif"}
                      </span>
                    </div>
                    {proprietaireDetails.data.estSuspendu && (
                      <>
                        <div>
                          <p className="text-sm text-slate-500">Motif de suspension</p>
                          <p className="font-medium text-red-600">
                            {proprietaireDetails.data.motifSuspension || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Date de suspension</p>
                          <p className="font-medium text-[#0C1A35]">
                            {proprietaireDetails.data.dateSuspension
                              ? new Date(proprietaireDetails.data.dateSuspension).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-slate-500">Date de création</p>
                      <p className="font-medium text-[#0C1A35]">
                        {new Date(proprietaireDetails.data.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Biens/Logements */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-[#0C1A35] mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Biens ({proprietaireDetails.data.biens.length})
                  </h3>
                  {proprietaireDetails.data.biens.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun bien enregistré</p>
                  ) : (
                    <div className="space-y-3">
                      {proprietaireDetails.data.biens.map((bien) => (
                        <div
                          key={bien.id}
                          className="bg-white rounded-lg p-3 border border-slate-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-[#0C1A35]">{bien.titre || "Sans titre"}</p>
                              <p className="text-sm text-slate-500">
                                {[bien.quartier, bien.ville, bien.pays].filter(Boolean).join(", ") || "-"}
                              </p>
                              <p className="text-sm text-slate-500">{bien.adresse || "-"}</p>
                              <p className="text-xs text-slate-400">
                                Région: {bien.region || "-"}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {bien.typeLogement && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {bien.typeLogement}
                                  </span>
                                )}
                                {bien.typeTransaction && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                                    {bien.typeTransaction}
                                  </span>
                                )}
                                {bien.statutAnnonce && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                    {bien.statutAnnonce}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                                <p>Prix: {bien.prix != null ? `${bien.prix.toLocaleString("fr-FR")} FCFA` : "-"}</p>
                                <p>Surface: {bien.surface != null ? `${bien.surface} m²` : "-"}</p>
                                <p>Chambres: {bien.nbChambres ?? "-"}</p>
                                <p>SDB: {bien.nbSdb ?? "-"}</p>
                                <p>Pièces: {bien.nbPieces ?? "-"}</p>
                                <p>Statut bien: {bien.statutBien || "-"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  bien.actif
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {bien.actif ? "Actif" : "Inactif"}
                              </span>
                              <p className="text-xs text-slate-500 mt-1">{bien.statut || "-"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : userType === "locataires" && locataireDetails?.data ? (
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-[#0C1A35] mb-3">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Nom complet</p>
                      <p className="font-medium text-[#0C1A35]">
                        {locataireDetails.data.prenom} {locataireDetails.data.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Téléphone</p>
                      <p className="font-medium text-[#0C1A35]">
                        {locataireDetails.data.telephone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-[#0C1A35]">
                        {locataireDetails.data.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Statut</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          locataireDetails.data.estSuspendu
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {locataireDetails.data.estSuspendu ? "Suspendu" : "Actif"}
                      </span>
                    </div>
                    {locataireDetails.data.estSuspendu && (
                      <>
                        <div>
                          <p className="text-sm text-slate-500">Motif de suspension</p>
                          <p className="font-medium text-red-600">
                            {locataireDetails.data.motifSuspension || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Date de suspension</p>
                          <p className="font-medium text-[#0C1A35]">
                            {locataireDetails.data.dateSuspension
                              ? new Date(locataireDetails.data.dateSuspension).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-slate-500">Date de création</p>
                      <p className="font-medium text-[#0C1A35]">
                        {new Date(locataireDetails.data.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations du propriétaire */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-[#0C1A35] mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Propriétaire (Créateur du compte)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Nom complet</p>
                      <p className="font-medium text-[#0C1A35]">
                        {locataireDetails.data.proprietaire.prenom} {locataireDetails.data.proprietaire.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Téléphone</p>
                      <p className="font-medium text-[#0C1A35]">
                        {locataireDetails.data.proprietaire.telephone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-[#0C1A35]">
                        {locataireDetails.data.proprietaire.email || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baux/Logements */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-[#0C1A35] mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Baux ({locataireDetails.data.bails.length})
                  </h3>
                  {locataireDetails.data.bails.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun bail enregistré</p>
                  ) : (
                    <div className="space-y-3">
                      {locataireDetails.data.bails.map((bail) => (
                        <div
                          key={bail.id}
                          className="bg-white rounded-lg p-3 border border-slate-200"
                        >
                          {/* Informations du bail */}
                          <div className="mb-3 pb-3 border-b border-slate-100">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    bail.statut === "ACTIF"
                                      ? "bg-green-100 text-green-700"
                                      : bail.statut === "EN_ATTENTE"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {bail.statut === "ACTIF" ? "Actif" : bail.statut === "EN_ATTENTE" ? "En attente" : bail.statut === "TERMINE" ? "Terminé" : bail.statut === "RESILIE" ? "Résilié" : bail.statut}
                                </span>
                                {bail.typeBail && (
                                  <span className="ml-2 text-xs text-slate-500">
                                    ({bail.typeBail})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {bail.dateDebutBail
                                  ? `Du ${new Date(bail.dateDebutBail).toLocaleDateString("fr-FR")}`
                                  : ""}
                                {bail.dateFinBail
                                  ? ` au ${new Date(bail.dateFinBail).toLocaleDateString("fr-FR")}`
                                  : ""}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {bail.montantLoyer && (
                                <div>
                                  <p className="text-slate-500">Loyer</p>
                                  <p className="font-medium text-[#0C1A35]">
                                    {bail.montantLoyer.toLocaleString("fr-FR")} €/mois
                                  </p>
                                </div>
                              )}
                              {bail.montantCaution && (
                                <div>
                                  <p className="text-slate-500">Caution</p>
                                  <p className="font-medium text-[#0C1A35]">
                                    {bail.montantCaution.toLocaleString("fr-FR")} €
                                    {bail.cautionVersee ? " (versée)" : " (non versée)"}
                                  </p>
                                </div>
                              )}
                              {bail.frequencePaiement && (
                                <div>
                                  <p className="text-slate-500">Fréquence</p>
                                  <p className="font-medium text-[#0C1A35]">
                                    {bail.frequencePaiement === "MENSUEL" ? "Mensuel" : bail.frequencePaiement === "TRIMESTRIEL" ? "Trimestriel" : bail.frequencePaiement === "ANNUEL" ? "Annuel" : bail.frequencePaiement}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informations du bien */}
                          {bail.bien ? (
                            <div>
                              <h4 className="font-medium text-[#0C1A35] mb-2">Informations du bien</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Titre</p>
                                  <p className="font-medium text-[#0C1A35]">{bail.bien.titre || "-"}</p>
                                </div>
                                {bail.bien.typeLogement && (
                                  <div>
                                    <p className="text-slate-500">Type</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.typeLogement.nom}</p>
                                  </div>
                                )}
                                {bail.bien.typeTransaction && (
                                  <div>
                                    <p className="text-slate-500">Transaction</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.typeTransaction.nom}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-slate-500">Pays</p>
                                  <p className="font-medium text-[#0C1A35]">{bail.bien.pays || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Région</p>
                                  <p className="font-medium text-[#0C1A35]">{bail.bien.region || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Ville</p>
                                  <p className="font-medium text-[#0C1A35]">{bail.bien.ville || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Quartier</p>
                                  <p className="font-medium text-[#0C1A35]">{bail.bien.quartier || "-"}</p>
                                </div>
                                {bail.bien.quartierRel && (
                                  <>
                                    <div>
                                      <p className="text-slate-500">Quartier (localité)</p>
                                      <p className="font-medium text-[#0C1A35]">{bail.bien.quartierRel.nom}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500">Ville (localité)</p>
                                      <p className="font-medium text-[#0C1A35]">{bail.bien.quartierRel.ville.nom}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500">Pays (localité)</p>
                                      <p className="font-medium text-[#0C1A35]">{bail.bien.quartierRel.ville.pays.nom}</p>
                                    </div>
                                  </>
                                )}
                                <div>
                                  <p className="text-slate-500">Adresse</p>
                                  <p className="font-medium text-[#0C1A35]">{bail.bien.adresse || "-"}</p>
                                </div>
                                {bail.bien.surface && (
                                  <div>
                                    <p className="text-slate-500">Surface</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.surface} m²</p>
                                  </div>
                                )}
                                {bail.bien.nbChambres !== null && (
                                  <div>
                                    <p className="text-slate-500">Chambres</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.nbChambres}</p>
                                  </div>
                                )}
                                {bail.bien.nbSdb !== null && (
                                  <div>
                                    <p className="text-slate-500">Salles de bain</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.nbSdb}</p>
                                  </div>
                                )}
                                {bail.bien.nbPieces !== null && (
                                  <div>
                                    <p className="text-slate-500">Pièces</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.nbPieces}</p>
                                  </div>
                                )}
                                {bail.bien.etage !== null && (
                                  <div>
                                    <p className="text-slate-500">Étage</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.etage}</p>
                                  </div>
                                )}
                                {bail.bien.statutBien && (
                                  <div>
                                    <p className="text-slate-500">Statut du bien</p>
                                    <p className="font-medium text-[#0C1A35]">{bail.bien.statutBien.nom}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Bien supprimé</p>
                          )}

                          {/* Informations du contrat */}
                          {bail.contrat && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-[#0C1A35]">Contrat</h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    bail.contrat.statut === "ACTIF"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {bail.contrat.statut === "ACTIF" ? "Actif" : bail.contrat.statut === "BROUILLON" ? "Brouillon" : bail.contrat.statut === "ARCHIVE" ? "Archivé" : bail.contrat.statut}
                                </span>
                              </div>
                              <div className="text-sm">
                                <p className="text-slate-500 mb-1">Titre: <span className="text-[#0C1A35]">{bail.contrat.titre || "-"}</span></p>
                                <p className="text-slate-500 mb-1">Créé le: <span className="text-[#0C1A35]">{new Date(bail.contrat.createdAt).toLocaleDateString("fr-FR")}</span></p>
                                {bail.contrat.contenu && (
                                  <button
                                    onClick={() => toggleContract(bail.contrat!.id)}
                                    className="mt-2 text-sm text-[#D4A843] hover:text-[#B8922F] font-medium flex items-center gap-1"
                                  >
                                    {expandedContracts.has(bail.contrat.id) ? (
                                      <>
                                        <Eye className="w-4 h-4" />
                                        Masquer le contrat
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4" />
                                        Voir le contrat
                                      </>
                                    )}
                                  </button>
                                )}
                                {expandedContracts.has(bail.contrat.id) && bail.contrat.contenu && (
                                  <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-[#0C1A35] max-h-40 overflow-y-auto whitespace-pre-wrap">
                                    {stripHtml(bail.contrat.contenu)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
