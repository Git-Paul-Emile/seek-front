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
import { Colocataire, ColocataireStatus } from "@/data/tenants";
import { Property, Room } from "@/data/properties";

interface ColocataireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colocataire?: Colocataire;
  properties: Property[];
  rooms: Room[];
  onSave: (colocataire: Partial<Colocataire>) => void;
}

export function ColocataireDialog({
  open,
  onOpenChange,
  colocataire,
  properties,
  rooms,
  onSave,
}: ColocataireDialogProps) {
  const [formData, setFormData] = useState<Partial<Colocataire>>({
    firstName: colocataire?.firstName || "",
    lastName: colocataire?.lastName || "",
    email: colocataire?.email || "",
    phone: colocataire?.phone || "",
    phoneEmergency: colocataire?.phoneEmergency || "",
    dateOfBirth: colocataire?.dateOfBirth || "",
    nationality: colocataire?.nationality || "",
    idCardNumber: colocataire?.idCardNumber || "",
    profession: colocataire?.profession || "",
    employer: colocataire?.employer || "",
    propertyId: colocataire?.propertyId || "",
    roomId: colocataire?.roomId || "",
    parentName: colocataire?.parentName || "",
    parentPhone: colocataire?.parentPhone || "",
    entryDate: colocataire?.entryDate || "",
    exitDate: colocataire?.exitDate || "",
    rentAmount: colocataire?.rentAmount || 0,
    depositAmount: colocataire?.depositAmount || 0,
    depositPaid: colocataire?.depositPaid || false,
    status: colocataire?.status || "actif",
    notes: colocataire?.notes || "",
  });

  const isEditing = !!colocataire;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const getPropertyRooms = (propertyId: string) => {
    return rooms.filter((r) => r.propertyId === propertyId);
  };

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const propertyRooms = formData.propertyId ? getPropertyRooms(formData.propertyId) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le colocataire" : "Ajouter un colocataire"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du colocataire"
              : "Remplissez les informations pour ajouter un nouveau colocataire"}
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
                <Label htmlFor="employer">Employeur / Établissement</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) =>
                    setFormData({ ...formData, employer: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Responsables légaux (pour étudiants) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Responsable légal (pour étudiants)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Nom du responsable</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Téléphone du responsable</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, parentPhone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Colocation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Colocation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Bien en colocation *</Label>
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
                    {properties
                      .filter((p) => p.rentalMode === "colocation")
                      .map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Chambre *</Label>
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
                    {propertyRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} - {room.price.toLocaleString()} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryDate">Date d'entrée *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, entryDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitDate">Date de sortie</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) =>
                    setFormData({ ...formData, exitDate: e.target.value })
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    setFormData({ ...formData, status: value as ColocataireStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="sorti">Sorti</SelectItem>
                    <SelectItem value="remplace">Remplacé</SelectItem>
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

          {isEditing && formData.status === "sorti" && (
            <div className="space-y-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-yellow-800">
                Remplacer le colocataire
              </h3>
              <p className="text-sm text-yellow-700">
                Le colocataire va être marqué comme sorti. Voulez-vous ajouter un remplaçant immédiatement ?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Logique pour ajouter un remplaçant
                }}
              >
                Ajouter un remplaçant
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? "Modifier" : "Ajouter"} le colocataire
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
