import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Home, Phone, Lock, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Schémas de validation pour la récupération de mot de passe

export default function OwnerForgotPassword() {
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "code" | "success">("phone");
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour l'étape 1 : Saisie du téléphone
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  // État pour l'étape 2 : Saisie du code et nouveau mot de passe
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePhone = (): boolean => {
    const phoneRegex = /^7[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Veuillez entrer un numéro de téléphone sénégalais valide (9 chiffres commençant par 7)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulation de l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Code envoyé",
        description: `Un code de réinitialisation a été envoyé au ${phone}`,
        duration: 5000,
      });
      
      setStep("code");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    // Validation du code
    if (code.length !== 6) {
      setCodeError("Le code doit contenir 6 chiffres");
      return;
    }
    setCodeError("");
    
    // Validation du nouveau mot de passe
    if (newPassword.length < 8) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins une majuscule";
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins une minuscule";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins un chiffre";
    }
    
    // Validation de la confirmation
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }
    
    setPasswordErrors({});
    setIsLoading(true);
    
    try {
      // Simulation de l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été modifié avec succès !",
        duration: 5000,
      });
      
      setStep("success");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Code envoyé",
        description: `Un nouveau code a été envoyé au ${phone}`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
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
        </div>

        {/* Étape 1 : Saisie du téléphone */}
        {step === "phone" && (
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre numéro de téléphone pour recevoir un code de réinitialisation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Téléphone <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">(Sénégal)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="77 12 34 56 78"
                      className={`h-11 pl-10 ${phoneError ? "border-red-500" : ""}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-500">{phoneError}</p>
                  )}
                </div>

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
                      Envoi en cours...
                    </span>
                  ) : (
                    "Recevoir le code"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Étape 2 : Saisie du code et nouveau mot de passe */}
        {step === "code" && (
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Vérification</CardTitle>
              <CardDescription>
                Entrez le code reçu par SMS et créez un nouveau mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {/* Code OTP */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                    Code de vérification <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      className={`h-11 pl-10 text-center text-lg tracking-widest ${codeError ? "border-red-500" : ""}`}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                    />
                  </div>
                  {codeError && (
                    <p className="text-sm text-red-500">{codeError}</p>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    Pas reçu le code ?{" "}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Renvoyer
                    </button>
                  </p>
                </div>

                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    Nouveau mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      className={`h-11 pl-10 pr-10 ${passwordErrors.newPassword ? "border-red-500" : ""}`}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirmation du mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`h-11 pl-10 pr-10 ${passwordErrors.confirmPassword ? "border-red-500" : ""}`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

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
                      Réinitialisation...
                    </span>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Étape 3 : Succès */}
        {step === "success" && (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Mot de passe réinitialisé !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link to="/owner/login">
                <Button className="w-full h-12 text-base font-semibold">
                  Se connecter
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Lien de retour */}
        {step !== "success" && (
          <p className="text-center text-sm text-gray-600 mt-6">
            <Link to="/owner/login" className="text-primary font-medium hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
