import { useState, useRef, useEffect } from "react";
import {
  X, FileText, Download, CheckCircle,
  Loader2, FileCheck, Send,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  useContrat,
  useGenererContrat,
  useEnvoyerContrat,
} from "@/hooks/useContrat";
import type { Bail } from "@/api/bail";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContratModalProps {
  bail: Bail;
  onClose: () => void;
  /** true  = flux création du bail (Valider → active + envoie + ferme)
   *  false = consultation depuis BienDetail (Renvoyer uniquement) */
  isCreationFlow?: boolean;
  /** Appelé si l'utilisateur ferme la modal SANS valider (flux création uniquement).
   *  Permet au parent d'annuler le bail et supprimer le locataire. */
  onCancelCreation?: () => Promise<void>;
}

// ─── Badge statut ─────────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: "BROUILLON" | "ACTIF" | "ARCHIVE" }) {
  const styles = {
    BROUILLON: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    ACTIF:     "bg-green-50  text-green-700  border border-green-200",
    ARCHIVE:   "bg-gray-50   text-gray-600   border border-gray-200",
  };
  const labels = { BROUILLON: "Brouillon", ACTIF: "Actif", ARCHIVE: "Archivé" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[statut]}`}>
      {statut === "ACTIF" && <CheckCircle className="w-3 h-3" />}
      {labels[statut]}
    </span>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export default function ContratModal({
  bail,
  onClose,
  isCreationFlow = false,
  onCancelCreation,
}: ContratModalProps) {
  const bienId = bail.bienId;
  const bailId = bail.id;

  const { data: contrat, isLoading } = useContrat(bienId, bailId);
  const generer = useGenererContrat();
  const envoyer = useEnvoyerContrat();

  const [contenu, setContenu] = useState("");
  const [autoGenDone, setAutoGenDone] = useState(false);
  // Track whether the contract was validated so X-close doesn't trigger cancellation
  const validatedRef = useRef(false);

  // Sync contenu when server data arrives
  useEffect(() => {
    if (contrat?.contenu) setContenu(contrat.contenu);
  }, [contrat?.contenu]);

  // Auto-generate only in creation flow if no contract exists yet
  useEffect(() => {
    if (!isCreationFlow) return;
    if (!isLoading && !contrat && !autoGenDone && !generer.isPending) {
      setAutoGenDone(true);
      generer.mutateAsync({ bienId, bailId }).then((c) => {
        setContenu(c.contenu);
      }).catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? "Impossible de générer le contrat. Vérifiez qu'un modèle existe pour ce type de bail.";
        toast.error(msg);
      });
    }
  }, [isLoading, contrat, autoGenDone, generer.isPending, isCreationFlow]); // eslint-disable-line react-hooks/exhaustive-deps

  const contratId = contrat?.id ?? "";
  const titre     = contrat?.titre ?? "Contrat de bail";

  // ── Valider (création) → active + envoie automatiquement + ferme ──────────
  const handleValider = async () => {
    if (!contratId) return;
    try {
      await envoyer.mutateAsync({ bienId, bailId, contratId });
      validatedRef.current = true;
      toast.success("Contrat validé et envoyé au locataire !");
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
    }
  };

  // ── Fermeture avec annulation (X en flux création sans validation) ─────────
  const handleClose = async () => {
    if (isCreationFlow && !validatedRef.current && onCancelCreation) {
      try {
        await onCancelCreation();
      } catch {
        // best-effort
      }
    }
    onClose();
  };

  // ── Renvoyer (consultation) ────────────────────────────────────────────────
  const handleRenvoyer = async () => {
    if (!contratId) return;
    try {
      await envoyer.mutateAsync({ bienId, bailId, contratId });
      toast.success("Contrat envoyé au locataire !");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
    }
  };

  // ── PDF ───────────────────────────────────────────────────────────────────
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const el = pdfRef.current;
    if (!el) { toast.error("Élément non trouvé"); return; }
    try {
      toast.loading("Génération du PDF...", { id: "pdf" });
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight  = (canvas.height * pageWidth) / canvas.width;

      let y = 0;
      while (y < imgHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pageWidth, imgHeight);
        y += pageHeight;
      }
      pdf.save(`${titre.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF téléchargé", { id: "pdf" });
    } catch {
      toast.error("Erreur lors de la génération du PDF", { id: "pdf" });
    }
  };

  const isGenerating = generer.isPending;
  const isBusy = isGenerating || envoyer.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{titre}</h2>
              <p className="text-xs text-gray-500">
                Bail {bail.typeBail} · {bail.bien?.titre ?? ""}
              </p>
            </div>
            {contrat && <StatutBadge statut={contrat.statut} />}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        {!isLoading && !isGenerating && contrat && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex-wrap flex-shrink-0">
            {/* PDF — toujours disponible */}
            <button
              onClick={handleDownloadPdf}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger PDF
            </button>

            <div className="flex-1" />

            {/* Flux création : Valider (active + envoie + ferme) */}
            {isCreationFlow && (
              <button
                onClick={handleValider}
                disabled={isBusy}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {envoyer.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi...</>
                  : <><FileCheck className="w-3.5 h-3.5" /> Valider</>
                }
              </button>
            )}

            {/* Consultation : Renvoyer au locataire */}
            {!isCreationFlow && (
              <button
                onClick={handleRenvoyer}
                disabled={isBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {envoyer.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi...</>
                  : <><Send className="w-3.5 h-3.5" /> Renvoyer au locataire</>
                }
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {(isLoading || isGenerating) ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">
                {isGenerating ? "Génération du contrat en cours…" : "Chargement…"}
              </p>
            </div>
          ) : !contrat ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <FileText className="w-12 h-12 text-gray-300" />
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {isCreationFlow
                  ? <>Aucun modèle disponible pour le type de bail «&nbsp;{bail.typeBail}&nbsp;».<br />Contactez un administrateur.</>
                  : "Aucun contrat n'a été généré pour ce bail."
                }
              </p>
            </div>
          ) : (
            /* Lecture seule — cible PDF */
            <div
              ref={pdfRef}
              className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
            >
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contenu }}
              />
            </div>
          )}
        </div>

        {/* Bandeau flux création : info validation */}
        {isCreationFlow && !isLoading && !isGenerating && contrat && (
          <div className="px-6 py-3 border-t border-amber-100 bg-amber-50 flex items-center gap-2 text-xs text-amber-700 flex-shrink-0 rounded-b-2xl">
            <FileCheck className="w-4 h-4 shrink-0" />
            Lisez le contrat puis cliquez <strong className="mx-1">Valider</strong> pour finaliser le bail et envoyer le contrat au locataire.
          </div>
        )}
      </div>
    </div>
  );
}
