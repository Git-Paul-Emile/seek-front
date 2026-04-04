import { Bell, CheckCheck, Circle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useOwnerNotifications, useMarkOwnerNotificationsRead, useMarkOwnerOneNotificationRead } from "@/hooks/useNotificationInApp";
import type { InAppNotification } from "@/api/notificationInApp";

const PAYMENT_TYPES = new Set([
  "RAPPEL_LOYER", "ALERTE_RETARD", "CONFIRMATION_PAIEMENT",
  "INITIATION_PAIEMENT", "PAIEMENT_LOCATAIRE",
  "PAIEMENT_ESPECES_LOCATAIRE", "CONFIRMATION_ESPECES_PROPRIETAIRE",
]);

const BAIL_TYPES = new Set([
  "INVITATION_BAIL", "CONTRAT", "RESILIATION", "FIN_BAIL", "PREAVIS",
]);

function getOwnerNotifLink(notif: InAppNotification): string {
  if (PAYMENT_TYPES.has(notif.type) && notif.bienId)
    return `/owner/biens/${notif.bienId}/paiements`;
  if (BAIL_TYPES.has(notif.type) && notif.bienId)
    return `/owner/biens/${notif.bienId}`;
  if (notif.type === "VERIFICATION_LOCATAIRE")
    return notif.locataireId ? `/owner/locataires/${notif.locataireId}` : "/owner/locataires";
  if (notif.bienId)
    return `/owner/biens/${notif.bienId}`;
  return "/owner/biens";
}

const TYPE_LABELS: Record<string, string> = {
  RAPPEL_LOYER:                      "Rappel de loyer",
  CONFIRMATION_PAIEMENT:             "Paiement confirmé",
  ALERTE_RETARD:                     "Loyer en retard",
  INITIATION_PAIEMENT:               "Initiation de paiement",
  VERIFICATION_LOCATAIRE:            "Vérification locataire",
  PAIEMENT_LOCATAIRE:                "Paiement locataire",
  PREAVIS:                           "Préavis",
  RESILIATION:                       "Résiliation",
  FIN_BAIL:                          "Fin de bail",
  CONTRAT:                           "Contrat",
  ALERTE:                            "Alerte",
  INVITATION_BAIL:                   "Invitation bail",
  PAIEMENT_ESPECES_LOCATAIRE:        "Paiement en espèces",
  CONFIRMATION_ESPECES_PROPRIETAIRE: "Espèces confirmées",
};

const TYPE_COLOR: Record<string, string> = {
  ALERTE_RETARD: "text-red-500 bg-red-50",
  RESILIATION:   "text-red-500 bg-red-50",
  FIN_BAIL:      "text-red-500 bg-red-50",
  ALERTE:        "text-red-500 bg-red-50",
  CONFIRMATION_PAIEMENT:             "text-green-600 bg-green-50",
  CONFIRMATION_ESPECES_PROPRIETAIRE: "text-green-600 bg-green-50",
  PAIEMENT_LOCATAIRE:                "text-green-600 bg-green-50",
};

function typeColor(type: string) {
  return TYPE_COLOR[type] ?? "text-[#D4A843] bg-amber-50";
}

function NotifRow({ notif }: { notif: InAppNotification }) {
  const color = typeColor(notif.type);
  const { mutate: markOne } = useMarkOwnerOneNotificationRead();

  return (
    <Link
      to={getOwnerNotifLink(notif)}
      onClick={() => { if (!notif.lu) markOne(notif.id); }}
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
        notif.lu ? "bg-white border-slate-100 hover:border-slate-200" : "bg-amber-50/30 border-amber-100 hover:border-amber-200"
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
        {notif.lu
          ? <CheckCircle2 className="w-4 h-4 opacity-50" />
          : <Bell className="w-4 h-4" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${notif.lu ? "text-slate-600" : "text-[#0C1A35]"}`}>
            {notif.sujet ?? TYPE_LABELS[notif.type] ?? notif.type}
          </p>
          <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">
            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${color}`}>
            {TYPE_LABELS[notif.type] ?? notif.type}
          </span>
          {!notif.lu && (
            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
              <Circle className="w-2 h-2 fill-current" />
              Non lue
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function NotificationsPage() {
  const { data, isLoading } = useOwnerNotifications();
  const { mutate: markRead, isPending: marking } = useMarkOwnerNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0C1A35]">Notifications</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markRead()}
            disabled={marking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A843] text-white text-sm font-medium
              hover:bg-[#b8943e] transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Aucune notification</p>
          <p className="text-sm text-slate-400 mt-1">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotifRow key={n.id} notif={n} />
          ))}
        </div>
      )}
    </div>
  );
}
