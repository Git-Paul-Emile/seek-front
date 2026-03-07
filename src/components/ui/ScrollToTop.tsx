import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Retour en haut"
      className="fixed bottom-8 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-[#0C1A35] border border-white/10 text-white shadow-lg hover:bg-[#1A2942] hover:scale-110 transition-all duration-200"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
