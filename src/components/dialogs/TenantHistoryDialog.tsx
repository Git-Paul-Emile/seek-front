import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  TenantHistory,
  ColocataireHistory,
  Tenant,
  Colocataire,
  historyActionLabels,
  tenantSegmentLabels,
} from "@/data/tenants";
import {
  History,
  ArrowUpDown,
  Home,
  User,
  Calendar,
  UserCog,
  DollarSign,
  ArrowRightLeft,
} from "lucide-react";

interface TenantHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  colocataire?: Colocataire | null;
  tenantHistory: TenantHistory[];
  colocataireHistory: ColocataireHistory[];
}

export function TenantHistoryDialog({
  open,
  onOpenChange,
  tenant,
  colocataire,
  tenantHistory,
  colocataireHistory,
}: TenantHistoryDialogProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "entree":
        return <ArrowUpDown className="h-4 w-4 text-green-500" />;
      case "sortie":
        return <ArrowUpDown className="h-4 w-4 text-red-500" />;
      case "modification":
        return <UserCog className="h-4 w-4 text-blue-500" />;
      case "paiement":
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case "transfert":
        return <ArrowRightLeft className="h-4 w-4 text-purple-500" />;
      case "remplacement":
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "entree":
        return "bg-green-500/10 text-green-500 border-green-500";
      case "sortie":
        return "bg-red-500/10 text-red-500 border-red-500";
      case "modification":
        return "bg-blue-500/10 text-blue-500 border-blue-500";
      case "paiement":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500";
      case "transfert":
        return "bg-purple-500/10 text-purple-500 border-purple-500";
      case "remplacement":
        return "bg-orange-500/10 text-orange-500 border-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500";
    }
  };

  const getPersonInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const filteredTenantHistory = tenant
    ? tenantHistory.filter((h) => h.tenantId === tenant.id)
    : [];

  const filteredColocataireHistory = colocataire
    ? colocataireHistory.filter((h) => h.colocataireId === colocataire.id)
    : [];

  const allHistory = [
    ...filteredTenantHistory.map((h) => ({ ...h, type: "tenant" as const })),
    ...filteredColocataireHistory.map((h) => ({ ...h, type: "colocataire" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des relations
          </DialogTitle>
          <DialogDescription>
            {tenant
              ? `Historique complet de ${tenant.firstName} ${tenant.lastName}`
              : colocataire
              ? `Historique complet de ${colocataire.firstName} ${colocataire.lastName}`
              : "Historique des relations occupant-bien"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Profil de l'occupant */}
            {(tenant || colocataire) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                    Informations sur l'occupant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg font-semibold">
                        {tenant
                          ? getPersonInitials(tenant.firstName, tenant.lastName)
                          : colocataire
                          ? getPersonInitials(colocataire.firstName, colocataire.lastName)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {tenant
                          ? `${tenant.firstName} ${tenant.lastName}`
                          : `${colocataire?.firstName} ${colocataire?.lastName}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tenant?.email || colocataire?.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tenant?.phone || colocataire?.phone}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="text-xs">
                        {tenant
                          ? tenantSegmentLabels[tenant.segment]
                          : colocataire
                          ? tenantSegmentLabels[colocataire.segment]
                          : ""}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          (tenant?.status === "actif" || colocataire?.status === "actif")
                            ? "bg-green-500/10 text-green-500 border-green-500"
                            : "bg-gray-500/10 text-gray-500 border-gray-500"
                        }`}
                      >
                        {tenant?.status === "actif" || colocataire?.status === "actif"
                          ? "Actif"
                          : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  {(tenant?.propertyName || colocataire?.propertyName) && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Bien:</span>
                      <span className="font-medium">
                        {tenant?.propertyName || colocataire?.propertyName}
                      </span>
                      {tenant?.roomName && (
                        <>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-medium">{tenant.roomName}</span>
                        </>
                      )}
                      {colocataire?.roomName && (
                        <>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-medium">{colocataire.roomName}</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline des événements */}
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              {/* Événements */}
              <div className="space-y-4">
                {allHistory.length === 0 ? (
                  <div className="pl-10 text-sm text-muted-foreground">
                    Aucun historique disponible pour cet occupant.
                  </div>
                ) : (
                  allHistory.map((history) => (
                    <div key={history.id} className="relative pl-10">
                      {/* Point sur la timeline */}
                      <div
                        className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 bg-background ${getActionColor(
                          history.action
                        )}`}
                      />
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getActionIcon(history.action)}
                              <Badge variant="outline" className="text-xs">
                                {historyActionLabels[history.action] ||
                                  history.action}
                              </Badge>
                              <span className="text-sm font-medium">
                                {history.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(history.date), "dd MMM yyyy", {
                                locale: fr,
                              })}
                            </div>
                          </div>
                          {history.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {history.notes}
                            </p>
                          )}
                          {history.performedBy && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Par: {history.performedBy}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
