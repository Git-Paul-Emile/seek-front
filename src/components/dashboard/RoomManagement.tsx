import React, { useState, useMemo } from 'react';
import { Property, Room, RoomStatus } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, History, TrendingUp, Home, DollarSign, Calendar, Phone } from 'lucide-react';
import RoomsList from './RoomsList';
import RoomDialog, { RoomFormData as LocalRoomFormData } from './RoomDialog';
import { useToast } from '@/components/ui/use-toast';

interface RoomManagementProps {
  property: Property;
  onPropertyUpdate: (property: Property) => void;
}

const statusColors: Record<RoomStatus, string> = {
  libre: 'bg-green-100 text-green-800',
  occupée: 'bg-blue-100 text-blue-800',
  'en maintenance': 'bg-orange-100 text-orange-800',
  réservée: 'bg-purple-100 text-purple-800',
};

const RoomManagement: React.FC<RoomManagementProps> = ({ property, onPropertyUpdate }) => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>(property.rooms || []);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Statistiques des chambres
  const roomStats = useMemo(() => {
    const total = rooms.filter(r => !r.disabled).length;
    const occupied = rooms.filter(r => r.status === 'occupée' && !r.disabled).length;
    const free = rooms.filter(r => r.status === 'libre' && !r.disabled).length;
    const maintenance = rooms.filter(r => r.status === 'en maintenance' && !r.disabled).length;
    const reserved = rooms.filter(r => r.status === 'réservée' && !r.disabled).length;
    const totalRent = rooms.filter(r => r.status === 'occupée' && !r.disabled).reduce((sum, r) => sum + r.price, 0);
    const potentialRent = rooms.filter(r => !r.disabled).reduce((sum, r) => sum + r.price, 0);
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return { total, occupied, free, maintenance, reserved, totalRent, potentialRent, occupancyRate };
  }, [rooms]);

  // Générer un ID unique
  const generateRoomId = () => `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Sauvegarder une chambre
  const handleSaveRoom = (formData: LocalRoomFormData) => {
    if (isEditing && selectedRoom) {
      // Modifier la chambre existante
      setRooms(prev => prev.map(room => 
        room.id === selectedRoom.id
          ? {
              ...room,
              name: formData.name,
              description: formData.description,
              price: parseInt(formData.price) || 0,
              status: formData.status,
              area: parseInt(formData.area) || 0,
              equipment: formData.equipment,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : room
      ));
      toast({
        title: 'Chambre modifiée',
        description: 'Les informations de la chambre ont été mises à jour',
      });
    } else {
      // Ajouter une nouvelle chambre
      const newRoom: Room = {
        id: generateRoomId(),
        propertyId: property.id,
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price) || 0,
        status: formData.status,
        area: parseInt(formData.area) || 0,
        equipment: formData.equipment,
        images: [],
        currentOccupant: undefined,
        history: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        disabled: false,
      };
      setRooms(prev => [...prev, newRoom]);
      toast({
        title: 'Chambre ajoutée',
        description: 'La chambre a été ajoutée avec succès',
      });
    }
    setIsDialogOpen(false);
    setSelectedRoom(null);
  };

  // Supprimer une chambre
  const handleDeleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
    toast({
      title: 'Chambre supprimée',
      description: 'La chambre a été supprimée avec succès',
    });
  };

  // Activer/désactiver une chambre
  const handleToggleStatus = (roomId: string) => {
    setRooms(prev => prev.map(room =>
      room.id === roomId
        ? { ...room, disabled: !room.disabled, updatedAt: new Date().toISOString().split('T')[0] }
        : room
    ));
    const room = rooms.find(r => r.id === roomId);
    toast({
      title: room?.disabled ? 'Chambre activée' : 'Chambre désactivée',
      description: room?.disabled ? 'La chambre est maintenant visible' : 'La chambre a été masquée',
    });
  };

  // Ouvrir le dialog d'ajout
  const handleOpenAddDialog = () => {
    setSelectedRoom(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // Ouvrir le dialog de modification
  const handleOpenEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Mettre à jour la propriété parente
  const handlePropertyUpdate = () => {
    onPropertyUpdate({
      ...property,
      rooms,
      // Mettre à jour le statut de la propriété selon les chambres
      status: roomStats.total > 0
        ? roomStats.occupied === roomStats.total
          ? 'loué'
          : roomStats.free === roomStats.total
            ? 'libre'
            : 'partiellement loué'
        : property.status,
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Chambres</h2>
          <p className="text-muted-foreground">
            {property.title} • {property.location.address}, {property.location.city}
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une chambre
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Home className="h-5 w-5 mx-auto text-gray-400 mb-1" />
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold">{roomStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-green-600">Libres</p>
              <p className="text-2xl font-bold text-green-600">{roomStats.free}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto text-blue-400 mb-1" />
              <p className="text-sm font-medium text-blue-600">Occupées</p>
              <p className="text-2xl font-bold text-blue-600">{roomStats.occupied}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-purple-600">Réservées</p>
              <p className="text-2xl font-bold text-purple-600">{roomStats.reserved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-orange-600">Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{roomStats.maintenance}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taux d'occupation et revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Taux d'occupation
            </CardTitle>
            <CardDescription>
              {roomStats.occupied} chambre(s) occupée(s) sur {roomStats.total} chambre(s) disponible(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={roomStats.occupancyRate} className="flex-1" />
              <span className="text-lg font-bold">{roomStats.occupancyRate}%</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Revenus actuels:</span>
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat('fr-FR').format(roomStats.totalRent)} F
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Revenus potentiels:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('fr-FR').format(roomStats.potentialRent)} F
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Loyers par chambre
            </CardTitle>
            <CardDescription>
              Répartition des loyers mensuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rooms.filter(r => !r.disabled).slice(0, 4).map((room) => (
                <div key={room.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[room.status]}>
                      {room.status === 'occupée' ? '●' : '○'}
                    </Badge>
                    <span className="text-sm">{room.name}</span>
                  </div>
                  <span className="font-medium">
                    {new Intl.NumberFormat('fr-FR').format(room.price)} F
                  </span>
                </div>
              ))}
              {rooms.filter(r => !r.disabled).length > 4 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{rooms.filter(r => !r.disabled).length - 4} autres chambres
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des chambres */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Chambres</CardTitle>
          <CardDescription>
            Gérez les chambres de votre bien en colocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomsList
            rooms={rooms}
            onEdit={handleOpenEditDialog}
            onDelete={handleDeleteRoom}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Dialog d'ajout/modification */}
      <RoomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        room={selectedRoom}
        onSave={handleSaveRoom}
        isEditing={isEditing}
      />
    </div>
  );
};

export default RoomManagement;
