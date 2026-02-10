import { Property, typeLabels, statusLabels, formatPrice } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Archive, RotateCcw, DoorOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertiesTableProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  showArchive?: boolean;
  onViewRooms?: (property: Property) => void;
}

const statusColors: Record<string, string> = {
  libre: "bg-green-500/10 text-green-500 border-green-500/20",
  loué: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "partiellement loué": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "en maintenance": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "à vendre": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  vendu: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const PropertiesTable = ({ properties, onEdit, onDelete, onArchive, showArchive, onViewRooms }: PropertiesTableProps) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bien</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Type</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prix</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Statut</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Mode</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Chambres</th>
              <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.coverImage} alt="" className="w-12 h-12 rounded-md object-cover shrink-0" />
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.location.city}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{typeLabels[p.type]}</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">{formatPrice(p.price, p.status, p.rentalMode)}</td>
                <td className="p-4 hidden sm:table-cell">
                  <Badge variant="outline" className={`text-xs ${statusColors[p.status] || ""}`}>
                    {statusLabels[p.status]}
                  </Badge>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  {p.rentalMode && (
                    <Badge variant="secondary" className="text-xs">
                      {p.rentalMode === "colocation" ? "Colocation" : "Classique"}
                    </Badge>
                  )}
                </td>
                <td className="p-4 hidden lg:table-cell">
                  {p.rentalMode === "colocation" && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <DoorOpen className="w-3 h-3" />
                      {p.rooms?.length || 0}
                    </Badge>
                  )}
                </td>
                <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{p.updatedAt}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/annonce/${p.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    {p.rentalMode === "colocation" && onViewRooms && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary hover:text-primary" 
                        onClick={() => onViewRooms(p)}
                        title="Gérer les chambres"
                      >
                        <DoorOpen className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {onArchive && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500" 
                        onClick={() => onArchive(p.id)}
                        title={showArchive ? "Désarchiver" : "Archiver"}
                      >
                        {showArchive ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive" 
                      onClick={() => onDelete(p.id)}
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  {showArchive 
                    ? "Aucun bien archivé." 
                    : "Aucune annonce. Cliquez sur \"Ajouter\" pour publier votre premier bien."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertiesTable;
