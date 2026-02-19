import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Home, BedDouble, MapPin,
  Briefcase, Layers, Ruler, Zap, DollarSign, ImageIcon,
  Plus, X, ChevronRight, Info, Upload, Loader2, AlertCircle, ArrowLeftRight, CircleDot,
} from "lucide-react";
import { useTypeLogements } from "@/hooks/useTypeLogements";
import { useTypeTransactions } from "@/hooks/useTypeTransactions";
import { useStatutsBien } from "@/hooks/useStatutsBien";
import type { TypeLogement } from "@/api/typeLogement";
import type { TypeTransaction } from "@/api/typeTransaction";
import type { StatutBien } from "@/api/statutBien";

// ─── Config champs dynamiques par slug ────────────────────────────────────────

type Config = {
  showChambres: boolean;
  showSDB: boolean;
  showEtage: boolean;
  showNbEtages: boolean;
  showAscenseur: boolean;
  showMeuble: boolean;
  showParking: boolean;
  showJardin: boolean;
  showPiscine: boolean;
  showGardien: boolean;
  showBureauType: boolean;
  showTerrainUsage: boolean;
  showTerrainViabilise: boolean;
  showSanitairePartage: boolean;
  showCuisinePartagee: boolean;
  showEquipements: boolean;
  surfaceLabel: string;
};

// Clé = slug tel qu'il est en base de données
const TYPE_CONFIG: Record<string, Config> = {
  appartement: {
    showChambres: true,  showSDB: true,   showEtage: true,  showNbEtages: false,
    showAscenseur: true, showMeuble: true, showParking: true, showJardin: false,
    showPiscine: false,  showGardien: false, showBureauType: false,
    showTerrainUsage: false, showTerrainViabilise: false,
    showSanitairePartage: false, showCuisinePartagee: false, showEquipements: true,
    surfaceLabel: "Surface",
  },
  maison: {
    showChambres: true,  showSDB: true,   showEtage: false, showNbEtages: true,
    showAscenseur: false, showMeuble: true, showParking: true, showJardin: true,
    showPiscine: false,  showGardien: true, showBureauType: false,
    showTerrainUsage: false, showTerrainViabilise: false,
    showSanitairePartage: false, showCuisinePartagee: false, showEquipements: true,
    surfaceLabel: "Surface habitable",
  },
  studio: {
    showChambres: false, showSDB: true,   showEtage: true,  showNbEtages: false,
    showAscenseur: true, showMeuble: true, showParking: false, showJardin: false,
    showPiscine: false,  showGardien: false, showBureauType: false,
    showTerrainUsage: false, showTerrainViabilise: false,
    showSanitairePartage: false, showCuisinePartagee: false, showEquipements: true,
    surfaceLabel: "Surface",
  },
  villa: {
    showChambres: true,  showSDB: true,   showEtage: false, showNbEtages: true,
    showAscenseur: false, showMeuble: true, showParking: true, showJardin: true,
    showPiscine: true,   showGardien: true, showBureauType: false,
    showTerrainUsage: false, showTerrainViabilise: false,
    showSanitairePartage: false, showCuisinePartagee: false, showEquipements: true,
    surfaceLabel: "Surface habitable",
  },
  chambre: {
    showChambres: false, showSDB: false,  showEtage: true,  showNbEtages: false,
    showAscenseur: false, showMeuble: true, showParking: false, showJardin: false,
    showPiscine: false,  showGardien: false, showBureauType: false,
    showTerrainUsage: false, showTerrainViabilise: false,
    showSanitairePartage: true, showCuisinePartagee: true, showEquipements: true,
    surfaceLabel: "Surface de la chambre",
  },
  bureau: {
    showChambres: false, showSDB: true,   showEtage: true,  showNbEtages: false,
    showAscenseur: true, showMeuble: false, showParking: true, showJardin: false,
    showPiscine: false,  showGardien: false, showBureauType: true,
    showTerrainUsage: false, showTerrainViabilise: false,
    showSanitairePartage: false, showCuisinePartagee: false, showEquipements: true,
    surfaceLabel: "Surface",
  },
  terrain: {
    showChambres: false, showSDB: false,  showEtage: false, showNbEtages: false,
    showAscenseur: false, showMeuble: false, showParking: false, showJardin: false,
    showPiscine: false,  showGardien: false, showBureauType: false,
    showTerrainUsage: true, showTerrainViabilise: true,
    showSanitairePartage: false, showCuisinePartagee: false, showEquipements: false,
    surfaceLabel: "Superficie",
  },
};

// Config par défaut pour les types sans slug connu
const DEFAULT_CONFIG: Config = {
  showChambres: true,  showSDB: true,   showEtage: false, showNbEtages: false,
  showAscenseur: false, showMeuble: true, showParking: false, showJardin: false,
  showPiscine: false,  showGardien: false, showBureauType: false,
  showTerrainUsage: false, showTerrainViabilise: false,
  showSanitairePartage: false, showCuisinePartagee: false, showEquipements: true,
  surfaceLabel: "Surface",
};

// Icônes selon slug
const SLUG_ICONS: Record<string, React.ElementType> = {
  appartement: Building2,
  maison:      Home,
  studio:      Layers,
  villa:       Home,
  chambre:     BedDouble,
  bureau:      Briefcase,
  terrain:     MapPin,
};

const REGIONS = [
  "Dakar", "Thiès", "Saint-Louis", "Diourbel", "Louga",
  "Kaolack", "Fatick", "Kaffrine", "Tambacounda",
  "Ziguinchor", "Kolda", "Sédhiou", "Matam", "Kédougou",
];

// ─── UI helpers ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 placeholder:text-slate-300 outline-none " +
  "focus:border-[#D4A843]/60 focus:bg-white transition-all";

const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

function SectionCard({
  title, icon: Icon, children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#D4A843]" />
        </div>
        <h2 className="text-sm font-semibold text-[#0C1A35]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toggle({
  checked, onChange, label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{ width: "40px", height: "22px" }}
        className={`relative rounded-full flex-shrink-0 transition-colors duration-200 ${
          checked ? "bg-[#D4A843]" : "bg-slate-200"
        }`}
      >
        <span
          style={{ width: "18px", height: "18px" }}
          className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

function Counter({
  value, onChange, min = 0, max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center
          text-slate-500 hover:border-slate-300 hover:text-[#0C1A35] disabled:opacity-30
          disabled:cursor-not-allowed transition-all text-xl font-light leading-none"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold text-[#0C1A35]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center
          text-slate-500 hover:border-slate-300 hover:text-[#0C1A35] disabled:opacity-30
          disabled:cursor-not-allowed transition-all text-xl font-light leading-none"
      >
        +
      </button>
    </div>
  );
}

function Checkbox({
  checked, onChange, label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div
        style={{ width: "18px", height: "18px" }}
        className={`rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-[#D4A843] border-[#D4A843]"
            : "border-slate-200 bg-white group-hover:border-slate-300"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 18 18" fill="none" style={{ width: "18px", height: "18px" }}>
            <path
              d="M4 9l3.5 3.5L14 6"
              stroke="#0C1A35"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
        {label}
      </span>
    </label>
  );
}

// ─── Carte type (depuis DB) ───────────────────────────────────────────────────

function TypeCard({
  type, selected, onSelect,
}: {
  type: TypeLogement;
  selected: boolean;
  onSelect: (t: TypeLogement) => void;
}) {
  const Icon = SLUG_ICONS[type.slug] ?? Building2;

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? "border-[#D4A843] bg-[#D4A843]/5 shadow-sm"
          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
      }`}
    >
      {/* Image ou icône */}
      {type.image ? (
        <img
          src={type.image}
          alt={type.nom}
          className={`w-8 h-8 rounded-lg object-cover mb-2.5 flex-shrink-0 ${
            selected ? "ring-2 ring-[#D4A843]" : ""
          }`}
        />
      ) : (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 flex-shrink-0 ${
            selected
              ? "bg-[#D4A843] text-white"
              : "bg-white text-slate-400 border border-slate-100"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}

      <span
        className={`text-sm font-semibold leading-tight ${
          selected ? "text-[#0C1A35]" : "text-slate-600"
        }`}
      >
        {type.nom}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddBien() {
  const { data: types = [], isLoading, isError } = useTypeLogements();
  const { data: transactions = [], isLoading: txLoading, isError: txError } = useTypeTransactions();
  const { data: statuts = [],      isLoading: stLoading, isError: stError  } = useStatutsBien();

  const [selectedType,        setSelectedType]        = useState<TypeLogement | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TypeTransaction | null>(null);
  const [selectedStatut,      setSelectedStatut]      = useState<StatutBien | null>(null);

  // Compteurs
  const [chambres, setChambres] = useState(2);
  const [sdb, setSdb]           = useState(1);
  const [nbEtages, setNbEtages] = useState(1);

  // Toggles spécifiques
  const [meuble, setMeuble]                     = useState(false);
  const [parking, setParking]                   = useState(false);
  const [jardin, setJardin]                     = useState(false);
  const [piscine, setPiscine]                   = useState(false);
  const [gardien, setGardien]                   = useState(false);
  const [ascenseur, setAscenseur]               = useState(false);
  const [sanitairePartage, setSanitairePartage] = useState(false);
  const [cuisinePartagee, setCuisinePartagee]   = useState(false);

  // Terrain
  const [viabiliseEau, setViabiliseEau]   = useState(false);
  const [viabiliseElec, setViabiliseElec] = useState(false);

  // Prix
  const [chargesIncluses, setChargesIncluses] = useState(false);

  // Commodités
  const [clim, setClim]           = useState(false);
  const [wifi, setWifi]           = useState(false);
  const [eauChaude, setEauChaude] = useState(false);
  const [groupe, setGroupe]       = useState(false);
  const [balcon, setBalcon]       = useState(false);

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cfg = selectedType
    ? (TYPE_CONFIG[selectedType.slug] ?? DEFAULT_CONFIG)
    : null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      setPhotos((prev) => [...prev, URL.createObjectURL(file)]);
    });
    e.target.value = "";
  };

  const amenities = [
    { state: clim,      set: setClim,      label: "Climatisation" },
    { state: wifi,      set: setWifi,      label: "Wi-Fi" },
    { state: eauChaude, set: setEauChaude, label: "Eau chaude" },
    { state: groupe,    set: setGroupe,    label: "Groupe électrogène" },
    { state: balcon,    set: setBalcon,    label: "Balcon / Terrasse" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Link
          to="/owner/dashboard"
          className="flex items-center gap-1 hover:text-slate-600 transition-colors"
        >
          <LayoutDashboard className="w-3 h-3" />
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span>Gestion de biens</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#D4A843] font-medium">Ajouter un bien</span>
      </div>

      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <Building2 className="w-3.5 h-3.5" />
          Gestion de biens
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          Ajouter un nouveau bien
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Renseignez les informations de votre bien pour publier une annonce.
        </p>
      </div>

      <form noValidate className="space-y-6">

        {/* ── Sélecteur de type ─────────────────────────────── */}
        <SectionCard title="Type de bien" icon={Building2}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Chargement des types…</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Impossible de charger les types de logement. Veuillez réessayer.
            </div>
          ) : types.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Aucun type de logement disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {types.map((t) => (
                <TypeCard
                  key={t.id}
                  type={t}
                  selected={selectedType?.id === t.id}
                  onSelect={setSelectedType}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Reste du formulaire (conditionnel) ────────────── */}
        <AnimatePresence>
          {cfg && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
            >

              {/* ── Type de transaction ─────────────────────── */}
              <SectionCard title="Type de transaction" icon={ArrowLeftRight}>
                {txLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Chargement…</span>
                  </div>
                ) : txError ? (
                  <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Impossible de charger les types de transaction.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {transactions.map((tx) => (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => setSelectedTransaction(tx)}
                        className={`flex items-center gap-2 h-10 px-5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          selectedTransaction?.id === tx.id
                            ? "border-[#D4A843] bg-[#D4A843]/8 text-[#0C1A35]"
                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <ArrowLeftRight className={`w-3.5 h-3.5 flex-shrink-0 ${
                          selectedTransaction?.id === tx.id ? "text-[#D4A843]" : "text-slate-400"
                        }`} />
                        {tx.nom}
                      </button>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Statut du bien ──────────────────────────── */}
              <SectionCard title="Statut du bien" icon={CircleDot}>
                {stLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Chargement…</span>
                  </div>
                ) : stError ? (
                  <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Impossible de charger les statuts.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {statuts.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStatut(st)}
                        className={`flex items-center gap-2 h-10 px-5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          selectedStatut?.id === st.id
                            ? "border-[#D4A843] bg-[#D4A843]/8 text-[#0C1A35]"
                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${
                          selectedStatut?.id === st.id ? "text-[#D4A843]" : "text-slate-400"
                        }`} />
                        {st.nom}
                      </button>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Informations générales ──────────────────── */}
              <SectionCard title="Informations générales" icon={Info}>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Titre de l'annonce *</label>
                    <input
                      type="text"
                      placeholder={`ex : Bel ${selectedType?.nom.toLowerCase() ?? "bien"} à Mermoz`}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description *</label>
                    <textarea
                      rows={4}
                      placeholder="Décrivez le bien, l'environnement, les points forts…"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50
                        text-sm text-slate-700 placeholder:text-slate-300 outline-none
                        focus:border-[#D4A843]/60 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* ── Localisation ────────────────────────────── */}
              <SectionCard title="Localisation" icon={MapPin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Région *</label>
                    <select className={`${inputCls} cursor-pointer appearance-none`}>
                      <option value="">Choisir une région</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Commune / Ville *</label>
                    <input type="text" placeholder="ex : Dakar Plateau" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Quartier *</label>
                    <input type="text" placeholder="ex : Mermoz, Liberté 6…" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Adresse précise
                      <span className="text-slate-400 font-normal ml-1">(optionnel)</span>
                    </label>
                    <input type="text" placeholder="ex : Rue 10, Villa 25" className={inputCls} />
                  </div>
                </div>
              </SectionCard>

              {/* ── Caractéristiques ────────────────────────── */}
              <SectionCard title="Caractéristiques" icon={Ruler}>
                <div className="space-y-5">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{cfg.surfaceLabel} (m²) *</label>
                      <input type="number" min={1} placeholder="ex : 80" className={inputCls} />
                    </div>
                    {cfg.showEtage && (
                      <div>
                        <label className={labelCls}>
                          Étage
                          <span className="text-slate-400 font-normal ml-1">(0 = RDC)</span>
                        </label>
                        <input type="number" min={0} placeholder="ex : 2" className={inputCls} />
                      </div>
                    )}
                  </div>

                  {cfg.showNbEtages && (
                    <div className="flex items-center justify-between py-2 border-t border-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Nombre de niveaux</p>
                        <p className="text-xs text-slate-400">RDC inclus</p>
                      </div>
                      <Counter value={nbEtages} onChange={setNbEtages} min={1} max={10} />
                    </div>
                  )}

                  {(cfg.showChambres || cfg.showSDB) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-50">
                      {cfg.showChambres && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Chambres</p>
                            <p className="text-xs text-slate-400">Pièces à coucher</p>
                          </div>
                          <Counter value={chambres} onChange={setChambres} min={1} />
                        </div>
                      )}
                      {cfg.showSDB && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Salles de bain</p>
                            <p className="text-xs text-slate-400">Dont toilettes</p>
                          </div>
                          <Counter value={sdb} onChange={setSdb} min={1} />
                        </div>
                      )}
                    </div>
                  )}

                  {cfg.showBureauType && (
                    <div className="pt-3 border-t border-slate-50">
                      <label className={labelCls}>Type d'espace</label>
                      <div className="flex flex-wrap gap-4 mt-1">
                        {[
                          { val: "open_space", label: "Open space" },
                          { val: "ferme",      label: "Fermé / Cloisonné" },
                          { val: "mixte",      label: "Mixte" },
                        ].map(({ val, label }, i) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bureau_type"
                              value={val}
                              defaultChecked={i === 0}
                              className="accent-[#D4A843]"
                            />
                            <span className="text-sm text-slate-600">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {cfg.showTerrainUsage && (
                    <div className="pt-3 border-t border-slate-50">
                      <label className={labelCls}>Usage du terrain</label>
                      <div className="flex flex-wrap gap-4 mt-1">
                        {[
                          { val: "constructible", label: "Constructible" },
                          { val: "agricole",      label: "Agricole" },
                          { val: "mixte",         label: "Mixte" },
                        ].map(({ val, label }, i) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="terrain_usage"
                              value={val}
                              defaultChecked={i === 0}
                              className="accent-[#D4A843]"
                            />
                            <span className="text-sm text-slate-600">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {cfg.showTerrainViabilise && (
                    <div className="pt-3 border-t border-slate-50">
                      <label className={labelCls}>Viabilisation disponible</label>
                      <div className="flex gap-6 mt-2">
                        <Checkbox checked={viabiliseEau}  onChange={setViabiliseEau}  label="Eau courante" />
                        <Checkbox checked={viabiliseElec} onChange={setViabiliseElec} label="Électricité" />
                      </div>
                    </div>
                  )}

                  {(cfg.showSanitairePartage || cfg.showCuisinePartagee) && (
                    <div className="pt-3 border-t border-slate-50 space-y-3">
                      {cfg.showSanitairePartage && (
                        <Toggle
                          checked={sanitairePartage}
                          onChange={setSanitairePartage}
                          label="Sanitaires partagés avec les autres locataires"
                        />
                      )}
                      {cfg.showCuisinePartagee && (
                        <Toggle
                          checked={cuisinePartagee}
                          onChange={setCuisinePartagee}
                          label="Accès à une cuisine partagée"
                        />
                      )}
                    </div>
                  )}

                  {cfg.showAscenseur && (
                    <div className="pt-3 border-t border-slate-50">
                      <Toggle checked={ascenseur} onChange={setAscenseur} label="Ascenseur dans l'immeuble" />
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* ── Équipements & Commodités ─────────────────── */}
              {cfg.showEquipements && (
                <SectionCard title="Équipements & Commodités" icon={Zap}>
                  <div className="space-y-4">
                    {(cfg.showMeuble || cfg.showParking || cfg.showJardin ||
                      cfg.showPiscine || cfg.showGardien) && (
                      <div className="space-y-3">
                        {cfg.showMeuble   && <Toggle checked={meuble}  onChange={setMeuble}  label="Bien meublé" />}
                        {cfg.showParking  && <Toggle checked={parking} onChange={setParking} label="Place de parking incluse" />}
                        {cfg.showJardin   && <Toggle checked={jardin}  onChange={setJardin}  label="Jardin / espace extérieur" />}
                        {cfg.showPiscine  && <Toggle checked={piscine} onChange={setPiscine} label="Piscine" />}
                        {cfg.showGardien  && <Toggle checked={gardien} onChange={setGardien} label="Gardien / vigile" />}
                      </div>
                    )}
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                        Commodités
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {amenities.map(({ state, set, label }) => (
                          <Checkbox key={label} checked={state} onChange={set} label={label} />
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── Prix & Disponibilité ─────────────────────── */}
              <SectionCard title="Prix & Disponibilité" icon={DollarSign}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Loyer mensuel *</label>
                      <div className="relative">
                        <input type="number" min={0} placeholder="ex : 150 000" className={`${inputCls} pr-16`} />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                          FCFA
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Caution
                        <span className="text-slate-400 font-normal ml-1">(optionnel)</span>
                      </label>
                      <div className="relative">
                        <input type="number" min={0} placeholder="ex : 300 000" className={`${inputCls} pr-16`} />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                          FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                  <Toggle
                    checked={chargesIncluses}
                    onChange={setChargesIncluses}
                    label="Charges comprises dans le loyer (eau, électricité…)"
                  />
                  <div>
                    <label className={labelCls}>Disponible à partir du</label>
                    <input type="date" className={`${inputCls} cursor-pointer`} />
                  </div>
                </div>
              </SectionCard>

              {/* ── Photos ──────────────────────────────────── */}
              <SectionCard title="Photos" icon={ImageIcon}>
                <div className="space-y-4">
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {photos.map((src, i) => (
                        <div
                          key={i}
                          className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full
                              bg-black/60 text-white flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 text-[10px]
                              text-center bg-[#D4A843] text-[#0C1A35] font-bold py-0.5">
                              PRINCIPALE
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200
                          flex items-center justify-center text-slate-300
                          hover:border-[#D4A843]/50 hover:text-[#D4A843]/60 transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-10
                        flex flex-col items-center gap-3 text-slate-400
                        hover:border-[#D4A843]/40 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5
                        transition-all cursor-pointer"
                    >
                      <Upload className="w-8 h-8" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Ajouter des photos</p>
                        <p className="text-xs mt-0.5 text-slate-400">
                          PNG, JPG jusqu'à 10 Mo — La première photo sera la photo principale
                        </p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </SectionCard>

              {/* ── Actions ─────────────────────────────────── */}
              <div className="flex items-center justify-end gap-3 pb-2">
                <button
                  type="button"
                  className="h-10 px-5 rounded-xl border border-slate-200 text-sm font-medium
                    text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
                >
                  Enregistrer comme brouillon
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35]
                    text-sm font-bold shadow-sm shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
                >
                  Publier l'annonce
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
