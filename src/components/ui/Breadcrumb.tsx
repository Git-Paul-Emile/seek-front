import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-400 mb-4" aria-label="Fil d'Ariane">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-slate-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#D4A843] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
