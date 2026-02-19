import { OWNER_STEPS } from "@/data/home";

const OwnerStepsSection = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">Propriétaires</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A2942] mb-2">Publiez en quelques étapes</h2>
        <p className="text-slate-400 text-sm">Simple, rapide et gratuit</p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8">
        {OWNER_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex flex-col items-center text-center w-40">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0C1A35] to-[#1A3A6C] flex items-center justify-center mb-4 shadow-lg shadow-[#0C1A35]/20">
                <Icon className="w-7 h-7 text-[#D4A843]" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#D4A843] text-[#0C1A35] text-xs font-bold flex items-center justify-center shadow-md">
                  {step.number}
                </span>
              </div>
              <h3 className="font-bold text-[#1A2942] text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              {i < OWNER_STEPS.length - 1 && (
                <div className="sm:hidden w-px h-6 bg-[#D4A843]/30 mt-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default OwnerStepsSection;
