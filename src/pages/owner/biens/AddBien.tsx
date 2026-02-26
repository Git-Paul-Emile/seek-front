import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Building2, Home, BedDouble, MapPin,
  Briefcase, Layers, Ruler, Zap, DollarSign, ImageIcon,
  Plus, X, ChevronRight, Info, Upload, Loader2, AlertCircle,
  ArrowLeftRight, CircleDot, Check, ChevronLeft, ChevronDown,
  PawPrint, Cigarette, WifiIcon, Search, Star, ArrowLeft,
} from "lucide-react";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useTypeTransactions } from "@/hooks/useTypeTransactions";
import { useStatutsBien } from "@/hooks/useStatutsBien";
import { useEquipements } from "@/hooks/useEquipements";
import { useMeubles } from "@/hooks/useMeubles";
import { useCreateBien, useBienById, useSoumettreRevision } from "@/hooks/useBien";
import { usePays, useVilles } from "@/hooks/useGeo";
import type { TypeLogement } from "@/api/typeLogement";
import type { TypeTransaction } from "@/api/typeTransaction";
import type { StatutBien } from "@/api/statutBien";
import type { Equipement } from "@/api/equipement";
import type { Meuble } from "@/api/meuble";
import type { Pays, Ville } from "@/api/geo";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const SLUG_ICONS: Record<string, React.ElementType> = {
  appartement: Building2, maison: Home, studio: Layers,
  villa: Home, chambre: BedDouble, bureau: Briefcase, terrain: MapPin,
};


const FREQUENCES = [
  { value: "journalier",   label: "Journalier" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel",      label: "Mensuel" },
  { value: "trimestriel",  label: "Trimestriel" },
  { value: "semestriel",   label: "Semestriel" },
  { value: "annuel",       label: "Annuel" },
  { value: "unique",       label: "Paiement unique" },
];

const TABS = [
  { id: "general",     label: "Infos générales",    icon: Info },
  { id: "caract",      label: "Caractéristiques",   icon: Ruler },
  { id: "transaction", label: "Statut & Prix",       icon: DollarSign },
  { id: "options",     label: "Options & Équipements", icon: Zap },
  { id: "medias",      label: "Médias",              icon: ImageIcon },
];

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/jfif", "image/pjpeg"];
const MAX_SIZE = 5 * 1024 * 1024;

// ─── Nominatim types ──────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 placeholder:text-slate-300 outline-none " +
  "focus:border-[#D4A843]/60 focus:bg-white transition-all";

const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

const parseOptionalNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{ width: "40px", height: "22px" }}
        className={`relative rounded-full flex-shrink-0 transition-colors duration-200 ${checked ? "bg-[#D4A843]" : "bg-slate-200"}`}
      >
        <span
          style={{ width: "18px", height: "18px" }}
          className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
        />
      </button>
    </label>
  );
}

function Counter({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-[#0C1A35] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xl font-light leading-none"
      >−</button>
      <span className="w-8 text-center text-sm font-semibold text-[#0C1A35]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-[#0C1A35] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xl font-light leading-none"
      >+</button>
    </div>
  );
}

// ─── Tab indicator ────────────────────────────────────────────────────────────

function TabBar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              isActive
                ? "bg-[#0C1A35] text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
              isActive ? "bg-[#D4A843] text-[#0C1A35]" : "bg-slate-200 text-slate-400"
            }`}>{i + 1}</span>
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Photo preview ────────────────────────────────────────────────────────────

interface PhotoFile {
  file: File;
  preview: string;
}

// ─── Nominatim autocomplete ───────────────────────────────────────────────────

function useNominatim(query: string, countryCode: string) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length <= 2) {
      setResults([]);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const ccParam = countryCode ? `&countrycodes=${countryCode.toLowerCase()}` : "";
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}${ccParam}&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "fr", "User-Agent": "seek-immobilier/1.0" },
        });
        const data: NominatimResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, countryCode]);

  return { results, loading, clear: () => setResults([]) };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AddBien() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  
  const { data: bienToEdit, isLoading: loadingBien } = useBienById(editId || "");
  
  const { data: types = [], isLoading: typesLoading }             = useTypeLogements();
  const { data: transactions = [], isLoading: txLoading }         = useTypeTransactions();
  const { data: statuts = [], isLoading: stLoading }              = useStatutsBien();
  const { data: equipements = [], isLoading: eqLoading }          = useEquipements();
  const { data: meubles = [], isLoading: mblLoading }             = useMeubles();
  const { mutateAsync: createBien, isPending: submitting }           = useCreateBien();
  const { mutateAsync: soumettreRevision, isPending: submittingRev } = useSoumettreRevision();
  const isEditingPublished = !!editId && bienToEdit?.statutAnnonce === "PUBLIE";
  const [pendingAction, setPendingAction] = useState<"draft" | "publish" | null>(null);

  // ── Onglet actif ──
  const [tab, setTab] = useState("general");

  // ── Onglet 1 : Infos générales ──
  const [selectedType,     setSelectedType]     = useState<TypeLogement | null>(null);
  const [titre,            setTitre]            = useState("");
  const [selectedPays,     setSelectedPays]     = useState<Pays | null>(null);
  const [selectedVille,    setSelectedVille]    = useState<Ville | null>(null);
  const [quartierInput,    setQuartierInput]    = useState("");
  const [latitude,         setLatitude]         = useState<number | null>(null);
  const [longitude,        setLongitude]        = useState<number | null>(null);
  const [description,      setDescription]      = useState("");
  const [quartierOpen,     setQuartierOpen]     = useState(false);

  // ── Onglet 2 : Caractéristiques ──
  const [surface,    setSurface]    = useState<string>("");
  const [etage,      setEtage]      = useState<string>("");
  const [nbChambres, setNbChambres] = useState(0);
  const [nbCuisines, setNbCuisines] = useState(0);
  const [nbSalons,   setNbSalons]   = useState(0);
  const [nbSdb,      setNbSdb]      = useState(0);
  const [nbWc,       setNbWc]       = useState(0);

  // ── Onglet 3 : Statut & transaction ──
  const [selectedTransaction, setSelectedTransaction] = useState<TypeTransaction | null>(null);
  const [selectedStatut,      setSelectedStatut]      = useState<StatutBien | null>(null);
  const [prix,                setPrix]                = useState<string>("");
  const [frequence,           setFrequence]           = useState("mensuel");
  const [chargesIncluses,     setChargesIncluses]     = useState(false);
  const [caution,             setCaution]             = useState<string>("");
  const [disponibleLe,        setDisponibleLe]        = useState("");

  // ── Onglet 4 : Options ──
  const [meuble,          setMeuble]          = useState(false);
  const [fumeurs,         setFumeurs]         = useState(false);
  const [animaux,         setAnimaux]         = useState(false);
  const [parking,         setParking]         = useState(false);
  const [ascenseur,       setAscenseur]       = useState(false);
  const [selectedEqs,    setSelectedEqs]    = useState<Set<string>>(new Set());
  const [selectedMeubles, setSelectedMeubles] = useState<Set<string>>(new Set());
  const [eqSearch,       setEqSearch]       = useState("");
  const [mblSearch,      setMblSearch]      = useState("");

  // ── Onglet 5 : Médias ──
  const [photos,            setPhotos]            = useState<PhotoFile[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [photoErr,          setPhotoErr]          = useState<string>("");
  const [mainPhotoIndex,    setMainPhotoIndex]     = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Errors par tab ──
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Init refs (évite la double init en mode édition) ──
  const initializedForRef = useRef<string | null>(null);
  const villeInitializedRef = useRef(false);

  // ── Dirty tracking pour brouillon ──
  const [isDirty, setIsDirty] = useState(false);
  const prevInitIdRef = useRef<string | null>(null);
  const initialComparableRef = useRef<string | null>(null);

  // ── Géographie DB ──
  const { data: paysList = [], isLoading: paysLoading }   = usePays();
  const { data: villesList = [], isLoading: villesLoading } = useVilles(selectedPays?.id ?? null);

  // ── Nominatim ──
  const { results: nominatimResults, loading: nominatimLoading, clear: clearNominatim } =
    useNominatim(quartierInput, selectedPays?.code ?? "");

  // ── Init champs en mode édition — attend que toutes les listes soient chargées ──
  useEffect(() => {
    if (!bienToEdit) return;
    if (initializedForRef.current === bienToEdit.id) return;
    if (typesLoading || txLoading || stLoading || paysLoading) return;

    initializedForRef.current = bienToEdit.id;
    villeInitializedRef.current = false;

    // Champs simples
    if (bienToEdit.titre)            setTitre(bienToEdit.titre);
    if (bienToEdit.description)      setDescription(bienToEdit.description);
    if (bienToEdit.quartier)         setQuartierInput(bienToEdit.quartier);
    if (bienToEdit.latitude)         setLatitude(bienToEdit.latitude);
    if (bienToEdit.longitude)        setLongitude(bienToEdit.longitude);
    if (bienToEdit.surface)          setSurface(String(bienToEdit.surface));
    if (bienToEdit.etage != null)    setEtage(String(bienToEdit.etage));
    if (bienToEdit.nbChambres)       setNbChambres(bienToEdit.nbChambres);
    if (bienToEdit.nbCuisines)       setNbCuisines(bienToEdit.nbCuisines);
    if (bienToEdit.nbSalons)         setNbSalons(bienToEdit.nbSalons);
    if (bienToEdit.nbSdb)            setNbSdb(bienToEdit.nbSdb);
    if (bienToEdit.nbWc)             setNbWc(bienToEdit.nbWc);
    if (bienToEdit.prix)             setPrix(String(bienToEdit.prix));
    if (bienToEdit.caution)          setCaution(String(bienToEdit.caution));
    if (bienToEdit.frequencePaiement) setFrequence(bienToEdit.frequencePaiement);
    if (bienToEdit.disponibleLe)     setDisponibleLe(bienToEdit.disponibleLe.split("T")[0]);
    setMeuble(bienToEdit.meuble);
    setFumeurs(bienToEdit.fumeurs);
    setAnimaux(bienToEdit.animaux);
    setParking(bienToEdit.parking);
    setAscenseur(bienToEdit.ascenseur);
    setChargesIncluses(bienToEdit.chargesIncluses);
    if (bienToEdit.equipements) setSelectedEqs(new Set(bienToEdit.equipements.map(e => e.equipementId)));
    if (bienToEdit.meubles)     setSelectedMeubles(new Set(bienToEdit.meubles.map(m => m.meubleId)));
    if (bienToEdit.photos?.length) setExistingPhotoUrls(bienToEdit.photos);

    // Champs lookup
    const type = types.find(t => t.id === bienToEdit.typeLogementId);
    if (type) setSelectedType(type);
    const tx = transactions.find(t => t.id === bienToEdit.typeTransactionId);
    if (tx) setSelectedTransaction(tx);
    const statut = statuts.find(s => s.id === bienToEdit.statutBienId);
    if (statut) setSelectedStatut(statut);
    const pays = paysList.find(p => p.nom === bienToEdit.pays);
    if (pays) setSelectedPays(pays);
    // selectedVille est initialisé dans l'effet suivant après le chargement de villesList
  }, [bienToEdit, types, transactions, statuts, paysList, typesLoading, txLoading, stLoading, paysLoading]);

  // ── Init ville (dépend de villesList qui se charge après selectedPays) ──
  useEffect(() => {
    if (!bienToEdit?.region || villeInitializedRef.current || villesLoading || !villesList.length) return;
    const ville = villesList.find(v => v.nom === bienToEdit.region);
    if (ville) {
      setSelectedVille(ville);
      villeInitializedRef.current = true;
    }
  }, [bienToEdit, villesList, villesLoading]);

  const currentComparable = JSON.stringify({
    titre: titre.trim() || null,
    description: description.trim() || null,
    typeLogementId: selectedType?.id ?? null,
    typeTransactionId: selectedTransaction?.id ?? null,
    statutBienId: selectedStatut?.id ?? null,
    pays: selectedPays?.nom ?? null,
    region: selectedVille?.nom ?? null,
    quartier: quartierInput.trim() || null,
    adresse: quartierInput.trim() || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    surface: parseOptionalNumber(surface),
    etage: parseOptionalNumber(etage),
    nbChambres,
    nbCuisines,
    nbSalons,
    nbSdb,
    nbWc,
    prix: parseOptionalNumber(prix),
    frequencePaiement: frequence,
    chargesIncluses,
    caution: parseOptionalNumber(caution),
    disponibleLe: disponibleLe || null,
    meuble,
    fumeurs,
    animaux,
    parking,
    ascenseur,
    equipementIds: Array.from(selectedEqs).sort(),
    meubleIds: Array.from(selectedMeubles).sort(),
    existingPhotoUrls,
    newPhotoPreviews: photos.map((p) => p.preview),
  });

  // ── Détection de modification par comparaison réelle ──
  useEffect(() => {
    const isEditableMode =
      !!editId &&
      (bienToEdit?.statutAnnonce === "BROUILLON" ||
        bienToEdit?.statutAnnonce === "REJETE" ||
        bienToEdit?.statutAnnonce === "PUBLIE");
    if (!isEditableMode) {
      setIsDirty(false);
      initialComparableRef.current = null;
      return;
    }

    // Si on vient de finir l'init, reset isDirty
    if (prevInitIdRef.current !== initializedForRef.current) {
      prevInitIdRef.current = initializedForRef.current;
      initialComparableRef.current = currentComparable;
      setIsDirty(false);
      return;
    }

    if (!initialComparableRef.current) {
      initialComparableRef.current = currentComparable;
      setIsDirty(false);
      return;
    }

    setIsDirty(currentComparable !== initialComparableRef.current);
  }, [
    currentComparable,
    editId,
    bienToEdit?.statutAnnonce,
  ]);

  useEffect(() => {
    if (!editId) return;
    initialComparableRef.current = null;
    prevInitIdRef.current = null;
    setIsDirty(false);
  }, [editId]);

  // Select Nominatim suggestion
  const handleSelectNominatim = useCallback((r: NominatimResult) => {
    setQuartierInput(r.display_name);
    setLatitude(parseFloat(r.lat));
    setLongitude(parseFloat(r.lon));
    clearNominatim();
    setQuartierOpen(false);
  }, [clearNominatim]);

  // ── Photo handlers ──
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const errs: string[] = [];

    const valid = newFiles.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errs.push(`${f.name}: format non supporté`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        errs.push(`${f.name}: taille > 5 Mo`);
        return false;
      }
      return true;
    });

    const total = photos.length + valid.length;
    if (total > 10) {
      errs.push("Maximum 10 photos autorisées");
      const allowed = valid.slice(0, 10 - photos.length);
      setPhotos((prev) => [
        ...prev,
        ...allowed.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
      ]);
    } else {
      setPhotos((prev) => [
        ...prev,
        ...valid.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
      ]);
    }

    if (errs.length) setPhotoErr(errs.join(" · "));
    else setPhotoErr("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
    setMainPhotoIndex((prev) => {
      if (i === prev) return 0;
      if (i < prev) return prev - 1;
      return prev;
    });
  };

  // ── Toggle équipement ──
  const toggleEquipement = (id: string) => {
    setSelectedEqs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Toggle meuble ──
  const toggleMeuble = (id: string) => {
    setSelectedMeubles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Validation par tab ──
  const validateTab = (tabId: string): boolean => {
    const errs: Record<string, string> = {};
    if (tabId === "general") {
      if (!selectedType)  errs.type   = "Choisissez un type de bien";
      if (!titre.trim())  errs.titre  = "Le titre est requis";
      if (!selectedPays)  errs.pays   = "Choisissez un pays";
      if (!selectedVille) errs.region = "Choisissez une région";
    }
    if (tabId === "transaction") {
      if (!selectedTransaction) errs.transaction = "Choisissez un type de transaction";
      if (!selectedStatut) errs.statut = "Choisissez un statut";
      if (!prix || parseFloat(prix) <= 0) errs.prix = "Entrez un prix valide";
    }
    if (tabId === "medias") {
      if (existingPhotoUrls.length + photos.length < 3) errs.photos = "Minimum 3 photos requises";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (!validateTab(tab)) return;
    if (idx < TABS.length - 1) setTab(TABS[idx + 1].id);
  };

  const goPrev = () => {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (idx > 0) setTab(TABS[idx - 1].id);
  };

  // ── Payload commun ──
  const buildPayload = () => {
    const orderedNewPhotos = photos.length > 0
      ? [photos[mainPhotoIndex].file, ...photos.filter((_, i) => i !== mainPhotoIndex).map((p) => p.file)]
      : [];
    const payload = {
      id: editId || undefined,
      titre: titre.trim(),
      description: description.trim() || undefined,
      typeLogementId: selectedType!.id,
      typeTransactionId: selectedTransaction!.id,
      statutBienId: selectedStatut!.id,
      pays: selectedPays?.nom,
      region: selectedVille?.nom ?? "",
      quartier: quartierInput.trim() || undefined,
      adresse: quartierInput.trim() || undefined,
      latitude,
      longitude,
      surface: surface ? parseFloat(surface) : undefined,
      nbChambres: nbChambres || undefined,
      nbSdb: nbSdb || undefined,
      nbSalons: nbSalons || undefined,
      nbCuisines: nbCuisines || undefined,
      nbWc: nbWc || undefined,
      etage: etage ? parseInt(etage) : undefined,
      meuble,
      fumeurs,
      animaux,
      parking,
      ascenseur,
      prix: parseFloat(prix),
      frequencePaiement: frequence,
      chargesIncluses,
      caution: caution ? parseFloat(caution) : undefined,
      disponibleLe: disponibleLe || undefined,
      equipementIds: Array.from(selectedEqs),
      meubles: Array.from(selectedMeubles).map((meubleId) => ({ meubleId, quantite: 1 })),
      existingPhotos: existingPhotoUrls,
    };
    return { payload, orderedNewPhotos };
  };

  // ── Submit révision (annonce publiée) ──
  const handleSubmitRevision = async () => {
    const allValid = ["general", "transaction", "medias"].every(validateTab);
    if (!allValid) {
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return;
    }
    if (!editId) return;
    setPendingAction("publish");
    try {
      const { payload, orderedNewPhotos } = buildPayload();
      await soumettreRevision({ id: editId, payload, photos: orderedNewPhotos });
      toast.success("Modification soumise pour validation. L'annonce reste visible avec les informations actuelles.");
      navigate(`/owner/biens/${editId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setPendingAction(null);
    }
  };

  // ── Submit ──
  const handleSubmit = async (brouillon: boolean) => {
    const allValid = ["general", "transaction", "medias"].every(validateTab);
    if (!allValid) {
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return;
    }

    setPendingAction(brouillon ? "draft" : "publish");
    try {
      const { payload, orderedNewPhotos } = buildPayload();
      await createBien({
        payload: { ...payload, brouillon },
        photos: orderedNewPhotos,
      });
      toast.success(brouillon ? "Bien enregistré comme brouillon" : "Bien soumis pour publication !");
      navigate("/owner/biens");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setPendingAction(null);
    }
  };

  const tabIdx = TABS.findIndex((t) => t.id === tab);
  const isFirst = tabIdx === 0;
  const isLast  = tabIdx === TABS.length - 1;

  // Navigation via TabBar : retour libre, avance soumise à validation
  const handleTabSelect = (targetId: string) => {
    const targetIdx = TABS.findIndex((t) => t.id === targetId);
    if (targetIdx <= tabIdx) { setTab(targetId); return; }
    if (!validateTab(tab)) return;
    setTab(targetId);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Link to="/owner/dashboard" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
          <LayoutDashboard className="w-3 h-3" /> Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/owner/biens" className="hover:text-slate-600 transition-colors">Mes biens</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#D4A843] font-medium">{editId ? "Modifier le bien" : "Ajouter un bien"}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/owner/biens"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
            <Building2 className="w-3.5 h-3.5" /> Gestion de biens
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
            {isEditingPublished ? "Modifier l'annonce publiée" : editId ? "Modifier le bien" : "Ajouter un nouveau bien"}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isEditingPublished
              ? "Les modifications seront soumises à validation. L'annonce reste visible jusqu'à approbation."
              : editId
              ? "Mettez à jour les informations de votre bien."
              : "Renseignez les informations de votre bien pour publier une annonce."}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6">
        <TabBar active={tab} onSelect={handleTabSelect} />
      </div>

      <form noValidate className="space-y-6" onSubmit={(e) => e.preventDefault()}>

        {/* ═══════════════════════════════════════════════════════════
            Tab 1 — Informations générales
        ═══════════════════════════════════════════════════════════ */}
        {tab === "general" && (
          <div className="space-y-6">
            {/* Type de bien */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Type de bien</h2>
              </div>
              <div className="p-6">
                {typesLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Chargement…</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {types.map((t) => {
                      const Icon = SLUG_ICONS[t.slug] ?? Building2;
                      const sel = selectedType?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedType(t)}
                          className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${sel ? "border-[#D4A843] bg-[#D4A843]/5 shadow-sm" : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${sel ? "bg-[#D4A843] text-white" : "bg-white text-slate-400 border border-slate-100"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-semibold ${sel ? "text-[#0C1A35]" : "text-slate-600"}`}>{t.nom}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.type && <p className="mt-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.type}</p>}
              </div>
            </div>

            {/* Titre + description */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Présentation</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelCls}>Titre de l'annonce *</label>
                  <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder={`ex : Bel appartement à Mermoz`}
                    className={inputCls}
                  />
                  {errors.titre && <p className="mt-1 text-xs text-red-500">{errors.titre}</p>}
                </div>
                <div>
                  <label className={labelCls}>Description détaillée</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Décrivez le bien, l'environnement, les points forts…"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5 rounded-t-2xl">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Localisation</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pays */}
                  <div>
                    <label className={labelCls}>Pays *</label>
                    {paysLoading ? (
                      <div className="flex items-center gap-2 h-10 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedPays?.id ?? ""}
                          onChange={(e) => {
                            const found = paysList.find((p) => p.id === e.target.value) ?? null;
                            setSelectedPays(found);
                            setSelectedVille(null);
                          }}
                          className={`${inputCls} cursor-pointer appearance-none pr-8`}
                        >
                          <option value="">— Choisir un pays —</option>
                          {paysList.map((p) => (
                            <option key={p.id} value={p.id}>{p.nom}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                    {errors.pays && <p className="mt-1 text-xs text-red-500">{errors.pays}</p>}
                  </div>

                  {/* Région (villes de la DB) */}
                  <div>
                    <label className={labelCls}>Région *</label>
                    {villesLoading ? (
                      <div className="flex items-center gap-2 h-10 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedVille?.id ?? ""}
                          onChange={(e) => {
                            const found = villesList.find((v) => v.id === e.target.value) ?? null;
                            setSelectedVille(found);
                          }}
                          disabled={!selectedPays}
                          className={`${inputCls} cursor-pointer appearance-none pr-8 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <option value="">
                            {selectedPays ? "— Choisir une région —" : "— Sélectionnez d'abord un pays —"}
                          </option>
                          {villesList.map((v) => (
                            <option key={v.id} value={v.id}>{v.nom}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                    {errors.region && <p className="mt-1 text-xs text-red-500">{errors.region}</p>}
                  </div>
                </div>

                {/* Quartier avec Nominatim */}
                <div className="relative">
                  <label className={labelCls}>
                    Quartier
                    <span className="text-slate-400 font-normal ml-1">(autocomplete)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={quartierInput}
                      onChange={(e) => {
                        setQuartierInput(e.target.value);
                        setLatitude(null);
                        setLongitude(null);
                        setQuartierOpen(true);
                      }}
                      onFocus={() => setQuartierOpen(true)}
                      onBlur={() => setTimeout(() => setQuartierOpen(false), 200)}
                      placeholder="Tapez un quartier ou une adresse (min. 3 caractères)…"
                      className={`${inputCls} pr-9`}
                    />
                    {nominatimLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                    )}
                  </div>

                  {/* Suggestions dropdown — z-[200] pour passer au-dessus de tout */}
                  {quartierOpen && nominatimResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-[200] mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl">
                      {nominatimResults.map((r) => (
                        <button
                          key={r.place_id}
                          type="button"
                          onMouseDown={() => handleSelectNominatim(r)}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-[#D4A843]/8 hover:text-[#0C1A35] border-b border-slate-100 last:border-0 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#D4A843] flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{r.display_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            Tab 2 — Caractéristiques techniques
        ═══════════════════════════════════════════════════════════ */}
        {tab === "caract" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                <Ruler className="w-3.5 h-3.5 text-[#D4A843]" />
              </div>
              <h2 className="text-sm font-semibold text-[#0C1A35]">Caractéristiques techniques</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Surface + Étage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Surface (m²)</label>
                  <input
                    type="number"
                    min={1}
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    placeholder="ex : 80"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Étage <span className="text-slate-400 font-normal">(0 = RDC)</span></label>
                  <input
                    type="number"
                    min={0}
                    value={etage}
                    onChange={(e) => setEtage(e.target.value)}
                    placeholder="ex : 2"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 space-y-4">
                {[
                  { label: "Chambres", sub: "Pièces à coucher", val: nbChambres, set: setNbChambres },
                  { label: "Cuisine(s)", sub: "Pièces cuisine", val: nbCuisines, set: setNbCuisines },
                  { label: "Salon(s)", sub: "Salles de séjour", val: nbSalons, set: setNbSalons },
                  { label: "Douche(s) / SDB", sub: "Salles d'eau", val: nbSdb, set: setNbSdb },
                  { label: "WC", sub: "Toilettes", val: nbWc, set: setNbWc },
                ].map(({ label, sub, val, set }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                    <Counter value={val} onChange={set} min={0} max={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            Tab 3 — Statut & Transaction
        ═══════════════════════════════════════════════════════════ */}
        {tab === "transaction" && (
          <div className="space-y-6">
            {/* Type transaction */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Type de transaction</h2>
              </div>
              <div className="p-6">
                {txLoading ? (
                  <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Chargement…</span></div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {transactions.map((tx) => (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => setSelectedTransaction(tx)}
                        className={`flex items-center gap-2 h-10 px-5 rounded-xl border-2 text-sm font-semibold transition-all ${selectedTransaction?.id === tx.id ? "border-[#D4A843] bg-[#D4A843]/8 text-[#0C1A35]" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"}`}
                      >
                        <ArrowLeftRight className={`w-3.5 h-3.5 ${selectedTransaction?.id === tx.id ? "text-[#D4A843]" : "text-slate-400"}`} />
                        {tx.nom}
                      </button>
                    ))}
                  </div>
                )}
                {errors.transaction && <p className="mt-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.transaction}</p>}
              </div>
            </div>

            {/* Statut */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <CircleDot className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Statut du bien</h2>
              </div>
              <div className="p-6">
                {stLoading ? (
                  <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Chargement…</span></div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {statuts.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStatut(st)}
                        className={`flex items-center gap-2 h-10 px-5 rounded-xl border-2 text-sm font-semibold transition-all ${selectedStatut?.id === st.id ? "border-[#D4A843] bg-[#D4A843]/8 text-[#0C1A35]" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"}`}
                      >
                        <CircleDot className={`w-3.5 h-3.5 ${selectedStatut?.id === st.id ? "text-[#D4A843]" : "text-slate-400"}`} />
                        {st.nom}
                      </button>
                    ))}
                  </div>
                )}
                {errors.statut && <p className="mt-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.statut}</p>}
              </div>
            </div>

            {/* Prix */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Prix & Disponibilité</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Prix *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                        placeholder="ex : 150 000"
                        className={`${inputCls} pr-16`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">FCFA</span>
                    </div>
                    {errors.prix && <p className="mt-1 text-xs text-red-500">{errors.prix}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Fréquence de paiement</label>
                    <div className="relative">
                      <select
                        value={frequence}
                        onChange={(e) => setFrequence(e.target.value)}
                        className={`${inputCls} cursor-pointer appearance-none pr-8`}
                      >
                        {FREQUENCES.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Caution <span className="text-slate-400 font-normal">(optionnel)</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={caution}
                        onChange={(e) => setCaution(e.target.value)}
                        placeholder="ex : 300 000"
                        className={`${inputCls} pr-16`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">FCFA</span>
                    </div>
                  </div>
                  {selectedStatut?.slug !== "libre" && (
                    <div>
                      <label className={labelCls}>Disponible à partir du</label>
                      <input
                        type="date"
                        value={disponibleLe}
                        onChange={(e) => setDisponibleLe(e.target.value)}
                        className={`${inputCls} cursor-pointer`}
                      />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={chargesIncluses}
                    onChange={(e) => setChargesIncluses(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#D4A843] accent-[#D4A843] cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    Charges comprises dans le prix <span className="text-slate-400">(eau, électricité…)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            Tab 4 — Options & Équipements
        ═══════════════════════════════════════════════════════════ */}
        {tab === "options" && (
          <div className="space-y-6">
            {/* Options principales */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Options du bien</h2>
              </div>
              <div className="p-6 space-y-3">
                <Toggle checked={meuble}    onChange={setMeuble}    label="Bien meublé" />
                <Toggle checked={parking}   onChange={setParking}   label="Place de parking" />
                <Toggle checked={ascenseur} onChange={setAscenseur} label="Ascenseur dans le bâtiment" />
                <div className="pt-3 border-t border-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Règlement intérieur</p>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <Cigarette className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Fumeurs acceptés</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={fumeurs}
                        onClick={() => setFumeurs(!fumeurs)}
                        style={{ width: "40px", height: "22px" }}
                        className={`relative rounded-full flex-shrink-0 transition-colors duration-200 ${fumeurs ? "bg-[#D4A843]" : "bg-slate-200"}`}
                      >
                        <span
                          style={{ width: "18px", height: "18px" }}
                          className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${fumeurs ? "translate-x-[18px]" : "translate-x-0"}`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Animaux acceptés</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={animaux}
                        onClick={() => setAnimaux(!animaux)}
                        style={{ width: "40px", height: "22px" }}
                        className={`relative rounded-full flex-shrink-0 transition-colors duration-200 ${animaux ? "bg-[#D4A843]" : "bg-slate-200"}`}
                      >
                        <span
                          style={{ width: "18px", height: "18px" }}
                          className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${animaux ? "translate-x-[18px]" : "translate-x-0"}`}
                        />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Meubles (si meublé) — avant équipements */}
            {meuble && (
              <div className="bg-white rounded-2xl border border-[#D4A843]/30 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#D4A843]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                      <BedDouble className="w-3.5 h-3.5 text-[#D4A843]" />
                    </div>
                    <h2 className="text-sm font-semibold text-[#0C1A35]">Liste des meubles</h2>
                  </div>
                  {selectedMeubles.size > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4A843]/10 text-[#D4A843]">
                      {selectedMeubles.size} sélectionné{selectedMeubles.size > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {mblLoading ? (
                    <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Chargement…</span></div>
                  ) : meubles.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun meuble disponible.</p>
                  ) : (() => {
                    const filtered = meubles.filter((m: Meuble) =>
                      m.nom.toLowerCase().includes(mblSearch.toLowerCase()) ||
                      m.categorie?.nom.toLowerCase().includes(mblSearch.toLowerCase())
                    );
                    const grouped = filtered.reduce((acc: Record<string, Meuble[]>, m: Meuble) => {
                      const cat = m.categorie?.nom ?? "Autres";
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(m);
                      return acc;
                    }, {});
                    return (
                      <>
                        {/* Barre de recherche */}
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={mblSearch}
                            onChange={(e) => setMblSearch(e.target.value)}
                            placeholder="Rechercher un meuble…"
                            className={`${inputCls} pl-9`}
                          />
                        </div>
                        {filtered.length === 0 ? (
                          <p className="text-sm text-slate-400 py-2">Aucun résultat pour « {mblSearch} »</p>
                        ) : (
                          <div className="space-y-5">
                            {Object.entries(grouped).map(([cat, items]) => (
                              <div key={cat}>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{cat}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                  {(items as Meuble[]).map((m) => {
                                    const sel = selectedMeubles.has(m.id);
                                    return (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => toggleMeuble(m.id)}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm transition-all ${sel ? "border-[#D4A843] bg-[#D4A843]/5 text-[#0C1A35] font-medium" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"}`}
                                      >
                                        <div className={`w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-all ${sel ? "bg-[#D4A843] border-[#D4A843]" : "border-slate-200"}`}>
                                          {sel && <Check className="w-3 h-3 text-[#0C1A35]" />}
                                        </div>
                                        {m.nom}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Équipements */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                    <WifiIcon className="w-3.5 h-3.5 text-[#D4A843]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[#0C1A35]">Équipements disponibles</h2>
                </div>
                {selectedEqs.size > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4A843]/10 text-[#D4A843]">
                    {selectedEqs.size} sélectionné{selectedEqs.size > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="p-6">
                {eqLoading ? (
                  <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Chargement…</span></div>
                ) : equipements.length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun équipement disponible.</p>
                ) : (() => {
                  const filtered = equipements.filter((eq: Equipement) =>
                    eq.nom.toLowerCase().includes(eqSearch.toLowerCase()) ||
                    eq.categorie?.nom.toLowerCase().includes(eqSearch.toLowerCase())
                  );
                  const grouped = filtered.reduce((acc: Record<string, Equipement[]>, eq: Equipement) => {
                    const cat = eq.categorie?.nom ?? "Autres";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(eq);
                    return acc;
                  }, {});
                  return (
                    <>
                      {/* Barre de recherche */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={eqSearch}
                          onChange={(e) => setEqSearch(e.target.value)}
                          placeholder="Rechercher un équipement…"
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                      {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400 py-2">Aucun résultat pour « {eqSearch} »</p>
                      ) : (
                        <div className="space-y-5">
                          {Object.entries(grouped).map(([cat, items]) => (
                            <div key={cat}>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{cat}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {(items as Equipement[]).map((eq) => {
                                  const sel = selectedEqs.has(eq.id);
                                  return (
                                    <button
                                      key={eq.id}
                                      type="button"
                                      onClick={() => toggleEquipement(eq.id)}
                                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm transition-all ${sel ? "border-[#D4A843] bg-[#D4A843]/5 text-[#0C1A35] font-medium" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"}`}
                                    >
                                      <div className={`w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-all ${sel ? "bg-[#D4A843] border-[#D4A843]" : "border-slate-200"}`}>
                                        {sel && <Check className="w-3 h-3 text-[#0C1A35]" />}
                                      </div>
                                      {eq.nom}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            Tab 5 — Médias
        ═══════════════════════════════════════════════════════════ */}
        {tab === "medias" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D4A843]" />
                </div>
                <h2 className="text-sm font-semibold text-[#0C1A35]">Photos du bien</h2>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${photos.length < 3 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                {photos.length} / 10
              </span>
            </div>
            <div className="p-6">
              {/* Erreur photos */}
              {photoErr && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-500">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {photoErr}
                </div>
              )}
              {errors.photos && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.photos}
                </div>
              )}

              {/* Grid photos */}
              {existingPhotoUrls.length > 0 || photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {/* Photos existantes (serveur) */}
                  {existingPhotoUrls.map((url, i) => (
                    <div
                      key={`existing-${url}`}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${i === 0 && photos.length === 0 ? "border-[#D4A843] shadow-md shadow-[#D4A843]/20" : "border-slate-100"}`}
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setExistingPhotoUrls(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && photos.length === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-[#D4A843] text-[#0C1A35] py-0.5">
                          <Star className="w-2.5 h-2.5 fill-[#0C1A35]" />
                          <span className="text-[10px] font-bold">PRINCIPALE</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Nouvelles photos */}
                  {photos.map((p, i) => {
                    const isMain = existingPhotoUrls.length === 0 && i === mainPhotoIndex;
                    return (
                      <div
                        key={i}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${isMain ? "border-[#D4A843] shadow-md shadow-[#D4A843]/20" : "border-slate-100"}`}
                        style={{ aspectRatio: "16/9" }}
                      >
                        <img src={p.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {existingPhotoUrls.length === 0 && !isMain && (
                          <button
                            type="button"
                            onClick={() => setMainPhotoIndex(i)}
                            className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Définir comme photo principale"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        {isMain && (
                          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-[#D4A843] text-[#0C1A35] py-0.5">
                            <Star className="w-2.5 h-2.5 fill-[#0C1A35]" />
                            <span className="text-[10px] font-bold">PRINCIPALE</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {existingPhotoUrls.length + photos.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-[#D4A843]/50 hover:text-[#D4A843]/60 transition-colors"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 text-slate-400 hover:border-[#D4A843]/40 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all cursor-pointer"
                >
                  <Upload className="w-8 h-8" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Cliquez pour ajouter des photos</p>
                    <p className="text-xs mt-0.5">JPG, JPEG, PNG, WEBP, AVIF, JFIF · max 5 Mo · min 3 · max 10</p>
                    <p className="text-xs mt-0.5 text-[#D4A843]/80 font-medium">Ratio d'affichage 16:9 automatique</p>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.avif,.jfif"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoFiles(e.target.files)}
              />
            </div>
          </div>
        )}

        {/* ── Navigation footer ─────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center gap-2">
            <Link
              to={isEditingPublished ? `/owner/biens/${editId}` : "/owner/biens"}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
            >
              {isEditingPublished ? "Annuler la modification" : "Annuler"}
            </Link>
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isLast ? (
              <>
                {/* Mode modification d'une annonce publiée : pas de brouillon, seulement "Soumettre les changements" */}
                {isEditingPublished ? (
                  <button
                    type="button"
                    onClick={handleSubmitRevision}
                    disabled={submittingRev || !isDirty}
                    title={!isDirty ? "Modifiez au moins un élément avant de soumettre" : undefined}
                    className="flex items-center gap-2 h-10 px-6 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] text-sm font-bold shadow-sm shadow-[#D4A843]/20 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submittingRev ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Soumettre les changements
                  </button>
                ) : (
                  <>
                    {!editId && (
                      <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors disabled:opacity-60"
                      >
                        {pendingAction === "draft" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Enregistrer comme brouillon
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSubmit(false)}
                      disabled={submitting || (!!editId && (bienToEdit?.statutAnnonce === "BROUILLON" || bienToEdit?.statutAnnonce === "REJETE") && !isDirty)}
                      title={!!editId && (bienToEdit?.statutAnnonce === "BROUILLON" || bienToEdit?.statutAnnonce === "REJETE") && !isDirty ? "Modifiez au moins un élément avant de soumettre" : undefined}
                      className="flex items-center gap-2 h-10 px-6 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] text-sm font-bold shadow-sm shadow-[#D4A843]/20 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {pendingAction === "publish" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {!editId ? "Soumettre l'annonce" : bienToEdit?.statutAnnonce === "REJETE" ? "Resoumettre l'annonce" : "Mettre à jour l'annonce"}
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 h-10 px-6 rounded-xl bg-[#0C1A35] hover:bg-[#162540] text-white text-sm font-semibold transition-all hover:scale-[1.01]"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
