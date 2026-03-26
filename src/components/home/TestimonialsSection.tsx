import { Quote, Loader2 } from "lucide-react";
import { useTemoignages } from "@/hooks/useTemoignages";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import FeedbackForm from "@/components/layout/FeedbackForm";

const TestimonialsSection = () => {
  const { data: temoignages = [], isLoading } = useTemoignages();

  if (isLoading) {
    return (
      <section className="py-16 bg-[#0C1A35]">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
          </div>
        </div>
      </section>
    );
  }

  if (temoignages.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-16 bg-[#0C1A35]">
        <div className="container mx-auto px-8">
          <div className="text-center mb-12">
            <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">
              Témoignages
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {temoignages.map((temoignage) => (
                <CarouselItem key={temoignage.id} className="pl-4 basis-full md:basis-1/3">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 relative h-full">
                    <Quote className="w-10 h-10 text-[#D4A843] absolute top-4 right-4 opacity-30" />
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
                      "{temoignage.temoignage}"
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-12 h-12 rounded-full bg-[#D4A843] flex items-center justify-center text-[#0C1A35] font-bold text-lg flex-shrink-0">
                        {temoignage.nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold line-clamp-1">{temoignage.nom}</p>
                        <p className="text-slate-400 text-xs">Utilisateur Seek</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:-left-12 bg-white/70 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400 text-[#1A2942]" />
            <CarouselNext className="right-2 md:-right-12 bg-white/70 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400 text-[#1A2942]" />
          </Carousel>
        </div>
      </section>
      <FeedbackForm />
    </>
  );
};

export default TestimonialsSection;
