import { Property, formatPrice } from "@/data/properties";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, Eye, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  properties: Property[];
}

const StatsCards = ({ properties }: StatsCardsProps) => {
  const totalProperties = properties.length;
  const forSale = properties.filter((p) => p.status === "à vendre").length;
  const forRent = properties.filter((p) => p.status === "à louer").length;
  const sold = properties.filter((p) => p.status === "vendu" || p.status === "loué").length;

  const totalValue = properties
    .filter((p) => p.status === "à vendre")
    .reduce((sum, p) => sum + p.price, 0);

  const stats = [
    {
      label: "Total biens",
      value: totalProperties,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "En vente",
      value: forSale,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "En location",
      value: forRent,
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Vendus / Loués",
      value: sold,
      icon: CheckCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
