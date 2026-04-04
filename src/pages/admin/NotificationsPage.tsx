import React from "react";
import { Link } from "react-router-dom";
import { Bell, FileSearch, Shield, AlertTriangle, ChevronRight, RefreshCw } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useNotificationInApp";
import type { AdminNotifItem, AdminNotifType } from "@/api/notificationInApp";

const TYPE_CONFIG: Record<AdminNotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  ANNONCE_EN_ATTENTE: {
    icon: <FileSearch className="w-5 h-5" />,
    color: "text-[#D4A843]",
    bg: "bg-amber-50",
  },
  VERIFICATION_EN_ATTENTE: {
    icon: <Shield className="w-5 h-5" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  SIGNALEMENT_ACTIF: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
};

function AdminNotifCard({ item }: { item: AdminNotifItem }) {
  const cfg = TYPE_CONFIG[item.type] ?? { icon: <Bell className="w-5 h-5" />, color: "text-slate-500", bg: "bg-slate-50" };
  return (
    <Link
      to={item.lien}
      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-100
        hover:border-slate-200 hover:shadow-sm transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0C1A35]">{item.titre}</p>
        <p className="text-sm text-slate-500 mt-0.5">{item.message}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-2xl font-bold ${cfg.color}`}>{item.count}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
    </Link>
  );
}

export default function AdminNotificationsPage() {
  const { data, isLoading, refetch, isFetching } = useAdminNotifications();

  const items = data?.items ?? [];
  const total = data?.unreadCount ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0C1A35]">Notifications système</h1>
            <p className="text-sm text-slate-500">
              {total > 0 ? `${total} élément${total > 1 ? "s" : ""} en attente` : "Rien en attente"}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600
            text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-slate-600 font-medium">Tout est traité</p>
          <p className="text-sm text-slate-400 mt-1">Aucun élément en attente d'action</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <AdminNotifCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Info note */}
      <p className="text-xs text-slate-400 text-center mt-6">
        Les notifications système se mettent à jour automatiquement toutes les 15 secondes.
      </p>
    </div>
  );
}
