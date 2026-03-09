import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ArrowLeft, Loader2, AlertTriangle, FileText, User, Home, ExternalLink, X } from "lucide-react";
import { useLocataireAvecDocuments } from "@/hooks/useSuspension";
import { useState } from "react";

const TYPE_DOC_LABELS: Record<string, string> = {
  CNI_RECTO: "CNI Recto",
  CNI_VERSO: "CNI Verso",
  PASSEPORT: "Passeport",
  PERMIS: "Permis de conduire",
  AUTRE: "Autre",
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  VALIDE: "bg-green-100 text-green-700",
  REJETE: "bg-red-100 text-red-600",
};

export default function LocataireDocuments() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading } = useLocataireAvecDocuments(id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const locataire = result?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (!locataire) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-400">
        <AlertTriangle className="w-10 h-10 mb-2 opacity-30" />
        <p>Locataire introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Utilisateurs", to: "/admin/utilisateurs/locataires" }, { label: "Documents locataire" }]} />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0C1A35] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold text-[#0C1A35]">
        {locataire.prenom} {locataire.nom} — Documents
      </h1>

      {/* Infos locataire */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-[#0C1A35] mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Informations locataire
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Téléphone</p>
            <p className="font-medium text-slate-700">{locataire.telephone}</p>
          </div>
          {locataire.email && (
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Email</p>
              <p className="font-medium text-slate-700">{locataire.email}</p>
            </div>
          )}
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Statut suspension</p>
            <p className={`text-xs font-semibold ${locataire.estSuspendu ? "text-red-600" : "text-green-600"}`}>
              {locataire.estSuspendu ? "Suspendu" : "Actif"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Inscrit le</p>
            <p className="text-slate-500">{new Date(locataire.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          {locataire.proprietaire && (
            <div className="col-span-2">
              <p className="text-slate-400 text-xs mb-0.5">Propriétaire associé</p>
              <p className="font-medium text-slate-700">
                {locataire.proprietaire.prenom} {locataire.proprietaire.nom} — {locataire.proprietaire.telephone}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vérification & documents */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-[#0C1A35] mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Vérification d'identité
        </h2>
        {!locataire.verification ? (
          <p className="text-sm text-slate-400">Aucune vérification soumise</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${STATUT_COLORS[locataire.verification.statut] ?? "bg-slate-100 text-slate-500"}`}>
                {locataire.verification.statut}
              </span>
              {locataire.verification.verifiedAt && (
                <span className="text-xs text-slate-400">
                  Vérifié le {new Date(locataire.verification.verifiedAt).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>

            {locataire.verification.documents.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun document</p>
            ) : (
              <div className="grid gap-3">
                {locataire.verification.documents.map((doc) => {
                  const isImage = doc.url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#D4A843]/30 hover:bg-[#D4A843]/5 transition-colors group"
                    >
                      {isImage ? (
                        <button
                          type="button"
                          onClick={() => setSelectedImage(doc.url)}
                          className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200"
                        >
                          <img
                            src={doc.url}
                            alt={TYPE_DOC_LABELS[doc.type] ?? doc.type}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#D4A843] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 group-hover:text-[#0C1A35]">
                          {TYPE_DOC_LABELS[doc.type] ?? doc.type}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUT_COLORS[doc.statut] ?? "bg-slate-100 text-slate-500"}`}>
                        {doc.statut}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D4A843]" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Baux */}
      {locataire.bails && locataire.bails.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-[#0C1A35] mb-4 flex items-center gap-2">
            <Home className="w-4 h-4" /> Baux ({locataire.bails.length})
          </h2>
          <div className="space-y-3">
            {locataire.bails.map((b) => (
              <div key={b.id} className="p-3 rounded-xl border border-slate-100 text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-700">{b.bien?.titre ?? "Sans titre"}</p>
                    <p className="text-xs text-slate-400">{b.bien?.ville ?? ""} · {b.typeBail}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    b.statut === "ACTIF" ? "bg-green-100 text-green-700" :
                    b.statut === "TERMINE" ? "bg-slate-100 text-slate-500" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {b.statut}
                  </span>
                </div>
                {b.montantLoyer && (
                  <p className="text-xs text-slate-500 mt-1">
                    {new Intl.NumberFormat("fr-FR").format(b.montantLoyer)} FCFA / mois
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal pour afficher les images en grand */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedImage}
            alt="Document en grand"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
