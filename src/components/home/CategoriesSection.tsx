import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CategoryCard from "@/components/CategoryCard";
import { useTypeLogements } from "@/hooks/useTypeLogements";

const CategoriesSection = () => {
  const { data: types = [], isLoading } = useTypeLogements();

  return (
    <section className="py-8 bg-[#F8F5EE]">
      <div className="container mx-auto px-8">
        <div className="mb-4">
          <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">Découvrir</p>
          <h2 className="font-bold text-[#1A2942] mb-1" style={{ fontSize: '1.8rem' }}>Quel logement cherchez-vous ?</h2>
          <p className="text-slate-400 text-sm">Appartement, villa, studio… parcourez par type de bien</p>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 h-44 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start" }} className="w-full overflow-x-clip">
            <CarouselContent className="-ml-4">
              {types.map((type) => (
                <CarouselItem key={type.id} className="pl-4 basis-1/2 sm:basis-1/4 md:basis-1/5 lg:basis-[14.285%]">
                  <CategoryCard category={{ id: type.slug, name: type.nom, image: type.image ?? "", count: type.count || 0 }} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
