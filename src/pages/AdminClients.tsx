import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, Search, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const clients = [
  {
    id: "1",
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "+237 6 11 22 33 44",
    status: "actif",
    interests: ["Appartement", "Villa"],
    lastContact: "2024-01-15",
  },
  {
    id: "2",
    name: "Pierre Martin",
    email: "pierre.martin@email.com",
    phone: "+237 6 55 66 77 88",
    status: "nouveau",
    interests: ["Maison", "Terrain"],
    lastContact: "2024-01-14",
  },
  {
    id: "3",
    name: "Sophie Bernard",
    email: "sophie.bernard@email.com",
    phone: "+237 6 99 00 11 22",
    status: "inactif",
    interests: ["Studio"],
    lastContact: "2024-01-10",
  },
  {
    id: "4",
    name: "Jean Petit",
    email: "jean.petit@email.com",
    phone: "+237 6 33 44 55 66",
    status: "actif",
    interests: ["Appartement", "Duplex"],
    lastContact: "2024-01-16",
  },
];

const AdminClients = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Gestion clients"
        icon={Users}
        description="Gérez vos contacts et prospects"
        action={
          <Button>+ Ajouter un client</Button>
        }
      >
        Mes clients
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.filter((c) => c.status === "actif").length}</div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.filter((c) => c.status === "nouveau").length}</div>
            <p className="text-xs text-muted-foreground">Nouveaux prospects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Demandes ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des clients</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-md bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Intérêts</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Dernier contact</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                          {client.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          client.status === "actif"
                            ? "bg-green-500/10 text-green-500"
                            : client.status === "nouveau"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-gray-500/10 text-gray-500"
                        }
                      >
                        {client.status}
                      </Badge>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {client.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {client.lastContact}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClients;
