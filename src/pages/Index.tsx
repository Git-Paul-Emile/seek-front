import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import PropertiesSection from "@/components/home/PropertiesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ScrollToTop from "@/components/ui/ScrollToTop";

const Index = () => (
  <div className="min-h-screen bg-[#F8F5EE]">
    <HeroSection />
    <CategoriesSection />
    <PropertiesSection />
    <TestimonialsSection />
    <ScrollToTop />
  </div>
);

export default Index;
