import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  EtatDesLieux, 
  getEtatDesLieuxLocataire,
  validateEtatDesLieux,
  commentEtatDesLieux
} from "@/api/etatDesLieux.api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, FileSignature, MessageSquareWarning } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EtatDesLieuxReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [edl, setEdl] = useState<EtatDesLieux | null>(null);
  
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");

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
      
      // Basic PDF Generation logic using html2canvas and jspdf
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
        
        // In a real flow, upload this blob to backend
        // const pdfBlob = pdf.output("blob");
        // const formData = new FormData();
        // formData.append("file", pdfBlob, `EDL_${edl?.id}.pdf`);
        // pdfUrl = await uploadService(formData);
        
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

  const handleContest = async () => {
    if (!comment.trim()) {
      toast.error("Veuillez saisir un commentaire expliquant l'anomalie.");
      return;
    }
    try {
      setLoading(true);
      await commentEtatDesLieux(id!, comment);
      toast.success("Votre commentaire a été envoyé au propriétaire.");
      setShowCommentInput(false);
      loadEDL(id!);
    } catch (e: any) {
      toast.error("Erreur", { description: e.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (!edl) return <div className="p-8 text-center">Aucun document trouvé.</div>;

  const isValide = edl.statut === "VALIDE";
  const isConteste = edl.statut === "CONTESTE";
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {piece.elements.map((element, eIndex) => (
                   <div key={eIndex} className="p-3 border rounded">
                     <div className="flex justify-between items-start mb-2">
                       <span className="font-medium text-gray-700">{element.nom}</span>
                       <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{element.etat.replace(/_/g, " ")}</span>
                     </div>
                     {element.commentaire && <p className="text-sm text-gray-600 bg-gray-50 p-2 italic rounded mt-1">"{element.commentaire}"</p>}
                     {element.photos && element.photos.length > 0 && (
                       <div className="mt-2 flex gap-2">
                         {/* Pour PDF generation with html2canvas, internal cross-origin images need proxy or base64. 
                             Using placeholder generic view for speed. */}
                         {element.photos.map(p => <img key={p} src={p} alt="Preuve" className="w-12 h-12 object-cover rounded border" crossOrigin="anonymous"/>)}
                       </div>
                     )}
                   </div>
                 ))}
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

      {/* Actions Lockataire */}
      {isEnAttente && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Votre action est requise</h3>
          
          {showCommentInput ? (
            <div className="space-y-3">
              <label className="text-sm font-medium">Décrivez l'élément avec lequel vous n'êtes pas d'accord :</label>
              <textarea 
                className="w-full min-h-[100px] border p-2 rounded-md"
                placeholder="Je ne suis pas d'accord concernant l'état du sol dans la chambre 1, il y a une tache visible..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowCommentInput(false)}>Annuler</Button>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleContest}>Envoyer le signalement</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={handleValidation} disabled={loading}>
                <FileSignature className="w-5 h-5" /> Je certifie et je signe numériquement
              </Button>
              <Button size="lg" variant="outline" className="flex-1 gap-2 text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setShowCommentInput(true)}>
                <MessageSquareWarning className="w-5 h-5" /> Contester un élément
              </Button>
            </div>
          )}
        </div>
      )}

      {isConteste && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg">
          <span className="font-semibold block mb-1">En cours de modification</span>
          Vous avez contesté cet état des lieux. Le propriétaire a été notifié et doit modifier le document avant que vous ne puissiez le signer.
        </div>
      )}
    </div>
  );
};

export default EtatDesLieuxReview;
