import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import PropertiesSection from "@/components/home/PropertiesSection";
import OwnerStepsSection from "@/components/home/OwnerStepsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => (
  <div className="min-h-screen bg-[#F8F5EE]">
    <HeroSection />
    <CategoriesSection />
    <PropertiesSection />
    <OwnerStepsSection />
    <CTASection />
  </div>
);

export default Index;
