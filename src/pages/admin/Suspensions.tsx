import { useState, useMemo } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  UserX,
  UserCheck,
  AlertTriangle,
  Search,
  Loader2,
  Building2,
  User,
  Eye,
  X,
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
} from "@/hooks/useSuspension";

// Motifs de suspension standards
const SUSPENSION_MOTIFS = [
  "Fraude ou activité illégale",
  "Non-respect des conditions d'utilisation",
  "Annonces trompeuses ou frauduleuses",
  "Comportement agressif envers les utilisateurs",
  "Non-paiement répété",
  "Violation de la politique de confidentialité",
  "Usurpation d'identité",
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

export default function SuspensionsPage() {
  const [activeTab, setActiveTab] = useState<"proprietaires" | "locataires">("proprietaires");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSuspendu, setFilterSuspendu] = useState<boolean | undefined>(undefined);
  const [selectedProprietaire, setSelectedProprietaire] = useState<Proprietaire | null>(null);
  const [selectedLocataire, setSelectedLocataire] = useState<Locataire | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactiverModal, setShowReactiverModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMotif, setSelectedMotif] = useState("");
  const [customMotif, setCustomMotif] = useState("");

  // Charger les données depuis l'API
  const { data: proprietairesData, isLoading: loadingProprietaires } = useProprietaires({
    estSuspendu: filterSuspendu,
    search: searchTerm || undefined,
  });

  const { data: locatairesData, isLoading: loadingLocataires } = useLocataires({
    estSuspendu: filterSuspendu,
    search: searchTerm || undefined,
  });

  // Mutations
  const suspendreProprietaire = useSuspendreProprietaire();
  const reactiverProprietaire = useReactiverProprietaire();
  const suspendreLocataire = useSuspendreLocataire();
  const reactiverLocataire = useReactiverLocataire();

  // Extraire les données avec useMemo pour éviter les dépendances changeantes
  const proprietaires = useMemo(
    () => proprietairesData?.data || [],
    [proprietairesData?.data]
  );
  const locataires = useMemo(
    () => locatairesData?.data || [],
    [locatairesData?.data]
  );

  // Filtrer les utilisateurs suspendus ou actifs selon le filtre
  const proprietairesAffiches = useMemo(() => {
    if (filterSuspendu === undefined) return proprietaires;
    return proprietaires.filter((p) => p.estSuspendu === filterSuspendu);
  }, [proprietaires, filterSuspendu]);

  const locatairesAffiches = useMemo(() => {
    if (filterSuspendu === undefined) return locataires;
    return locataires.filter((l) => l.estSuspendu === filterSuspendu);
  }, [locataires, filterSuspendu]);

  const proprietairesSuspendus = proprietaires.filter((p) => p.estSuspendu);
  const locataireSuspendus = locataires.filter((l) => l.estSuspendu);

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

  const openSuspendModal = (type: "proprietaire" | "locataire", item: Proprietaire | Locataire) => {
    if (type === "proprietaire") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowSuspendModal(true);
  };

  const openReactiverModal = (type: "proprietaire" | "locataire", item: Proprietaire | Locataire) => {
    if (type === "proprietaire") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowReactiverModal(true);
  };

  const openDetailsModal = (type: "proprietaire" | "locataire", item: Proprietaire | Locataire) => {
    if (type === "proprietaire") {
      setSelectedProprietaire(item as Proprietaire);
      setSelectedLocataire(null);
    } else {
      setSelectedLocataire(item as Locataire);
      setSelectedProprietaire(null);
    }
    setShowDetailsModal(true);
  };

  const isPending =
    suspendreProprietaire.isPending ||
    reactiverProprietaire.isPending ||
    suspendreLocataire.isPending ||
    reactiverLocataire.isPending;

  const renderTableHeader = () => (
    <tr>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
        {activeTab === "proprietaires" ? "Propriétaire" : "Locataire"}
      </th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Statut</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
        {filterSuspendu ? "Motif" : "Dernière suspension"}
      </th>
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
            p.estSuspendu
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {p.estSuspendu ? "Suspendu" : "Actif"}
        </span>
      </td>
      <td className="px-6 py-4">
        {filterSuspendu ? (
          <p className="text-sm text-red-600 font-medium">{p.motifSuspension || "-"}</p>
        ) : (
          <p className="text-sm text-slate-600">
            {p.dateSuspension
              ? new Date(p.dateSuspension).toLocaleDateString("fr-FR")
              : "-"}
          </p>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openDetailsModal("proprietaire", p)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          {p.estSuspendu ? (
            <button
              onClick={() => openReactiverModal("proprietaire", p)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Réactiver
            </button>
          ) : (
            <button
              onClick={() => openSuspendModal("proprietaire", p)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <UserX className="w-4 h-4" />
              Suspendre
            </button>
          )}
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
            l.estSuspendu
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {l.estSuspendu ? "Suspendu" : "Actif"}
        </span>
      </td>
      <td className="px-6 py-4">
        {filterSuspendu ? (
          <p className="text-sm text-red-600 font-medium">{l.motifSuspension || "-"}</p>
        ) : (
          <p className="text-sm text-slate-600">
            {l.dateSuspension
              ? new Date(l.dateSuspension).toLocaleDateString("fr-FR")
              : "-"}
          </p>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openDetailsModal("locataire", l)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          {l.estSuspendu ? (
            <button
              onClick={() => openReactiverModal("locataire", l)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Réactiver
            </button>
          ) : (
            <button
              onClick={() => openSuspendModal("locataire", l)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <UserX className="w-4 h-4" />
              Suspendre
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Suspensions" }]} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0C1A35]">Gestion des suspensions</h1>
            <p className="text-slate-500 mt-1">Suspendre ou réactiver des comptes</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("proprietaires")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "proprietaires"
              ? "bg-[#0C1A35] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Propriétaires
          <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {proprietairesSuspendus.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("locataires")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "locataires"
              ? "bg-[#0C1A35] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <User className="w-4 h-4" />
          Locataires
          <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {locataireSuspendus.length}
          </span>
        </button>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20 focus:border-[#D4A843]"
          />
        </div>
        <select
          value={filterSuspendu === undefined ? "" : filterSuspendu.toString()}
          onChange={(e) =>
            setFilterSuspendu(
              e.target.value === "" ? undefined : e.target.value === "true"
            )
          }
          className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20 focus:border-[#D4A843]"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Suspendus uniquement</option>
          <option value="false">Actifs uniquement</option>
        </select>
      </div>

      {/* Liste des utilisateurs */}
      {activeTab === "proprietaires" ? (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loadingProprietaires ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">{renderTableHeader()}</thead>
              <tbody className="divide-y divide-slate-100">
                {proprietairesAffiches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Aucun propriétaire trouvé
                    </td>
                  </tr>
                ) : (
                  proprietairesAffiches.map(renderProprietaireRow)
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
                {locatairesAffiches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Aucun locataire trouvé
                    </td>
                  </tr>
                ) : (
                  locatairesAffiches.map(renderLocataireRow)
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
              {SUSPENSION_MOTIFS.map((motif) => (
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
          activeTab === "proprietaires"
            ? handleSuspendreProprietaire
            : handleSuspendreLocataire
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
              Êtes-vous sûr de vouloir réactiver ce compte ? L'utilisateur pourra à nouveau utiliser la plateforme.
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
          activeTab === "proprietaires"
            ? handleReactiverProprietaire
            : handleReactiverLocataire
        }
        onCancel={() => {
          setShowReactiverModal(false);
          setSelectedProprietaire(null);
          setSelectedLocataire(null);
        }}
      />

      {/* Modal de détails */}
      {showDetailsModal && (selectedProprietaire || selectedLocataire) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0C1A35]">Détails</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProprietaire(null);
                  setSelectedLocataire(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedProprietaire ? (
                <>
                  <div>
                    <p className="text-sm text-slate-500">Nom complet</p>
                    <p className="font-medium text-[#0C1A35]">
                      {selectedProprietaire.prenom} {selectedProprietaire.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Téléphone</p>
                    <p className="font-medium text-[#0C1A35]">
                      {selectedProprietaire.telephone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-[#0C1A35]">
                      {selectedProprietaire.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Statut</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProprietaire.estSuspendu
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedProprietaire.estSuspendu ? "Suspendu" : "Actif"}
                    </span>
                  </div>
                  {selectedProprietaire.estSuspendu && (
                    <>
                      <div>
                        <p className="text-sm text-slate-500">Motif de suspension</p>
                        <p className="font-medium text-red-600">
                          {selectedProprietaire.motifSuspension || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Date de suspension</p>
                        <p className="font-medium text-[#0C1A35]">
                          {selectedProprietaire.dateSuspension
                            ? new Date(selectedProprietaire.dateSuspension).toLocaleDateString(
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
                      {new Date(selectedProprietaire.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </>
              ) : selectedLocataire ? (
                <>
                  <div>
                    <p className="text-sm text-slate-500">Nom complet</p>
                    <p className="font-medium text-[#0C1A35]">
                      {selectedLocataire.prenom} {selectedLocataire.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Téléphone</p>
                    <p className="font-medium text-[#0C1A35]">
                      {selectedLocataire.telephone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-[#0C1A35]">
                      {selectedLocataire.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Statut</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedLocataire.estSuspendu
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedLocataire.estSuspendu ? "Suspendu" : "Actif"}
                    </span>
                  </div>
                  {selectedLocataire.estSuspendu && (
                    <>
                      <div>
                        <p className="text-sm text-slate-500">Motif de suspension</p>
                        <p className="font-medium text-red-600">
                          {selectedLocataire.motifSuspension || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Date de suspension</p>
                        <p className="font-medium text-[#0C1A35]">
                          {selectedLocataire.dateSuspension
                            ? new Date(selectedLocataire.dateSuspension).toLocaleDateString(
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
                      {new Date(selectedLocataire.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
