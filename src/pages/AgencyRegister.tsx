import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  CheckCircle2,
  Shield,
  Users,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Schéma de validation Zod pour l'inscription agence
const agencyRegisterSchema = z
  .object({
    name: z.string().min(2, "Le nom de l'agence est requis"),
    legalName: z.string().min(2, "La raison sociale est requise"),
    email: z.string().email("Adresse email invalide"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    address: z.string().min(5, "L'adresse est requise"),
    city: z.string().min(2, "La ville est requise"),
    country: z.string().min(2, "Le pays est requis"),
    licenseNumber: z.string().optional(),
    taxId: z.string().optional(),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions" }),
    }),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter la politique de confidentialité" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type AgencyRegisterForm = z.infer<typeof agencyRegisterSchema>;

const AgencyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AgencyRegisterForm>({
    resolver: zodResolver(agencyRegisterSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 25) return "Faible";
    if (strength <= 50) return "Moyen";
    if (strength <= 75) return "Bon";
    return "Excellent";
  };

  const onSubmit = async (data: AgencyRegisterForm) => {
    setIsLoading(true);

    try {
      // Simulation de l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Félicitations ! 🎉",
        description:
          "Votre compte agence est créé ! Vous pouvez maintenant gérer vos propriétés et clients.",
        duration: 5000,
      });

      navigate("/agency/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue. Veuillez réessayer dans quelques instants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Indicateur de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Création de compte agence</span>
            <span>100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Créer votre espace agence
            </CardTitle>
            <CardDescription className="text-center text-base">
              Gérez vos propriétés, propriétaires et locataires en toute simplicité
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nom de l'agence */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nom de l'agence <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Exemple : SEEK Immobilier"
                  className={`h-11 ${
                    errors.name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Raison sociale */}
              <div className="space-y-2">
                <Label htmlFor="legalName" className="text-sm font-medium">
                  Raison sociale <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="legalName"
                  placeholder="Exemple : SEEK Immobilier SARL"
                  className={`h-11 ${
                    errors.legalName
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("legalName")}
                />
                {errors.legalName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.legalName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email professionnel <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@agence.com"
                  className={`h-11 ${
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+221 77 123 45 67"
                  className={`h-11 ${
                    errors.phone
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Adresse <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="Adresse de l'agence"
                  className={`h-11 ${
                    errors.address
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.address.message}
                  </p>
                )}
              </div>

              {/* Ville et Pays */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    Ville <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Dakar"
                    className={`h-11 ${
                      errors.city
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Pays <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    placeholder="Sénégal"
                    className={`h-11 ${
                      errors.country
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    {...register("country")}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Numéro de licence (optionnel) */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-sm font-medium">
                  Numéro de licence (optionnel)
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="Numéro d'agrément"
                  className="h-11"
                  {...register("licenseNumber")}
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8 caractères minimum"
                    className={`h-11 pr-10 ${
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    {...register("password")}
                    onChange={(e) =>
                      setPasswordStrength(calculatePasswordStrength(e.target.value))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                {/* Indicateur de force du mot de passe */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(
                            passwordStrength
                          )}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Utilisez un mot de passe d'au moins 8 caractères avec des
                  chiffres et des lettres
                </p>
              </div>

              {/* Confirmer le mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le mot de passe{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Répétez votre mot de passe"
                  className={`h-11 ${
                    errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.confirmPassword.message}
                  </p>
                )}
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
                    J'ai lu et j'accepte les{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Conditions d'utilisation
                    </a>{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-500 ml-6">
                    {errors.acceptTerms.message}
                  </p>
                )}

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
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Politique de confidentialité
                    </a>{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.acceptPrivacy && (
                  <p className="text-sm text-red-500 ml-6">
                    {errors.acceptPrivacy.message}
                  </p>
                )}
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
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
                    Création du compte...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Créer mon compte agence
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Avantages */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>Gestion de multiples propriétés et propriétaires</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Gestion d'équipe avec rôles et permissions</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <FileText className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <span>Rapports et statistiques détaillés</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lien vers connexion */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Vous avez déjà un compte ?{" "}
          <a
            href="/agency/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Connectez-vous
          </a>
        </p>
      </div>
    </div>
  );
};

export default AgencyRegister;
