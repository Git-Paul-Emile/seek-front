import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  /** Classe appliquée au trigger */
  triggerClassName?: string;
  /** Mode dark (fond semi-transparent blanc sur fond sombre) */
  dark?: boolean;
}

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  emptyLabel = "Aucun résultat",
  triggerClassName = "",
  dark = false,
}: SearchableSelectProps) => {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.trim().toLowerCase())
      )
    : options;

  // Grouper les options
  const grouped: { group: string | undefined; items: Option[] }[] = [];
  filtered.forEach((opt) => {
    const last = grouped[grouped.length - 1];
    if (last && last.group === opt.group) {
      last.items.push(opt);
    } else {
      grouped.push({ group: opt.group, items: [opt] });
    }
  });

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  // Fermer si clic à l'extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  // Styles selon mode
  const triggerBase = dark
    ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
    : "bg-white border-slate-200 text-[#1A2942] hover:border-slate-300";

  const placeholderColor = dark ? "text-white/35" : "text-slate-400";

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "flex items-center justify-between w-full h-11 px-3 rounded-md border text-sm transition-all focus:outline-none focus:ring-0",
          triggerBase,
          triggerClassName,
        ].join(" ")}
      >
        <span className={selected ? "" : placeholderColor}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-0.5 ml-2 flex-shrink-0">
          {value && (
            <span
              role="button"
              onClick={handleClear}
              className={`p-0.5 rounded hover:bg-black/10 ${dark ? "text-white/50 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-150 ${open ? "rotate-180" : ""} ${dark ? "text-white/40" : "text-slate-400"}`}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm text-[#1A2942] placeholder:text-slate-400 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {grouped.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400 text-center">{emptyLabel}</div>
            ) : (
              grouped.map(({ group, items }) => (
                <div key={group ?? "_"}>
                  {group && (
                    <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                      {group}
                    </div>
                  )}
                  {items.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={[
                        "w-full text-left px-3 py-2 text-sm transition-colors",
                        opt.value === value
                          ? "bg-[#0C1A35] text-white font-medium"
                          : "text-[#1A2942] hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
