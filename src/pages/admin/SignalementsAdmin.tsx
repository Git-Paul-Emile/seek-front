import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SkTableRows } from "@/components/ui/Skeleton";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import {
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Building2,
  X,
  Phone,
} from "lucide-react";

import {
  fetchSignalementsAdmin,
  validerSignalement,
  rejeterSignalement,
  type Signalement,
  type StatutSignalement,
} from "@/api/signalement";

const MOTIFS_LABELS: Record<string, string> = {
  ARNAQUE: "Arnaque / Fraude",
  FAUSSES_INFOS: "Fausses informations",
  INDISPONIBLE: "Annonce indisponible",
  DOUBLON: "Annonce en doublon",
  INAPPROPRIE: "Contenu inapproprié",
  AUTRE: "Autre",
};

export default function SignalementsAdmin() {
  const [activeTab, setActiveTab] = useState<StatutSignalement>("EN_ATTENTE");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);
  const [showValiderModal, setShowValiderModal] = useState(false);
  const [showRejeterModal, setShowRejeterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: signalements = [], isLoading } = useQuery({
    queryKey: ["admin-signalements", activeTab, searchTerm],
    queryFn: () => fetchSignalementsAdmin({ statut: activeTab, search: searchTerm }),
  });

  const validerMutation = useMutation({
    mutationFn: (id: string) => validerSignalement(id),
    onSuccess: () => {
      toast.success("Signalement validé avec succès. Des avertissements ont été envoyés.");
      queryClient.invalidateQueries({ queryKey: ["admin-signalements"] });
      setShowValiderModal(false);
      setSelectedSignalement(null);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la validation du signalement.");
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: (id: string) => rejeterSignalement(id),
    onSuccess: () => {
      toast.success("Signalement rejeté avec succès.");
      queryClient.invalidateQueries({ queryKey: ["admin-signalements"] });
      setShowRejeterModal(false);
      setSelectedSignalement(null);
    },
    onError: (error: any) => {
      toast.error("Erreur lors du rejet du signalement.");
    },
  });

  const handleValider = () => {
    if (selectedSignalement) {
      validerMutation.mutate(selectedSignalement.id);
    }
  };

  const handleRejeter = () => {
    if (selectedSignalement) {
      rejeterMutation.mutate(selectedSignalement.id);
    }
  };

  const openDetails = (s: Signalement) => {
    setSelectedSignalement(s);
    setShowDetailsModal(true);
  };

  const renderTableHeader = () => (
    <tr>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Bien signalé</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Signaleur</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Motif</th>
      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
    </tr>
  );

  const renderRow = (s: Signalement) => (
    <tr key={s.id} className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <a 
              href={`/annonces/${s.bienId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-[#D4A843] hover:underline"
            >
              {s.bien?.titre || "Annonce supprimée"}
            </a>
            {s.bien?.proprietaire && (
              <p className="text-xs text-slate-500 mt-0.5">
                Proprio: {s.bien.proprietaire.prenom} {s.bien.proprietaire.nom} 
                <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-medium">
                  {s.bien.proprietaire.nbSignalementsValides} strike(s)
                </span>
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-[#0C1A35]">{s.nom}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <Phone className="w-3 h-3" />
          {s.telephone}
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-start gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">
            {MOTIFS_LABELS[s.motif] || s.motif}
          </span>
          {s.commentaire && (
            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 cursor-help" title={s.commentaire} />
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-600">
          {format(new Date(s.createdAt), "dd MMM yyyy", { locale: fr })}
        </p>
        <p className="text-xs text-slate-400">
          {format(new Date(s.createdAt), "HH:mm")}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openDetails(s)}
            className="p-2 text-slate-400 hover:text-[#0C1A35] hover:bg-slate-100 rounded-lg transition-colors"
            title="Détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          {activeTab === "EN_ATTENTE" && (
            <>
              <button
                onClick={() => {
                  setSelectedSignalement(s);
                  setShowValiderModal(true);
                }}
                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                title="Valider le signalement"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedSignalement(s);
                  setShowRejeterModal(true);
                }}
                className="p-2 text-slate-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Rejeter (sans suite)"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Signalements" }]} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0C1A35]">Modération des signalements</h1>
            <p className="text-slate-500 mt-1">Examinez les annonces signalées par les utilisateurs</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(["EN_ATTENTE", "VALIDE", "REJETE"] as StatutSignalement[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#0C1A35] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab === "EN_ATTENTE" ? "En attente" : tab === "VALIDE" ? "Validés" : "Rejetés"}
          </button>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par téléphone, nom de signaleur, contenu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20 focus:border-[#D4A843]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <SkTableRows rows={5} />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">{renderTableHeader()}</thead>
            <tbody className="divide-y divide-slate-100">
              {signalements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Aucun signalement trouvé.
                  </td>
                </tr>
              ) : (
                signalements.map(renderRow)
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSignalement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0C1A35] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Détails du Signalement
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Infos Signalement */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Signalement</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Motif</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                      {MOTIFS_LABELS[selectedSignalement.motif] || selectedSignalement.motif}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Commentaire laissé par l'utilisateur :</span>
                    <p className="text-sm text-[#0C1A35] p-3 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap">
                      {selectedSignalement.commentaire || "Aucun commentaire."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Créé le {format(new Date(selectedSignalement.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                  </div>
                </div>
              </div>

              {/* Infos Signaleur */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Signaleur</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Nom</span>
                    <span className="text-sm font-medium text-[#0C1A35]">{selectedSignalement.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Téléphone</span>
                    <span className="text-sm font-medium text-[#0C1A35]">{selectedSignalement.telephone}</span>
                  </div>
                </div>
              </div>

              {/* Infos Bien & Propriétaire */}
              {selectedSignalement.bien && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Annonce Concernée</h3>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-[#0C1A35]">{selectedSignalement.bien.titre}</span>
                      <a href={`/annonces/${selectedSignalement.bien.id}`} target="_blank" className="text-xs text-[#D4A843] block mt-1 hover:underline">Voir l'annonce ↗</a>
                    </div>
                    {selectedSignalement.bien.proprietaire && (
                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-xs text-slate-500 block mb-1">Propriétaire</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#0C1A35]">
                            {selectedSignalement.bien.proprietaire.prenom} {selectedSignalement.bien.proprietaire.nom}
                          </span>
                          <span className="text-xs text-slate-500">{selectedSignalement.bien.proprietaire.telephone}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                          <span>Avertissements: </span>
                          <span className={`px-2 py-0.5 rounded-full ${selectedSignalement.bien.proprietaire.nbSignalementsValides >= 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {selectedSignalement.bien.proprietaire.nbSignalementsValides} / 3
                          </span>
                        </div>
                        {selectedSignalement.bien.proprietaire.estSuspendu && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Propriétaire suspendu
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Valider Modal */}
      <ConfirmModal
        open={showValiderModal}
        title="Valider le signalement"
        message={
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Êtes-vous sûr de vouloir <strong>valider</strong> ce signalement ? Cette action entraînera :
            </p>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Le retrait immédiat de l'annonce visée.</li>
              <li>Un avertissement SMS envoyé au propriétaire.</li>
              <li>L'incrémentation du nombre de sanctions du propriétaire.</li>
              <li>La suspension automatique du propriétaire s'il atteint les 3 sanctions.</li>
              <li>Un SMS informatif de remerciement au signaleur.</li>
            </ul>
          </div>
        }
        confirmLabel="Oui, valider et sanctionner"
        cancelLabel="Annuler"
        variant="danger"
        isPending={validerMutation.isPending}
        onConfirm={handleValider}
        onCancel={() => setShowValiderModal(false)}
      />

      {/* Rejeter Modal */}
      <ConfirmModal
        open={showRejeterModal}
        title="Rejeter le signalement"
        message="Êtes-vous sûr de vouloir classer ce signalement sans suite ? Aucune action ne sera entreprise contre le propriétaire ou l'annonce."
        confirmLabel="Oui, rejeter"
        cancelLabel="Annuler"
        variant="warning"
        isPending={rejeterMutation.isPending}
        onConfirm={handleRejeter}
        onCancel={() => setShowRejeterModal(false)}
      />

    </div>
  );
}
