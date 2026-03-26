import { Link } from "react-router-dom";
import { Menu, House } from "lucide-react";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  homePath: string;
}

export function MobileHeader({ onMenuOpen, homePath }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-50">
      <Link to={homePath} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#D4A843] flex items-center justify-center">
          <House className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-[#0C1A35] text-sm">Seek</span>
      </Link>

      <button
        onClick={onMenuOpen}
        className="p-2.5 -mr-1 rounded-xl text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
}
