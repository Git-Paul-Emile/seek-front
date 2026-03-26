import { useRef } from "react";
import marketingImg from "@/assets/marketing.png";
import marketingMobileImg from "@/assets/marketing-mobile.png";

const MarketingBanner = () => {
  return (
    <div className="py-2 md:py-8 px-4 md:px-0">
      <div 
        className="relative max-w-[1216px] mx-auto overflow-hidden rounded-[1rem]"
        style={{ 
          boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" 
        }}
      >
        {/* Version Desktop */}
        <img
          src={marketingImg}
          alt="Marketing Seek Immobilier"
          className="hidden md:block w-full h-auto rounded-[1rem]"
        />
        {/* Version Mobile */}
        <img
          src={marketingMobileImg}
          alt="Marketing Seek Immobilier Mobile"
          className="block md:hidden w-full h-auto rounded-[1rem]"
        />
      </div>
    </div>
  );
};

export default MarketingBanner;
