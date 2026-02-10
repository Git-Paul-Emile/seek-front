import { useState } from "react";
import { Room, RoomStatus, equipmentTypes, equipmentLabels, roomStatusLabels, formatRoomPrice, EquipmentType } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, User, History } from "lucide-react";

export interface RoomFormData {
  name: string;
  description: string;
  price: string;
  status: RoomStatus;
  area: string;
  equipment: EquipmentType[];
}

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSave: (data: RoomFormData) => void;
  isEditing: boolean;
}

const RoomDialog = ({ open, onOpenChange, room, onSave, isEditing }: RoomDialogProps) => {
  const [form, setForm] = useState<RoomFormData>({
    name: room?.name || "",
    description: room?.description || "",
    price: room?.price.toString() || "",
    status: room?.status || "libre",
    area: room?.area.toString() || "",
    equipment: room?.equipment || [],
  });

  const [newEquipment, setNewEquipment] = useState("");

  const handleAddEquipment = () => {
    if (newEquipment && !form.equipment.includes(newEquipment as EquipmentType)) {
      setForm(prev => ({ ...prev, equipment: [...prev.equipment, newEquipment as EquipmentType] }));
      setNewEquipment("");
    }
  };

  const handleRemoveEquipment = (eq: EquipmentType) => {
    setForm(prev => ({ ...prev, equipment: prev.equipment.filter(e => e !== eq) }));
  };

  const handleSave = () => {
    if (!form.name || !form.price) {
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Modifier la chambre" : "Ajouter une chambre"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Nom de la chambre */}
          <div className="sm:col-span-2">
            <Label>Nom de la chambre *</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Chambre 1 - Master" 
            />
          </div>

          {/* Prix */}
          <div>
            <Label>Loyer mensuel (FCFA) *</Label>
            <Input 
              type="number" 
              value={form.price} 
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Ex: 75000"
            />
            {form.price && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatRoomPrice(Number(form.price))}
              </p>
            )}
          </div>

          {/* Statut */}
          <div>
            <Label>Statut</Label>
            <Select 
              value={form.status} 
              onValueChange={(v) => setForm(prev => ({ ...prev, status: v as RoomStatus }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(roomStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Surface */}
          <div>
            <Label>Surface (m²)</Label>
            <Input 
              type="number" 
              value={form.area} 
              onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
              placeholder="Ex: 25"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea 
              value={form.description} 
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Décrivez la chambre..."
            />
          </div>

          {/* Équipements */}
          <div className="sm:col-span-2">
            <Label>Équipements</Label>
            <div className="flex gap-2 mb-2">
              <Select value={newEquipment} onValueChange={setNewEquipment}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Ajouter un équipement" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((eq) => (
                    <SelectItem key={eq} value={eq}>{equipmentLabels[eq]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddEquipment} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.equipment.map((eq) => (
                  <Badge key={eq} variant="secondary" className="flex items-center gap-1">
                    {equipmentLabels[eq]}
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(eq)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Occupant actuel */}
          {room?.currentOccupant && (
            <div className="sm:col-span-2">
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" /> Occupant actuel
              </Label>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">{room.currentOccupant.name}</p>
                <p className="text-sm text-muted-foreground">{room.currentOccupant.phone}</p>
                <p className="text-sm text-muted-foreground">
                  Depuis le {new Date(room.currentOccupant.startDate).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm">
                  Loyer: <span className={room.currentOccupant.rentPaid ? "text-green-600" : "text-red-600"}>
                    {room.currentOccupant.rentPaid ? "Payé" : "Non payé"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Historique des occupants */}
          {room && room.history.length > 0 && (
            <div className="sm:col-span-2">
              <Label className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4" /> Historique des occupants ({room.history.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {room.history.map((entry) => (
                  <div key={entry.id} className="bg-muted p-2 rounded-md text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.occupantName}</span>
                      <span className="text-muted-foreground">
                        {formatRoomPrice(entry.rentAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.startDate).toLocaleDateString("fr-FR")} - {entry.endDate ? new Date(entry.endDate).toLocaleDateString("fr-FR") : "..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Enregistrer" : "Ajouter la chambre"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDialog;
