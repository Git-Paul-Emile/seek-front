import { useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Eye,
  X
} from "lucide-react";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useHistoriqueTransactions } from "@/hooks/usePremium";
import type { Transaction } from "@/api/transaction";

export default function HistoriquePaiements() {
  const { owner } = useOwnerAuth();
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const limit = 10;

  const { data, isLoading, error } = useHistoriqueTransactions(
    owner?.id || "",
    page,
    limit
  );

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PAIEMENT_LOYER":
        return <ArrowDownCircle className="w-4 h-4 text-green-600" />;
      case "PAIEMENT_PREMIUM":
      case "PAIEMENT_PROMOTION":
        return <ArrowUpCircle className="w-4 h-4 text-amber-600" />;
      case "REMBOURSEMENT":
        return <ArrowDownCircle className="w-4 h-4 text-blue-600" />;
      case "RESTITUTION_CAUTION":
        return <ArrowUpCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Wallet className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PAIEMENT_LOYER":
        return "Paiement de loyer";
      case "PAIEMENT_PREMIUM":
        return "Mise en avant";
      case "PAIEMENT_PROMOTION":
        return "Promotion";
      case "REMBOURSEMENT":
        return "Remboursement";
      case "RESTITUTION_CAUTION":
        return "Restitution caution";
      default:
        return type;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "CONFIRME":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" /> Confirmé
          </span>
        );
      case "EN_ATTENTE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case "ECHEC":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" /> Échoué
          </span>
        );
      case "ANNULE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <XCircle className="w-3 h-3" /> Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {statut}
          </span>
        );
    }
  };

  const getReference = (item: any) => {
    // Pour les paiements premium, afficher le nom de la formule
    if ((item.type === "PAIEMENT_PREMIUM" || item.type === "PAIEMENT_PROMOTION") && item.metadata?.formuleNom) {
      return item.metadata.formuleNom;
    }
    return item.transactionId || item.id.slice(0, 8);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMontant = (montant: number, type: string) => {
    const isEntree = type === "PAIEMENT_LOYER" || type === "REMBOURSEMENT" || type === "RESTITUTION_CAUTION";
    return (
      <span className={`font-semibold ${isEntree ? "text-green-600" : "text-red-600"}`}>
        {isEntree ? "+" : "-"}{montant.toLocaleString()} F
      </span>
    );
  };

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Veuillez vous connecter pour voir l'historique</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Historique des paiements" }]} />
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
            <Receipt className="w-3.5 h-3.5" />
            Historique
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
            Mes paiements
          </h1>
          <p className="text-slate-400 text-sm">
            Historique de tous vos paiements et revenus
          </p>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Erreur lors du chargement</p>
          <p className="text-red-500 text-sm">Veuillez réessayer plus tard</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center space-y-3">
          <Receipt className="w-12 h-12 mx-auto text-slate-200" />
          <p className="text-[#0C1A35] font-semibold">Aucun paiement</p>
          <p className="text-sm text-slate-400">
            Vous n'avez pas encore de transactions
          </p>
        </div>
      ) : (
        <>
          {/* Liste des transactions */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="text-sm font-medium text-[#0C1A35]">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-500 font-mono">
                          {getReference(item)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {formatMontant(item.montant, item.type)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-600">
                          {item.modePaiement}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.dateInitiation)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatutBadge(item.statut)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedTransaction(item)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#0C1A35] transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Page {pagination.page} sur {pagination.totalPages} 
                ({pagination.total} transaction{pagination.total > 1 ? "s" : ""})
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal détails transaction */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0C1A35]">Détails de la transaction</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">Type</span>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="text-sm font-medium text-[#0C1A35]">
                      {getTypeLabel(selectedTransaction.type)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">Montant</span>
                  {formatMontant(selectedTransaction.montant, selectedTransaction.type)}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">Statut</span>
                  {getStatutBadge(selectedTransaction.statut)}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">Mode de paiement</span>
                  <span className="text-sm font-medium text-[#0C1A35]">
                    {selectedTransaction.modePaiement}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">Date</span>
                  <span className="text-sm font-medium text-[#0C1A35]">
                    {formatDate(selectedTransaction.dateInitiation)}
                  </span>
                </div>

                {selectedTransaction.transactionId && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Référence</span>
                    <span className="text-xs font-mono text-slate-500">
                      {getReference(selectedTransaction)}
                    </span>
                  </div>
                )}

                {selectedTransaction.bien && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Bien</span>
                    <span className="text-sm font-medium text-[#0C1A35]">
                      {selectedTransaction.bien.titre}
                    </span>
                  </div>
                )}

                {selectedTransaction.locataire && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Locataire</span>
                    <span className="text-sm font-medium text-[#0C1A35]">
                      {selectedTransaction.locataire.prenom} {selectedTransaction.locataire.nom}
                    </span>
                  </div>
                )}

                {(selectedTransaction.type === "PAIEMENT_PREMIUM" || selectedTransaction.type === "PAIEMENT_PROMOTION") && selectedTransaction.metadata?.formuleNom && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Formule</span>
                    <span className="text-sm font-medium text-[#0C1A35]">
                      {selectedTransaction.metadata.formuleNom}
                    </span>
                  </div>
                )}

                {(selectedTransaction.type === "PAIEMENT_PREMIUM" || selectedTransaction.type === "PAIEMENT_PROMOTION") && selectedTransaction.metadata?.dureeJours && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Durée</span>
                    <span className="text-sm font-medium text-[#0C1A35]">
                      {selectedTransaction.metadata.dureeJours} jour{selectedTransaction.metadata.dureeJours > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
