import { Link } from "react-router-dom";
import type { Category } from "@/data/home";

const CategoryCard = ({ category }: { category: Category }) => (
  <Link
    to={`/search?type=${category.id}`}
    className="group flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-100 hover:border-[#0C1A35]/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
    <div className="h-28 overflow-hidden">
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>
    <div className="px-3 py-2.5 text-center">
      <h3 className="font-semibold text-[#1A2942] text-sm mb-0.5">{category.name}</h3>
      <p className="text-xs text-slate-400">{category.count} annonces</p>
    </div>
  </Link>
);

export default CategoryCard;
