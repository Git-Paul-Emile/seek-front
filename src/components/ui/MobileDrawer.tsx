import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, House } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  roleLabel: string;
  homePath: string;
  children: React.ReactNode;
}

export function MobileDrawer({ open, onClose, roleLabel, homePath, children }: MobileDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] flex flex-col
          transition-transform duration-300 ease-out shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0">
          <Link to={homePath} onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4A843] flex items-center justify-center">
              <House className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-[#0C1A35] text-base leading-none">
                Seek
              </span>
              <span className="block text-[10px] text-slate-400 leading-none mt-0.5 font-medium">
                {roleLabel}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation content (scrollable) */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {children}
        </nav>
      </aside>
    </>
  );
}
