import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, MessageSquareText, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";
import {
  resendOwnerOtpApi,
  resendOwnerOtpPublicApi,
  verifyOwnerPhoneApi,
  verifyOwnerPhonePublicApi,
} from "@/api/ownerAuth";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";

const OWNER_PENDING_OTP_KEY = "ownerPendingOtp";

type PendingOtpData = {
  proprietaireId: string;
  prenom?: string;
  telephone?: string;
};

function readPendingOtp(): PendingOtpData | null {
  try {
    const raw = sessionStorage.getItem(OWNER_PENDING_OTP_KEY);
    return raw ? (JSON.parse(raw) as PendingOtpData) : null;
  } catch {
    return null;
  }
}

function maskPhone(phone?: string) {
  if (!phone) return "votre téléphone";
  const compact = phone.replace(/\s+/g, "");
  if (compact.length <= 4) return phone;
  return `${compact.slice(0, 4)} ${"*".repeat(Math.max(0, compact.length - 6))}${compact.slice(-2)}`;
}

export default function VerifyOwnerPhone() {
  const navigate = useNavigate();
  const { owner, setOwner, isLoading, isAuthenticated } = useOwnerAuth();
  const { refreshMe: refreshPublicAccount } = useComptePublicAuth();
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<PendingOtpData | null>(() => readPendingOtp());
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!isLoading && owner?.telephoneVerifie) {
      sessionStorage.removeItem(OWNER_PENDING_OTP_KEY);
      navigate("/owner/dashboard", { replace: true });
    }
  }, [isLoading, navigate, owner?.telephoneVerifie]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pending) {
      navigate("/owner/register", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, pending]);

  const currentPhone = useMemo(() => owner?.telephone ?? pending?.telephone, [owner?.telephone, pending?.telephone]);
  const currentFirstName = useMemo(() => owner?.prenom ?? pending?.prenom ?? "propriétaire", [owner?.prenom, pending?.prenom]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      toast.error("Saisis le code OTP à 6 chiffres reçu par SMS.");
      return;
    }

    setSubmitting(true);
    try {
      const response = owner
        ? await verifyOwnerPhoneApi(cleanOtp)
        : await verifyOwnerPhonePublicApi({
            proprietaireId: pending!.proprietaireId,
            otp: cleanOtp,
          });

      sessionStorage.removeItem(OWNER_PENDING_OTP_KEY);
      setOwner(response.data.data);
      await refreshPublicAccount();
      toast.success("Numéro vérifié avec succès.");
      navigate("/owner/dashboard", { replace: true });
    } catch (error: any) {
      toast.error("Le code OTP est invalide ou expiré.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (owner) {
        await resendOwnerOtpApi();
      } else if (pending?.proprietaireId) {
        await resendOwnerOtpPublicApi(pending.proprietaireId);
      } else {
        toast.error("Impossible de retrouver votre inscription en attente.");
        return;
      }

      setPending(readPendingOtp());
    } catch (error: any) {
      toast.error("Impossible de renvoyer le code OTP pour le moment.");
    } finally {
      setResending(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/82 to-[#0C1A35]/45" />

      <header className="relative z-10 container mx-auto flex items-center justify-between h-16 px-4">
        <span className="font-display text-xl font-bold tracking-widest text-[#D4A843]">SEEK</span>
        <Link
          to={owner ? "/owner/login" : "/owner/register"}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D4A843]">
              Espace Propriétaires
            </span>
          </div>

          <div className="mb-6 flex items-center justify-center gap-3 text-xs font-medium text-white/45">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              Compte créé
            </div>
            <div className="h-px w-8 bg-white/15" />
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A843] text-[#0C1A35]">
                2
              </span>
              Vérification SMS
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4A843]/15 text-[#D4A843]">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>

            <h1 className="font-display text-center text-4xl font-bold text-white leading-tight">
              Vérifie ton numéro
            </h1>
            <p className="mt-3 text-center text-sm text-white/50">
              Un code OTP a été envoyé par SMS à <span className="font-medium text-white/80">{maskPhone(currentPhone)}</span>.
              Saisis-le ci-dessous pour finaliser la connexion.
            </p>

           

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0C1A35]/25 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Conseil</p>
              <p className="mt-1 text-sm text-white/65">
                Garde cette page ouverte pendant que tu consultes le SMS, puis reviens saisir les 6 chiffres.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="otp" className="mb-2 block text-xs font-medium text-white/60">
                  Code OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-center text-lg tracking-[0.35em] text-white outline-none transition-all placeholder:text-white/25 focus:border-white/40 focus:bg-white/15"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D4A843] text-sm font-semibold text-white transition-colors hover:bg-[#D4A843]/90 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Valider le code"
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-white/70 transition-colors hover:text-white disabled:opacity-60"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Renvoyer le code par SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
