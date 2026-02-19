import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={!isLoading ? onCancel : undefined} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </div>
            <h2 className="font-display text-base font-bold text-[#0C1A35]">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm
              font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
