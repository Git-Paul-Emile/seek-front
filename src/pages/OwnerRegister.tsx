import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerOwner, setCurrentOwner } from "@/lib/owner-api";
import { useToast } from "@/components/ui/use-toast";

export default function OwnerRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
  } = useForm({
    mode: "onSubmit",
  });

  const formValues = watch();

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 25) return "Faible";
    if (strength <= 50) return "Moyen";
    if (strength <= 75) return "Bon";
    return "Excellent";
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Appel API vers db.json
      const result = await registerOwner({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        ownerType: "PARTICULAR",
        password: data.password,
      });

      if (result.success && result.owner) {
        // Stocker le propriétaire connecté
        setCurrentOwner(result.owner);
        
        toast({
          title: "Félicitations ! 🎉",
          description: "Votre compte propriétaire est créé avec succès !",
          duration: 5000,
        });

        // Redirection immédiate vers l'espace admin
        navigate("/admin");
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer dans quelques instants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            SEEK
          </h1>
          <p className="text-gray-600 mt-2">Créer votre compte propriétaire</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nom complet */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Nom et prénom
                </Label>
                <Input
                  id="fullName"
                  placeholder="Votre nom et prénom"
                  className="h-11"
                  {...register("fullName")}
                />
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Téléphone
                  <span className="text-gray-400 font-normal ml-1">(Sénégal)</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="77 12 34 56 78"
                  className="h-11"
                  {...register("phone")}
                />
              </div>

              {/* Adresse personnelle */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Adresse personnelle
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Votre adresse au Sénégal"
                    className="h-11 pl-10"
                    {...register("address")}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    className="h-11 pr-10"
                    {...register("password")}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPasswordValue(value);
                      setPasswordStrength(calculatePasswordStrength(value));
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Cases à cocher légales */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    className="mt-0.5"
                    {...register("acceptTerms")}
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-600 leading-tight cursor-pointer"
                  >
                    J'accepte les{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      conditions d'utilisation
                    </a>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptPrivacy"
                    className="mt-0.5"
                    {...register("acceptPrivacy")}
                  />
                  <label
                    htmlFor="acceptPrivacy"
                    className="text-sm text-gray-600 leading-tight cursor-pointer"
                  >
                    Je prends connaissance de la{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      politique de confidentialité
                    </a>
                  </label>
                </div>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
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
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Créer mon compte
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lien vers connexion */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Vous avez déjà un compte ?{" "}
          <a href="/owner/login" className="text-primary font-medium hover:underline">
            Connectez-vous
          </a>
        </p>
      </div>
    </div>
  );
}
