import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Building2,
  Mail,
  MessageSquare,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Home,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ownerProfileSchema, OwnerProfileData } from "@/lib/owner-validation";
import { useToast } from "@/components/ui/use-toast";

export default function OwnerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<OwnerProfileData>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onChange",
  });

  const ownerType = watch("ownerType");

  const calculateCompleteness = (data: OwnerProfileData): number => {
    let score = 20; // Base score pour avoir complété l'inscription
    if (data.email) score += 20;
    if (data.whatsapp) score += 15;
    if (data.city) score += 15;
    if (data.ownerType) score += 15;
    if (data.ownerType === "COMPANY" && data.companyName) score += 15;
    return Math.min(score, 100);
  };

  const onSubmit = async (data: OwnerProfileData) => {
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Profil complété ! ✨",
        description: "Votre profil est maintenant optimisé pour attirer des locataires.",
        duration: 5000,
      });

      // Redirection vers le dashboard ou création d'annonce
      navigate("/owner/dashboard");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Indicateur de complétude du profil */}
        <div className="mb-8 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Complétude de votre profil
            </span>
            <span className="text-sm font-bold text-blue-600">20%</span>
          </div>
          <Progress value={20} className="h-2 mb-2" />
          <p className="text-xs text-gray-500">
            Complétez votre profil pour augmenter la visibilité de vos annonces
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">
              {step === 1 ? "Bienvenue parmi nos propriétaires !" : "Dites-nous en plus"}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1
                ? "Personnalisez votre expérience pour trouver des locataires rapidement"
                : "Ces informations aideront les locataires à vous connaître"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  {/* Email optionnel */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Adresse email (recommandé)
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@exemple.com"
                        className="pl-10 h-11"
                        {...register("email")}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Recevez les notifications de nouvelles demandes de visite directement dans votre boîte mail
                    </p>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* WhatsApp optionnel */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm font-medium">
                      Numéro WhatsApp (optionnel)
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="whatsapp"
                        placeholder="06 12 34 56 78"
                        className="pl-10 h-11"
                        {...register("whatsapp")}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Les demandes peuvent vous être envoyées par message instantané
                    </p>
                    {errors.whatsapp && (
                      <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
                    )}
                  </div>

                  {/* Ville */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      Dans quelle ville souhaitez-vous publier des biens ?
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        placeholder="Paris, Lyon, Marseille..."
                        className="pl-10 h-11"
                        {...register("city")}
                      />
                    </div>
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full h-12"
                    onClick={() => setStep(2)}
                  >
                    Continuez
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Type de propriétaire */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Vous êtes un...
                    </Label>
                    <RadioGroup
                      value={ownerType}
                      onValueChange={(value: "PARTICULAR" | "COMPANY") =>
                        setValue("ownerType", value, { shouldValidate: true })
                      }
                      className="grid grid-cols-1 gap-3"
                    >
                      <label
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                          ownerType === "PARTICULAR"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value="PARTICULAR" className="mr-3" />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">Particulier</div>
                            <div className="text-sm text-gray-500">
                              Je loue un bien que je possède personnellement
                            </div>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                          ownerType === "COMPANY"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value="COMPANY" className="mr-3" />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Société</div>
                            <div className="text-sm text-gray-500">
                              Je représente une entreprise ou une SCI
                            </div>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                    {errors.ownerType && (
                      <p className="text-sm text-red-500">{errors.ownerType.message}</p>
                    )}
                  </div>

                  {/* Dénomination sociale conditionnelle */}
                  {ownerType === "COMPANY" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label htmlFor="companyName" className="text-sm font-medium">
                        Nom de la société ou raison sociale <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Exemple : SCI Les Tilleuls"
                        className="h-11"
                        {...register("companyName")}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-red-500">{errors.companyName.message}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={() => setStep(1)}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Sauvegarde...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Terminer
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Message d'encouragement */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ⏭️ Vous pourrez compléter ces informations plus tard depuis votre espace
          </p>
        </div>
      </div>
    </div>
  );
}
