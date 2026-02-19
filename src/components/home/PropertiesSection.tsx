import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PropertyCard from "@/components/PropertyCard";
import { MOCK_PROPERTIES, SORT_OPTIONS } from "@/data/home";

const TABS = [
  { value: "latest", label: "Dernières", properties: MOCK_PROPERTIES },
  { value: "nearby", label: "À proximité", properties: MOCK_PROPERTIES.slice(0, 3) },
];

const PropertiesSection = () => {
  const [sort, setSort] = useState("recent");

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">À la une</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2942]">Annonces populaires</h2>
            <p className="text-slate-400 mt-1.5 text-sm">Découvrez les biens les plus demandés au Sénégal</p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 h-9 text-sm border-slate-200 text-[#1A2942] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9 border-slate-200 text-[#1A2942] hover:border-[#0C1A35] text-sm">
              Toutes les annonces
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="latest">
          <TabsList className="bg-slate-100 p-1 rounded-xl mb-8 h-auto w-auto inline-flex">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-5 py-2 text-sm data-[state=active]:bg-[#0C1A35] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent className="-ml-5">
                  {tab.properties.map((p) => (
                    <CarouselItem key={p.id} className="pl-5 md:basis-1/2 lg:basis-1/4">
                      <PropertyCard property={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 -translate-x-1/2" />
                <CarouselNext className="right-0 translate-x-1/2" />
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default PropertiesSection;
