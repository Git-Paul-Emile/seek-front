import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith("dashboard") || to.endsWith("profil") || to.endsWith("profile")}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors ${
                isActive
                  ? "text-[#D4A843]"
                  : "text-slate-400 active:text-slate-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
