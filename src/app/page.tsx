import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import { Hero } from "@/components/sections/Hero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { AboutSection } from "@/components/sections/AboutSection";
import { LogoMarquee } from "@/components/sections/LogoMarquee";

// Dynamically import below-the-fold sections for better performance
const FeaturedWork = dynamic(() => import("@/components/sections/FeaturedWork").then(mod => ({ default: mod.FeaturedWork })), {
  loading: () => <div className="h-[50vh] bg-[#0a0a0a]" />,
});

const AICredentials = dynamic(() => import("@/components/sections/AICredentials").then(mod => ({ default: mod.AICredentials })), {
  loading: () => <div className="h-[30vh] bg-[#0a0a0a]" />,
});

const VenturesSection = dynamic(() => import("@/components/sections/VenturesSection").then(mod => ({ default: mod.VenturesSection })), {
  loading: () => <div className="h-[60vh] bg-[#0a0a0a]" />,
});

// SecondaryContent hidden per request
// const SecondaryContent = dynamic(() => import("@/components/sections/SecondaryContent").then(mod => ({ default: mod.SecondaryContent })), {
//   loading: () => <div className="h-[40vh] bg-[#0a0a0a]" />,
// });

const HowIWork = dynamic(() => import("@/components/sections/HowIWork").then(mod => ({ default: mod.HowIWork })), {
  loading: () => <div className="h-[50vh] bg-[#0a0a0a]" />,
});

const RecognitionSection = dynamic(() => import("@/components/sections/RecognitionSection").then(mod => ({ default: mod.RecognitionSection })), {
  loading: () => <div className="h-[50vh] bg-[#0a0a0a]" />,
});

const TypographicCTA = dynamic(() => import("@/components/sections/TypographicCTA").then(mod => ({ default: mod.TypographicCTA })), {
  loading: () => <div className="h-[40vh] bg-[#0a0a0a]" />,
});

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Above the fold - eager loaded */}
      <Hero />
      <AboutSection />
      <LogoMarquee />
      
      {/* Below the fold - lazy loaded */}
      <FeaturedWork />
      <AICredentials />
      <VenturesSection />
      {/* <SecondaryContent /> */}
      <HowIWork />
      <RecognitionSection />
      <TypographicCTA />
    </div>
  );
}
