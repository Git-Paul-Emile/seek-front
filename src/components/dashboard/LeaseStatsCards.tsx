import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LeaseStatsCardsProps {
  cards: {
    title: string;
    value: number;
    icon: React.ElementType;
  }[];
}

export function LeaseStatsCards({ cards }: LeaseStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
