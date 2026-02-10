import { Room, roomStatusLabels, formatRoomPrice, equipmentLabels } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, User, Ban, CheckCircle, Clock } from "lucide-react";

interface RoomsListProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
  onToggleStatus: (roomId: string) => void;
}

const statusColors: Record<string, string> = {
  libre: "bg-green-500/10 text-green-500 border-green-500/20",
  occupée: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "en maintenance": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  réservée: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const RoomsList = ({ rooms, onEdit, onDelete, onToggleStatus }: RoomsListProps) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        <p>Aucune chambre enregistrée pour ce bien.</p>
        <p className="text-sm">Cliquez sur "Ajouter une chambre" pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room) => (
        <Card key={room.id} className={room.disabled ? "opacity-50" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
              <Badge variant="outline" className={`${statusColors[room.status] || ""}`}>
                {roomStatusLabels[room.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loyer:</span>
              <span className="font-semibold">{formatRoomPrice(room.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Surface:</span>
              <span>{room.area} m²</span>
            </div>
            
            {/* Équipements */}
            {room.equipment.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Équipements:</p>
                <div className="flex flex-wrap gap-1">
                  {room.equipment.slice(0, 4).map((eq) => (
                    <Badge key={eq} variant="secondary" className="text-xs">
                      {equipmentLabels[eq]}
                    </Badge>
                  ))}
                  {room.equipment.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.equipment.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Occupant actuel */}
            {room.currentOccupant && (
              <div className="bg-muted/50 p-2 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{room.currentOccupant.name}</span>
                  <div className="ml-auto" title={room.currentOccupant.rentPaid ? "Loyer payé" : "Loyer non payé"}>
                    {room.currentOccupant.rentPaid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  {room.currentOccupant.phone} • Depuis {new Date(room.currentOccupant.startDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(room)}
                className="flex-1"
              >
                <Pencil className="w-4 h-4 mr-1" /> Modifier
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleStatus(room.id)}
                className="flex-1"
              >
                {room.disabled ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" /> Activer
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-1" /> Désactiver
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Êtes-vous sûr de vouloir supprimer cette chambre ?")) {
                    onDelete(room.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoomsList;
