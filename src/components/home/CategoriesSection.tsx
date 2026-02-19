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
    <section className="py-16 bg-[#F8F5EE]">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">Explorer</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2942] mb-1">Parcourir par catégorie</h2>
          <p className="text-slate-400 text-sm">Trouvez le type de bien qui vous correspond</p>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 h-44 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {types.map((type) => (
                <CarouselItem key={type.id} className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-[14.285%]">
                  <CategoryCard category={{ id: type.slug, name: type.nom, image: type.image ?? "", count: 0 }} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-1/2" />
            <CarouselNext className="right-0 translate-x-1/2" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
