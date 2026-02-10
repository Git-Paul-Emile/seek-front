import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tenant, TenantStatus } from "@/data/tenants";
import { Property } from "@/data/properties";

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant;
  properties: Property[];
  onSave: (tenant: Partial<Tenant>) => void;
}

export function TenantDialog({
  open,
  onOpenChange,
  tenant,
  properties,
  onSave,
}: TenantDialogProps) {
  const [formData, setFormData] = useState<Partial<Tenant>>({
    firstName: tenant?.firstName || "",
    lastName: tenant?.lastName || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    phoneEmergency: tenant?.phoneEmergency || "",
    dateOfBirth: tenant?.dateOfBirth || "",
    nationality: tenant?.nationality || "",
    idCardNumber: tenant?.idCardNumber || "",
    profession: tenant?.profession || "",
    employer: tenant?.employer || "",
    employerPhone: tenant?.employerPhone || "",
    monthlyIncome: tenant?.monthlyIncome || undefined,
    guarantorName: tenant?.guarantorName || "",
    guarantorPhone: tenant?.guarantorPhone || "",
    guarantorRelation: tenant?.guarantorRelation || "",
    propertyId: tenant?.propertyId || "",
    roomId: tenant?.roomId || "",
    leaseStartDate: tenant?.leaseStartDate || "",
    leaseEndDate: tenant?.leaseEndDate || "",
    rentAmount: tenant?.rentAmount || 0,
    rentDueDay: tenant?.rentDueDay || 5,
    depositAmount: tenant?.depositAmount || 0,
    depositPaid: tenant?.depositPaid || false,
    status: tenant?.status || "actif",
    notes: tenant?.notes || "",
  });

  const isEditing = !!tenant;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const getPropertyRooms = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.rooms || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le locataire" : "Ajouter un locataire"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du locataire"
              : "Remplissez les informations pour ajouter un nouveau locataire"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneEmergency">Téléphone d'urgence</Label>
                <Input
                  id="phoneEmergency"
                  value={formData.phoneEmergency}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneEmergency: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date de naissance</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idCardNumber">Numéro de pièce d'identité</Label>
                <Input
                  id="idCardNumber"
                  value={formData.idCardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, idCardNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Informations professionnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer">Employeur</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) =>
                    setFormData({ ...formData, employer: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employerPhone">Téléphone employeur</Label>
                <Input
                  id="employerPhone"
                  value={formData.employerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, employerPhone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Revenu mensuel (FCFA)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyIncome: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Garant */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Garant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guarantorName">Nom du garant</Label>
                <Input
                  id="guarantorName"
                  value={formData.guarantorName}
                  onChange={(e) =>
                    setFormData({ ...formData, guarantorName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guarantorPhone">Téléphone garant</Label>
                <Input
                  id="guarantorPhone"
                  value={formData.guarantorPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, guarantorPhone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guarantorRelation">Lien avec le garant</Label>
                <Input
                  id="guarantorRelation"
                  value={formData.guarantorRelation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guarantorRelation: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Bien *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, propertyId: value, roomId: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un bien" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.propertyId && getPropertyRooms(formData.propertyId).length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="room">Chambre</Label>
                  <Select
                    value={formData.roomId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, roomId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une chambre" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPropertyRooms(formData.propertyId).map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="leaseStartDate">Date d'entrée *</Label>
                <Input
                  id="leaseStartDate"
                  type="date"
                  value={formData.leaseStartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, leaseStartDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEndDate">Date de sortie prévue</Label>
                <Input
                  id="leaseEndDate"
                  type="date"
                  value={formData.leaseEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, leaseEndDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Conditions financières */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Conditions financières
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount">Loyer mensuel (FCFA) *</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rentAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentDueDay">Jour d'échéance du loyer</Label>
                <Select
                  value={formData.rentDueDay?.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      rentDueDay: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Le {day} du mois
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Montant de la caution (FCFA)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depositAmount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Statut et notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Statut et notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as TenantStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="sorti">Sorti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? "Modifier" : "Ajouter"} le locataire
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
