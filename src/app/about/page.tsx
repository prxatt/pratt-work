import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { AboutHero } from '@/components/about/AboutHero';
import { VoxelAboutHero } from '@/components/VoxelAboutHero';
import { CapabilitiesSection } from '@/components/about/CapabilitiesSection';
import { StatsSection } from '@/components/about/StatsSection';
import { NarrativeStatements } from '@/components/about/NarrativeStatements';
import { TechStackAbout } from '@/components/about/TechStackAbout';
import { AboutCTA } from '@/components/about/AboutCTA';

const AICredentials = dynamic(() => import("@/components/sections/AICredentials").then(mod => ({ default: mod.AICredentials })), {
  loading: () => <div className="h-[30vh] bg-[#0a0a0a]" />,
});

export const metadata: Metadata = {
  title: 'About — Pratt Majmudar',
  description: 'Creative Technologist + Executive Producer. 9+ years building experiences that shift perspectives.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D]">
      <AboutHero />
      <VoxelAboutHero />
      <CapabilitiesSection />
      <StatsSection />
      <NarrativeStatements />
      <AICredentials />
      <TechStackAbout />
      <AboutCTA />
    </main>
  );
}
