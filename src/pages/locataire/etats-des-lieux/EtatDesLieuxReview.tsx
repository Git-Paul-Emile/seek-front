import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  EtatDesLieux, 
  getEtatDesLieuxLocataire,
  validateEtatDesLieux,
  contesterElementsLocataire,
  uploadEtatLieuxImageLocataire
} from "@/api/etatDesLieux.api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, FileSignature, MessageSquareWarning, Upload, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PendingContestation {
  elementId: string;
  motifContestation: string;
  photoContestation: string;
  localPhotoUrl?: string; // To preview the uploaded photo
}

const EtatDesLieuxReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [edl, setEdl] = useState<EtatDesLieux | null>(null);
  
  // Pending contestations maintained by the user before submitting
  const [pendingContestations, setPendingContestations] = useState<PendingContestation[]>([]);
  
  // State for the inline form
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [tempMotif, setTempMotif] = useState("");
  const [tempPhotoUrl, setTempPhotoUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) loadEDL(id);
  }, [id]);

  const loadEDL = async (edlId: string) => {
    try {
      setLoading(true);
      const data = await getEtatDesLieuxLocataire(edlId);
      setEdl(data);
    } catch (e: any) {
      toast.error("Erreur de chargement", { description: e.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    try {
      setLoading(true);
      
      let pdfUrl = "";
      if (pdfRef.current) {
        toast.info("Génération du document sécurisé en cours...");
        const canvas = await html2canvas(pdfRef.current, { scale: 1.5 });
        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        
        // Mock PDF URL for demonstration
        pdfUrl = "https://res.cloudinary.com/demo/image/upload/sample.pdf"; 
      }

      await validateEtatDesLieux(id!, pdfUrl);
      toast.success("État des lieux signé et validé avec succès !");
      loadEDL(id!);
    } catch (e: any) {
      toast.error("Erreur", { description: e.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const submitContestations = async () => {
    if (pendingContestations.length === 0) {
      toast.error("Aucune contestation à envoyer.");
      return;
    }
    try {
      setLoading(true);
      await contesterElementsLocataire(id!, pendingContestations);
      toast.success("Vos contestations ont été envoyées au propriétaire.");
      setPendingContestations([]);
      loadEDL(id!);
    } catch (e: any) {
      toast.error("Erreur", { description: e.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadEtatLieuxImageLocataire(file);
      setTempPhotoUrl(url);
    } catch (error) {
      toast.error("Échec de l'upload de l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveInlineContestation = () => {
    if (!tempMotif.trim()) {
      toast.error("Veuillez saisir un motif de désaccord.");
      return;
    }
    if (!tempPhotoUrl) {
      toast.error("Une photo est obligatoire pour contester un élément.");
      return;
    }

    setPendingContestations(prev => [
      ...prev,
      { elementId: activeElementId!, motifContestation: tempMotif, photoContestation: tempPhotoUrl, localPhotoUrl: tempPhotoUrl }
    ]);

    setActiveElementId(null);
    setTempMotif("");
    setTempPhotoUrl("");
  };

  const cancelInlineContestation = () => {
    setActiveElementId(null);
    setTempMotif("");
    setTempPhotoUrl("");
  };

  const removePendingContestation = (elementId: string) => {
    setPendingContestations(prev => prev.filter(c => c.elementId !== elementId));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (!edl) return <div className="p-8 text-center">Aucun document trouvé.</div>;

  const isValide = edl.statut === "VALIDE";
  const isConteste = edl.statut === "CONTESTE";
  const isLitige = edl.statut === "EN_LITIGE";
  const isEnAttente = edl.statut === "EN_ATTENTE_VALIDATION";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revue de l'État des Lieux ({edl.type})</h1>
          <p className="text-sm text-gray-500">
            {isValide ? "Ce document est signé numériquement et verrouillé." : "Veuillez vérifier attentivement les observations réalisées."}
          </p>
        </div>
      </div>

      {isValide && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <span className="font-semibold block">Validé le {new Date(edl.dateValidation!).toLocaleString()}</span>
            Cet état des lieux a une valeur juridique pour votre bail.
          </div>
        </div>
      )}

      {isLitige && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex flex-col gap-2">
          <span className="font-semibold text-lg flex items-center gap-2"><MessageSquareWarning /> État des lieux en litige (Désaccord bloquant)</span>
          <p>Le propriétaire a refusé vos contestations. Afin de finaliser cette étape juridique, nous vous conseillons vivement de faire appel à un Huissier de Justice ou à un médiateur tiers pour réaliser un état des lieux contradictoire.</p>
        </div>
      )}

      {isConteste && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg">
          <span className="font-semibold mb-1 flex items-center gap-2"><MessageSquareWarning className="w-5 h-5"/> En cours de médiation</span>
          Vous avez contesté des éléments. Le propriétaire doit "Rectifier" ou émettre une "Note de Réserve" pour débloquer la procédure. En cas de refus, le document passera en litige.
        </div>
      )}

      {/* The Printable Area for the PDF */}
      <div ref={pdfRef} className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
         <div className="text-center border-b pb-6">
           <h2 className="text-2xl font-black uppercase text-gray-800 tracking-wider">État des Lieux ({edl.type})</h2>
           <p className="text-gray-500 mt-2">Réalisé le {new Date(edl.dateRealisation).toLocaleDateString()}</p>
         </div>

         <div className="space-y-6">
           {edl.pieces.map((piece, pIndex) => (
             <div key={pIndex}>
               <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gray-100 p-2 rounded">{piece.nom}</h3>
               <div className="grid grid-cols-1 gap-4">
                 {piece.elements.map((element, eIndex) => {
                   const pending = pendingContestations.find(c => c.elementId === element.id);
                   const isContestingNow = activeElementId === element.id;

                   return (
                   <div key={eIndex} className={`p-4 border rounded relative ${pending || element.estConteste ? "border-orange-300 bg-orange-50/30" : ""}`}>
                     <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                       <div className="font-medium text-gray-800">
                         {element.nom}
                         {element.statutContestation === "RESERVE" && (
                           <span className="ml-2 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">Mention de réserve par le propriétaire</span>
                         )}
                         {element.statutContestation === "REFUSE" && (
                           <span className="ml-2 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Contestation refusée</span>
                         )}
                       </div>
                       <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">{element.etat.replace(/_/g, " ")}</span>
                     </div>
                     
                     {element.commentaire && <p className="text-sm text-gray-600 bg-gray-50 p-2 italic rounded mt-1">"{element.commentaire}"</p>}
                     
                     {element.photos && element.photos.length > 0 && (
                       <div className="mt-2 flex gap-2">
                         {element.photos.map(p => <img key={p} src={p} alt="Preuve" className="w-16 h-16 object-cover rounded border" crossOrigin="anonymous"/>)}
                       </div>
                     )}

                     {/* Display submitted contestation if exists */}
                     {element.estConteste && (
                       <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-100 text-sm">
                         <div className="font-semibold text-orange-800 mb-1">Votre contestation :</div>
                         <p className="text-orange-900 mb-2">"{element.motifContestation}"</p>
                         {element.photoContestation && (
                           <img src={element.photoContestation} alt="Preuve contestation" className="w-16 h-16 object-cover rounded border border-orange-200" crossOrigin="anonymous" />
                         )}
                       </div>
                     )}

                     {/* Actions block (only if pending validation and not already contested) */}
                     {isEnAttente && !element.estConteste && !pending && !isContestingNow && (
                       <div className="mt-3 text-right">
                         <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => setActiveElementId(element.id!)}>
                           <MessageSquareWarning className="w-4 h-4 mr-1"/> Contester
                         </Button>
                       </div>
                     )}

                     {/* Pending local contestation display */}
                     {pending && (
                       <div className="mt-3 p-3 bg-orange-100/50 rounded border border-orange-200 text-sm relative">
                         <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => removePendingContestation(element.id!)}>
                           <X className="w-4 h-4" />
                         </Button>
                         <div className="font-semibold text-orange-800 mb-1">Contestation non-envoyée :</div>
                         <p className="mb-2">"{pending.motifContestation}"</p>
                         <img src={pending.localPhotoUrl} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                       </div>
                     )}

                     {/* Inline form for contesting */}
                     {isContestingNow && (
                       <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 space-y-4">
                         <div>
                           <label className="text-sm font-semibold text-gray-700 block mb-1">Motif du désaccord (obligatoire)</label>
                           <textarea 
                             className="w-full text-sm border p-2 rounded-md bg-white focus:ring-orange-500 outline-none"
                             placeholder="Ex: Le mur n'est pas en bon état, il y a une tache d'humidité..."
                             value={tempMotif}
                             onChange={(e) => setTempMotif(e.target.value)}
                           />
                         </div>
                         <div>
                           <label className="text-sm font-semibold text-gray-700 block mb-1">Photo de contre-preuve (obligatoire)</label>
                           <div className="flex items-center gap-3">
                             <div className="relative border-2 border-dashed border-gray-300 rounded-md p-4 bg-white flex flex-col items-center flex-1 hover:bg-gray-50 cursor-pointer">
                               <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage}/>
                               <Upload className={`w-6 h-6 mb-2 ${uploadingImage ? 'text-gray-300' : 'text-gray-400'}`} />
                               <span className="text-xs text-center text-gray-500">{uploadingImage ? 'Téléchargement...' : 'Cliquez pour ajouter une photo'}</span>
                             </div>
                             {tempPhotoUrl && (
                               <img src={tempPhotoUrl} alt="Preview" className="w-20 h-20 object-cover rounded border shadow-sm" />
                             )}
                           </div>
                         </div>
                         <div className="flex justify-end gap-2 pt-2 border-t border-orange-100">
                           <Button variant="ghost" size="sm" onClick={cancelInlineContestation}>Annuler</Button>
                           <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={saveInlineContestation} disabled={uploadingImage}>Ajouter la contestation</Button>
                         </div>
                       </div>
                     )}
                   </div>
                   );
                 })}
               </div>
             </div>
           ))}
         </div>

         {(edl.nbCles !== null && edl.nbCles !== undefined) && (
           <div className="border-t pt-6 bg-gray-50 p-4 rounded-b-lg">
             <div className="text-sm text-gray-700">
               <span className="font-semibold">Remise des clés : </span>
               {edl.nbCles} clés
             </div>
           </div>
         )}
      </div>

      {/* Global Actions Locataire */}
      {isEnAttente && pendingContestations.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Tout semble correct ?</h3>
            <p className="text-sm text-gray-500">Si vous êtes d'accord avec ce document, validez-le.</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 whitespace-nowrap gap-2" onClick={handleValidation} disabled={loading}>
            <FileSignature className="w-5 h-5" /> Je certifie et signe l'état des lieux
          </Button>
        </div>
      )}

      {isEnAttente && pendingContestations.length > 0 && (
        <div className="bg-orange-50 p-6 rounded-lg shadow-sm border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h3 className="text-lg font-bold text-orange-900">Vous avez {pendingContestations.length} contestation(s) en attente</h3>
            <p className="text-sm text-orange-700">Envoyez-les au propriétaire pour médiation.</p>
          </div>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap gap-2" onClick={submitContestations} disabled={loading}>
            <MessageSquareWarning className="w-5 h-5" /> Envoyer mes contestations
          </Button>
        </div>
      )}
    </div>
  );
};

export default EtatDesLieuxReview;
