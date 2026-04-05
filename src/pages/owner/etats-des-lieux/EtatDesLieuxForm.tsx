import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ImageUpload from "@/components/ui/ImageUpload";
import { 
  EtatDesLieux, 
  PieceEtatDesLieux, 
  ElementEtatDesLieux, 
  TypeEtatDesLieux,
  EtatElement,
  createEtatDesLieux,
  updateEtatDesLieux,
  getEtatDesLieuxOwner,
  getCreationContextOwner,
  submitEtatDesLieux,
  uploadEtatLieuxImage,
  resoudreContestationsProprietaire
} from "@/api/etatDesLieux.api";
import { toast } from "sonner";
import { PlusCircle, Trash2, ArrowLeft, Send, CheckCircle, AlertTriangle, MessageSquareWarning, Loader2 } from "lucide-react";

const ETATS: { value: EtatElement, label: string }[] = [
  { value: "NEUF", label: "Neuf" },
  { value: "BON", label: "Bon État" },
  { value: "USAGE", label: "État d'Usage" },
  { value: "MAUVAIS", label: "Mauvais État" },
  { value: "DEGRADE", label: "Dégradé" },
];

const PIECES_OPTIONS = [
  { value: "Salon", label: "Salon" },
  { value: "Cuisine", label: "Cuisine" },
  { value: "Chambre", label: "Chambre" },
  { value: "Douche", label: "Douche" },
  { value: "WC", label: "WC" },
  { value: "Couloir", label: "Couloir" },
  { value: "Balcon", label: "Balcon" },
  { value: "Terrasse", label: "Terrasse" },
  { value: "Autre", label: "Autre" }
];

const ELEMENTS_OPTIONS = [
  { value: "Murs et Plafonds", label: "Murs et Plafonds" },
  { value: "Sols", label: "Sols" },
  { value: "Plinthes", label: "Plinthes" },
  { value: "Menuiseries (Portes/Fenêtres)", label: "Menuiseries (Portes/Fenêtres)" },
  { value: "Électricité (Prises/Interrupteurs)", label: "Électricité (Prises/Interrupteurs)" },
  { value: "Éclairage (Ampoules/Plafonniers)", label: "Éclairage (Ampoules/Plafonniers)" },
  { value: "Plomberie (Robinet/Évier/Lavabo)", label: "Plomberie (Robinet/Évier/Lavabo)" },
  { value: "Chauffage/Radiateur", label: "Chauffage/Radiateur" },
  { value: "Meubles/Placards", label: "Meubles/Placards" },
  { value: "Électroménager", label: "Électroménager" },
  { value: "Serrurerie/Poignées", label: "Serrurerie/Poignées" },
  { value: "VMC/Aération", label: "VMC/Aération" },
  { value: "Vitres", label: "Vitres" },
  { value: "Autre", label: "Autre" }
];

const ELEMENTS_COMMUNS = [
  "Murs et Plafonds", 
  "Sols", 
  "Menuiseries (Portes/Fenêtres)", 
  "Électricité (Prises/Interrupteurs)", 
  "Plomberie (Robinet/Évier/Lavabo)", 
];

const EtatDesLieuxForm = () => {
  const { id, bailId } = useParams<{ id?: string, bailId?: string }>();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") as TypeEtatDesLieux || "ENTREE";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [edl, setEdl] = useState<EtatDesLieux | null>(null);
  
  // Form State
  const [nbCles, setNbCles] = useState<number>(0);
  const [pieces, setPieces] = useState<PieceEtatDesLieux[]>([]);

  // Resolution state (owner resolving disputes)
  const [resolutions, setResolutions] = useState<Record<string, {
    decision: "RECTIFIER" | "ACCEPTER_RESERVE" | "REFUSER";
    etat?: EtatElement;
    commentaire?: string;
    photos?: string[];
  }>>({});

  useEffect(() => {
    if (id) {
      loadEDL(id);
    } else {
      // Init a default piece with one empty element
      setPieces([{ nom: "Salon", elements: [{ nom: "", etat: "BON", commentaire: "", photos: [] }] }]);
    }
  }, [id]);

  useEffect(() => {
    if (id || !bailId || typeParam !== "SORTIE") {
      return;
    }

    const guardSortieCreation = async () => {
      try {
        const context = await getCreationContextOwner(bailId);
        if (!context.canCreateSortie) {
          toast.error(context.sortieBlockReason || "Cet état des lieux de sortie ne peut pas encore être créé.");
          navigate(`/owner/bails/${bailId}/etats-des-lieux`, { replace: true });
        }
      } catch (e) {
        toast.error("Impossible de vérifier les conditions de sortie.");
        navigate(`/owner/bails/${bailId}/etats-des-lieux`, { replace: true });
      }
    };

    guardSortieCreation();
  }, [id, bailId, navigate, typeParam]);

  const loadEDL = async (edlId: string) => {
    try {
      setLoading(true);
      const data = await getEtatDesLieuxOwner(edlId);
      setEdl(data);
      setNbCles(data.nbCles || 0);
      setPieces(data.pieces || []);
    } catch (e: any) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const addPiece = () => {
    setPieces([...pieces, { nom: "", elements: [{ nom: "", etat: "BON", commentaire: "", photos: [] }] }]);
  };

  const updatePieceNom = (index: number, nom: string) => {
    const newPieces = [...pieces];
    newPieces[index].nom = nom;
    setPieces(newPieces);
  };

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const addElement = (pieceIndex: number, nomElement = "") => {
    const newPieces = [...pieces];
    newPieces[pieceIndex].elements.push({ nom: nomElement, etat: "BON", commentaire: "", photos: [] });
    setPieces(newPieces);
  };

  const prefillElements = (pieceIndex: number) => {
    ELEMENTS_COMMUNS.forEach(el => addElement(pieceIndex, el));
  };

  const updateElement = (pIndex: number, eIndex: number, field: keyof ElementEtatDesLieux, value: any) => {
    const newPieces = [...pieces];
    newPieces[pIndex].elements[eIndex] = { ...newPieces[pIndex].elements[eIndex], [field]: value };
    setPieces(newPieces);
  };

  const removeElement = (pIndex: number, eIndex: number) => {
    const newPieces = [...pieces];
    newPieces[pIndex].elements.splice(eIndex, 1);
    setPieces(newPieces);
  };

  const handleSave = async (submitAfterSave = false) => {
    try {
      setLoading(true);
      const payload = {
        bailId: bailId!,
        type: edl ? edl.type : typeParam,
        nbCles,
        pieces: pieces.map(p => ({
          nom: p.nom,
          elements: p.elements.map(e => ({
            nom: e.nom,
            etat: e.etat,
            commentaire: e.commentaire,
            photos: e.photos,
          }))
        }))
      };

      if (id) {
        await updateEtatDesLieux(id, payload);
        if (submitAfterSave) {
          await submitEtatDesLieux(id);
          toast.success("Envoyé au locataire pour validation !");
          navigate(`/owner/bails/${bailId}/etats-des-lieux`);
        } else {
          toast.success("Enregistré en brouillon !");
          loadEDL(id);
        }
      } else {
        const created = await createEtatDesLieux(payload);
        if (submitAfterSave) {
          await submitEtatDesLieux(created.id);
          toast.success("Créé et envoyé pour validation !");
          navigate(`/owner/bails/${bailId}/etats-des-lieux`);
        } else {
          toast.success("Brouillon créé avec succès !");
          navigate(`/owner/etats-des-lieux/${created.id}`);
        }
      }
    } catch (e: any) {
      const message =
        axios.isAxiosError(e) ? e.response?.data?.message || e.response?.data?.error : null;
      toast.error(message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveContestations = async () => {
    const contestedElements = pieces.flatMap(p => p.elements).filter(e => e.estConteste && e.id);
    const unresolvedIds = contestedElements.filter(e => !resolutions[e.id!]);
    if (unresolvedIds.length > 0) {
      toast.error(`Veuillez traiter les ${unresolvedIds.length} contestation(s) restante(s).`);
      return;
    }
    try {
      setLoading(true);
      const payload = Object.entries(resolutions).map(([elementId, r]) => ({
        elementId,
        decision: r.decision,
        etat: r.etat,
        commentaire: r.commentaire,
        photos: r.photos,
      }));
      await resoudreContestationsProprietaire(id!, payload);
      toast.success("Résolutions envoyées au locataire.");
      setResolutions({});
      loadEDL(id!);
    } catch (e: any) {
      toast.error("Erreur lors de l'envoi des résolutions");
    } finally {
      setLoading(false);
    }
  };

  const setResolution = (elementId: string, decision: "RECTIFIER" | "ACCEPTER_RESERVE" | "REFUSER") => {
    setResolutions(prev => ({ ...prev, [elementId]: { decision } }));
  };

  const isReadonly = edl ? (edl.statut !== "BROUILLON" && edl.statut !== "CONTESTE") : false;
  const isConteste = edl?.statut === "CONTESTE";
  const isLitige = edl?.statut === "EN_LITIGE";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? `État des Lieux (${edl?.type})` : `Nouvel État des Lieux (${typeParam})`}
          </h1>
          {edl && (
            <p className="text-sm text-gray-500">Statut: <span className={`font-semibold ${
              isConteste ? 'text-orange-600' : isLitige ? 'text-red-600' : ''
            }`}>{edl.statut.replace(/_/g, " ")}</span></p>
          )}
        </div>
      </div>

      {isConteste && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Le locataire conteste des éléments</span>
            Vous devez traiter chaque contestation ci-dessous en choisissant de <strong>Rectifier</strong>, émettre une <strong>Note de Réserve</strong>, ou <strong>Refuser</strong>. Attention : un refus placera l'état des lieux en <strong>litige</strong>.
          </div>
        </div>
      )}

      {isLitige && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
          <MessageSquareWarning className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">État des lieux en litige</span>
            Vous avez refusé certaines contestations du locataire. Un médiateur tiers ou un huissier devra intervenir.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Clés</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre de Clés remises</label>
            <Input 
              disabled={isReadonly}
              type="number" 
              value={nbCles} 
              onChange={e => setNbCles(parseInt(e.target.value) || 0)} 
              className="mt-1 max-w-[200px]" 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
           {/* Section infos locataire / bail si besoin */}
           <h2 className="text-lg font-semibold border-b pb-2">Informations</h2>
           <p className="text-sm text-gray-600">Veuillez inspecter chaque pièce du logement et noter l'état des différents éléments (Sols, Murs, Électricité, etc.).</p>
           <p className="text-sm text-gray-600">Une fois terminé, vous pourrez l'envoyer au locataire pour validation.</p>
        </div>
      </div>

      {/* Dispute Resolution Section for Owner */}
      {isConteste && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-orange-900 border-b border-orange-200 pb-2">Contestations du locataire</h2>
          {pieces.map((piece) => {
            const contested = piece.elements.filter(e => e.estConteste);
            if (contested.length === 0) return null;
            return (
              <div key={piece.id || piece.nom} className="bg-white rounded-lg shadow-sm border">
                <div className="bg-orange-50 p-4 border-b font-bold text-lg text-orange-900">{piece.nom}</div>
                <div className="p-4 space-y-4">
                  {contested.map((element) => {
                    const res = resolutions[element.id!];
                    return (
                      <div key={element.id} className="border border-orange-200 rounded-lg overflow-hidden">
                        <div className="bg-orange-50/50 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-semibold text-gray-800">{element.nom}</span>
                            <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{element.etat.replace(/_/g, " ")}</span>
                          </div>
                          <div className="bg-orange-100 rounded p-3 text-sm space-y-2">
                            <div className="font-semibold text-orange-800">Motif du locataire :</div>
                            <p className="text-orange-900">"{element.motifContestation}"</p>
                            {element.photoContestation && (
                              <img src={element.photoContestation} alt="Preuve contestation" className="w-24 h-24 object-cover rounded border border-orange-200 mt-2" crossOrigin="anonymous" />
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-white border-t border-orange-100">
                          <label className="text-sm font-semibold text-gray-600 block mb-2">Votre décision :</label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={res?.decision === "RECTIFIER" ? "default" : "outline"}
                              className={res?.decision === "RECTIFIER" ? "bg-green-600 hover:bg-green-700" : "text-green-700 border-green-200 hover:bg-green-50"}
                              onClick={() => setResolution(element.id!, "RECTIFIER")}
                            >
                              ✓ Rectifier la ligne
                            </Button>
                            <Button
                              size="sm"
                              variant={res?.decision === "ACCEPTER_RESERVE" ? "default" : "outline"}
                              className={res?.decision === "ACCEPTER_RESERVE" ? "bg-orange-600 hover:bg-orange-700" : "text-orange-700 border-orange-200 hover:bg-orange-50"}
                              onClick={() => setResolution(element.id!, "ACCEPTER_RESERVE")}
                            >
                              ⚖ Note de réserve
                            </Button>
                            <Button
                              size="sm"
                              variant={res?.decision === "REFUSER" ? "default" : "outline"}
                              className={res?.decision === "REFUSER" ? "bg-red-600 hover:bg-red-700" : "text-red-700 border-red-200 hover:bg-red-50"}
                              onClick={() => setResolution(element.id!, "REFUSER")}
                            >
                              ✕ Refuser la contestation
                            </Button>
                          </div>
                          {res?.decision === "REFUSER" && (
                            <p className="text-xs text-red-600 mt-2 font-medium">⚠ Un refus placera l'état des lieux en litige bloquant.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Normal edit form for BROUILLON */}
      {!isConteste && !isLitige && (
      <div className="space-y-6">
        {pieces.map((piece, pIndex) => (
          <div key={pIndex} className="bg-white rounded-lg shadow-sm border" style={{ zIndex: 100 - pIndex, position: "relative" }}>
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center gap-4 relative z-50">
              {!isReadonly ? (
                <div className="w-64">
                   <SearchableSelect
                     options={PIECES_OPTIONS}
                     value={piece.nom}
                     onChange={val => updatePieceNom(pIndex, val)}
                     placeholder="Choisir une pièce"
                   />
                </div>
              ) : (
                <div className="font-bold text-lg">{piece.nom}</div>
              )}
              {!isReadonly && (
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => prefillElements(pIndex)}>Pré-remplir</Button>
                    <Button variant="ghost" size="icon" onClick={() => removePiece(pIndex)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                 </div>
              )}
            </div>
            
            <div className="p-4 space-y-4">
              {piece.elements.map((element, eIndex) => (
                <div key={eIndex} className="p-4 border rounded-md relative group bg-white" style={{ zIndex: 40 - eIndex }}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="col-span-1 lg:col-span-3">
                      <label className="text-xs font-medium text-gray-500 uppercase">Élément</label>
                      {!isReadonly ? (
                         <SearchableSelect
                           options={ELEMENTS_OPTIONS}
                           value={element.nom}
                           onChange={val => updateElement(pIndex, eIndex, "nom", val)}
                           placeholder="Choisir un élément"
                         />
                      ) : (
                         <div className="mt-1 p-2 border rounded-md bg-gray-50 text-sm">{element.nom}</div>
                      )}
                    </div>
                    <div className="col-span-1 lg:col-span-3">
                      <label className="text-xs font-medium text-gray-500 uppercase">État</label>
                      {!isReadonly ? (
                        <SearchableSelect
                          options={ETATS}
                          value={element.etat}
                          placeholder="Choisir l'état"
                          onChange={(val) => updateElement(pIndex, eIndex, "etat", val)}
                        />
                      ) : (
                        <div className="mt-1 p-2 border rounded-md bg-gray-50 text-sm">
                          {ETATS.find(e => e.value === element.etat)?.label || element.etat}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 lg:col-span-6">
                      <label className="text-xs font-medium text-gray-500 uppercase">Commentaire & Preuves</label>
                      <Input 
                        disabled={isReadonly}
                        value={element.commentaire || ""} 
                        onChange={e => updateElement(pIndex, eIndex, "commentaire", e.target.value)}
                        placeholder="Ex: Tache sur le mur gauche, rayure porte..."
                        className="mt-1"
                      />
                      
                      <div className="mt-3">
                        <ImageUpload 
                           currentImage={element.photos?.[0] || null}
                           onChange={async (file) => {
                             if (!file) {
                               updateElement(pIndex, eIndex, "photos", []);
                               return;
                             }
                             try {
                               setLoading(true);
                               const url = await uploadEtatLieuxImage(file);
                               updateElement(pIndex, eIndex, "photos", [url]);
                               toast.success("Image ajoutée");
                             } catch (err: any) {
                               toast.error("Erreur lors de l'ajout de l'image");
                             } finally {
                               setLoading(false);
                             }
                           }}
                        />
                      </div>
                    </div>
                  </div>
                  {!isReadonly && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeElement(pIndex, eIndex)} 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {!isReadonly && (
                <Button variant="ghost" onClick={() => addElement(pIndex)} className="w-full border border-dashed text-gray-500 mt-2">
                  <PlusCircle className="w-4 h-4 mr-2" /> Ajouter un élément vérifié
                </Button>
              )}
            </div>
          </div>
        ))}

        {!isReadonly && (
           <Button variant="outline" onClick={addPiece} className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
             <PlusCircle className="w-5 h-5 mr-2" /> Ajouter une pièce au logement
           </Button>
        )}
      </div>
      )}

      <div className="flex justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border shadow-lg mt-8 z-10">
        {isConteste ? (
          <Button size="lg" disabled={loading} onClick={handleResolveContestations} className="gap-2 bg-orange-600 hover:bg-orange-700">
            <Send className="w-4 h-4" /> Envoyer mes résolutions au locataire
          </Button>
        ) : !isReadonly ? (
          <>
            <Button variant="outline" size="lg" disabled={loading} onClick={() => handleSave(false)}>
              Sauvegarder Brouillon
            </Button>
            <Button size="lg" disabled={loading} onClick={() => handleSave(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Validation..." : "Envoyer pour Validation"}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <CheckCircle className="w-5 h-5" /> Cet état des lieux est verrouillé.
          </div>
        )}
      </div>
    </div>
  );
};

export default EtatDesLieuxForm;
