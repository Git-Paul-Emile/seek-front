import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getEtatsDesLieuxByBailOwner, EtatDesLieux } from "@/api/etatDesLieux.api";
import { toast } from "sonner";
import { PlusCircle, Search, Eye, Edit, CheckCircle } from "lucide-react";

const EtatDesLieuxList = () => {
  const { bailId } = useParams<{ bailId: string }>();
  const [edls, setEdls] = useState<EtatDesLieux[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bailId) fetchEDLs();
  }, [bailId]);

  const fetchEDLs = async () => {
    try {
      setLoading(true);
      const data = await getEtatsDesLieuxByBailOwner(bailId!);
      setEdls(data);
    } catch (e: any) {
      toast.error("Erreur lors du chargement", {
        description: e.response?.data?.message || "Erreur système",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasEntree = edls.some(e => e.type === "ENTREE");
  const hasSortie = edls.some(e => e.type === "SORTIE");

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">États des Lieux</h1>
          <p className="text-gray-500">Gérez les états des lieux d'entrée et de sortie du bail.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/owner/bails/${bailId}/etats-des-lieux/comparaison`}>
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Comparer (Entrée vs Sortie)
            </Button>
          </Link>
          {!hasEntree && (
            <Link to={`/owner/bails/${bailId}/etats-des-lieux/creer?type=ENTREE`}>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> Nouvel EDL (Entrée)
              </Button>
            </Link>
          )}
          {hasEntree && !hasSortie && (
            <Link to={`/owner/bails/${bailId}/etats-des-lieux/creer?type=SORTIE`}>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="h-4 w-4" /> Nouvel EDL (Sortie)
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border">
        {edls.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            Aucun état des lieux pour ce bail.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {edls.map(edl => (
                <tr key={edl.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    EDL - {edl.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      edl.statut === 'VALIDE' ? 'bg-green-50 text-green-700 border-green-200' :
                      edl.statut === 'EN_ATTENTE_VALIDATION' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      edl.statut === 'CONTESTE' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {edl.statut.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(edl.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link to={`/owner/etats-des-lieux/${edl.id}`}>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                          {edl.statut === 'BROUILLON' || edl.statut === 'CONTESTE' ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </Link>
                      {edl.documentPdf && (
                        <a href={edl.documentPdf} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-indigo-600">
                           <CheckCircle className="w-4 h-4" /> PDF
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EtatDesLieuxList;
