import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  EtatDesLieux, 
  getComparisonOwner,
  getComparisonLocataire
} from "@/api/etatDesLieux.api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // or whatever gets the role

interface Props {
  role: "PROPRIETAIRE" | "LOCATAIRE";
}

const EtatDesLieuxComparison = ({ role }: Props) => {
  const { bailId } = useParams<{ bailId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [entree, setEntree] = useState<EtatDesLieux | null>(null);
  const [sortie, setSortie] = useState<EtatDesLieux | null>(null);

  useEffect(() => {
    if (bailId) loadComparison();
  }, [bailId]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const data = role === "PROPRIETAIRE" 
        ? await getComparisonOwner(bailId!)
        : await getComparisonLocataire(bailId!);
      
      setEntree(data.entree);
      setSortie(data.sortie);
    } catch (e: any) {
      toast.error("Erreur", { description: "Impossible de charger la comparaison" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  if (!entree || !sortie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
        <div className="mt-8 p-12 text-center text-gray-400 bg-white border rounded-lg shadow-sm">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-gray-700">Comparaison Impossible</h2>
          <p className="mt-2 text-sm">Il faut un état des lieux d'entrée ET un état des lieux de sortie pour effectuer la comparaison.</p>
        </div>
      </div>
    );
  }

  // Helper to find matching element
  const getSortieElement = (pieceNom: string, elementNom: string) => {
    const p = sortie.pieces.find(p => p.nom === pieceNom);
    if (!p) return null;
    return p.elements.find(e => e.nom === elementNom);
  };

  const etatsScore = { "NEUF": 4, "BON": 3, "USAGE": 2, "MAUVAIS": 1, "DEGRADE": 0 };
  const getDifferenceLevel = (eEtat: string, sEtat: string) => {
    const diff = (etatsScore[eEtat as keyof typeof etatsScore] || 0) - (etatsScore[sEtat as keyof typeof etatsScore] || 0);
    if (diff > 0) return "DEGRADE"; // L'état a empiré
    if (diff < 0) return "AMELIORE";
    return "IDENTIQUE";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comparaison des États des Lieux</h1>
          <p className="text-sm text-gray-500">Écarts entre l'Entrée ({new Date(entree.createdAt).toLocaleDateString()}) et la Sortie ({new Date(sortie.createdAt).toLocaleDateString()})</p>
        </div>
      </div>

      <div className="space-y-8">
        {entree.pieces.map((pieceE, pIndex) => (
          <div key={pIndex} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <h2 className="font-bold text-lg text-gray-800">{pieceE.nom}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pieceE.elements.map((elE, eIndex) => {
                const elS = getSortieElement(pieceE.nom, elE.nom);
                const diff = elS ? getDifferenceLevel(elE.etat, elS.etat) : "INCONNU";

                return (
                  <div key={eIndex} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 font-medium text-gray-700">{elE.nom}</div>
                    
                    {/* Colonne Entrée */}
                    <div className="md:col-span-4 p-3 rounded-md bg-blue-50/50 border border-blue-100">
                      <div className="text-xs uppercase text-blue-500 font-bold mb-1">À l'entrée</div>
                      <div className="font-semibold text-gray-800">{elE.etat.replace(/_/g, " ")}</div>
                      {elE.commentaire && <div className="text-sm text-gray-600 mt-1 italic">"{elE.commentaire}"</div>}
                    </div>

                    {/* Colonne Sortie */}
                    <div className="md:col-span-4 p-3 rounded-md border" style={{
                      backgroundColor: diff === 'DEGRADE' ? '#fef2f2' : diff === 'AMELIORE' ? '#f0fdf4' : '#f9fafb',
                      borderColor: diff === 'DEGRADE' ? '#fecaca' : diff === 'AMELIORE' ? '#bbf7d0' : '#e5e7eb'
                    }}>
                      <div className="text-xs uppercase font-bold mb-1" style={{
                        color: diff === 'DEGRADE' ? '#ef4444' : diff === 'AMELIORE' ? '#22c55e' : '#6b7280'
                      }}>À la sortie</div>
                      
                      {elS ? (
                        <>
                          <div className="font-semibold text-gray-800 flex items-center gap-2">
                            {elS.etat.replace(/_/g, " ")}
                            {diff === 'DEGRADE' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {diff === 'AMELIORE' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          {elS.commentaire && <div className="text-sm text-gray-600 mt-1 italic">"{elS.commentaire}"</div>}
                        </>
                      ) : (
                         <div className="text-sm text-gray-500 italic">Non évalué</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Conclusion */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
        <h3 className="font-bold text-indigo-900 mb-2">Conclusion</h3>
        <p className="text-indigo-800 text-sm">
          Ce document de comparaison sert de base pour la restitution du dépôt de garantie. 
          Les dégradations constatées pourront faire l'objet de retenues sur la caution selon les conditions du bail.
        </p>
      </div>
    </div>
  );
};

export default EtatDesLieuxComparison;
