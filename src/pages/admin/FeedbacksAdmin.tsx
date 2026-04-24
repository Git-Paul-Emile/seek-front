import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, MessageSquare, Star, Smile, ThumbsUp } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { fetchFeedbacksAdmin, deleteFeedback, markFeedbacksRead, type Feedback } from "@/api/feedback";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tw = (cp: string) =>
  `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${cp}.svg`;

const EMOJI_MAP: Record<number, { src: string; label: string }> = {
  1: { src: tw("1f62b"), label: "Très mauvais" },
  2: { src: tw("1f615"), label: "Mauvais" },
  3: { src: tw("1f610"), label: "Moyen" },
  4: { src: tw("1f642"), label: "Bien" },
  5: { src: tw("1f60d"), label: "Magnifique" },
};

function EmojiDisplay({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-300 text-xs">—</span>;
  const e = EMOJI_MAP[value];
  return (
    <div className="flex items-center gap-1.5">
      <img src={e.src} alt={e.label} className="w-5 h-5" />
      <span className="text-xs text-slate-500">{e.label}</span>
    </div>
  );
}

function ScaleDisplay({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <span
          key={v}
          className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
            v <= value ? "bg-[#0C1A35] text-white" : "bg-slate-100 text-slate-300"
          }`}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-[#D4A843]" />
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#0C1A35]">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbacksAdmin() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["feedbacks-admin"],
    queryFn: fetchFeedbacksAdmin,
  });

  // Marquer tous les feedbacks comme lus à l'ouverture de la page
  useEffect(() => {
    markFeedbacksRead().then(() => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks-admin"] });
      toast.success("Feedback supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const feedbacks: Feedback[] = data?.data ?? [];
  const meta = data?.meta;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Feedbacks" },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[#D4A843]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0C1A35]">Feedbacks utilisateurs</h1>
          <p className="text-sm text-slate-500">Retours soumis via le widget sur le site public</p>
        </div>
      </div>

      {/* Stats */}
      {meta && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={MessageSquare}
            label="Total reçus"
            value={String(meta.total)}
          />
          <StatCard
            icon={Smile}
            label="Expérience moyenne"
            value={meta.avgExperience ? meta.avgExperience.toFixed(1) + " / 5" : "—"}
            sub="Note globale sur l'expérience"
          />
          <StatCard
            icon={ThumbsUp}
            label="Facilité d'utilisation"
            value={meta.avgFacilite ? meta.avgFacilite.toFixed(1) + " / 5" : "—"}
            sub="Note moyenne de facilité"
          />
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-slate-400">Chargement…</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Aucun feedback reçu pour l'instant.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Ligne métriques */}
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                          Expérience
                        </p>
                        <EmojiDisplay value={fb.experience} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                          Facilité
                        </p>
                        <ScaleDisplay value={fb.facilite} />
                      </div>
                    </div>

                    {/* Textes */}
                    {fb.apprecie && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                          Ce qu'il apprécie
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{fb.apprecie}</p>
                      </div>
                    )}
                    {fb.frustration && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                          Frustration / blocage
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{fb.frustration}</p>
                      </div>
                    )}
                    {!fb.apprecie && !fb.frustration && !fb.experience && !fb.facilite && (
                      <p className="text-xs text-slate-300 italic">Feedback vide</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDate(fb.createdAt)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Supprimer ce feedback ?")) {
                          deleteMutation.mutate(fb.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
