import { useState, useEffect } from "react";
import { Quote, Loader2, Plus, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTemoignages } from "@/hooks/useTemoignages";
import { createTemoignage } from "@/api/temoignage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const { data: temoignages = [], isLoading } = useTemoignages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    profession: "",
    temoignage: "",
  });

  const createMutation = useMutation({
    mutationFn: createTemoignage,
    onSuccess: () => {
      toast.success("Votre témoignage a été soumis avec succès ! Il sera publié après validation par nos administrateurs.");
      setFormData({ nom: "", profession: "", temoignage: "" });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la soumission");
    },
  });

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.temoignage.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createMutation.mutate({
      nom: formData.nom.trim(),
      profession: formData.profession.trim() || undefined,
      temoignage: formData.temoignage.trim(),
    });
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

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

  const isEmpty = temoignages.length === 0;

  return (
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

        {isEmpty ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm mb-6">
              Soyez le premier à partager votre expérience avec Seek !
            </p>
          </div>
        ) : (
          <div className="relative">
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
                          <p className="text-slate-400 text-xs">
                            {temoignage.profession || "Utilisateur Seek"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-white/70 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400 text-[#1A2942]" />
              <CarouselNext className="right-2 bg-white/70 hover:bg-white shadow-lg border-2 border-amber-400/30 hover:border-amber-400 text-[#1A2942]" />
            </Carousel>
          </div>
        )}

        <div className="text-center mt-8">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#D4A843] hover:bg-[#B8943A] text-[#0C1A35] font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Partager votre expérience
          </Button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[#D4A843] text-xs font-semibold uppercase tracking-widest mb-0.5">
                    Votre avis compte
                  </p>
                  <h3 className="text-lg font-bold text-[#0C1A35]">Partagez votre témoignage</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-slate-500 text-sm mb-5">
                  Racontez-nous comment Seek vous a aidé. Votre témoignage sera publié après validation.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nom" className="text-slate-700 text-sm font-medium mb-1.5 block">
                      Nom <span className="text-[#D4A843]">*</span>
                    </Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={handleChange("nom")}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="profession" className="text-slate-700 text-sm font-medium mb-1.5 block">
                      Profession <span className="text-slate-400 text-xs font-normal">(optionnel)</span>
                    </Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={handleChange("profession")}
                      placeholder="Ex : Agent immobilier, Étudiant…"
                    />
                  </div>

                  <div>
                    <Label htmlFor="temoignage" className="text-slate-700 text-sm font-medium mb-1.5 block">
                      Témoignage <span className="text-[#D4A843]">*</span>
                    </Label>
                    <Textarea
                      id="temoignage"
                      value={formData.temoignage}
                      onChange={handleChange("temoignage")}
                      placeholder="Racontez votre expérience avec Seek…"
                      rows={4}
                      required
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1 bg-[#D4A843] hover:bg-[#B8943A] text-[#0C1A35] font-semibold"
                    >
                      {createMutation.isPending ? "Envoi…" : "Envoyer mon témoignage"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
