import { getFileBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { OptimizedHorizontalGallery } from '@/components/work/OptimizedHorizontalGallery';
import { VideoMuteToggle } from '@/components/work/VideoMuteToggle';
import { Metadata } from 'next';
import { getImageUrl, getVideoUrl } from '@/lib/media';

export async function generateMetadata(): Promise<Metadata> {
  const project = await getFileBySlug('work', 'surface-tension-digital-drip');

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.metadata.title} — Pratt Majmudar`,
    description: project.metadata.description || 'Creative Technology + Executive Production work by Pratt Majmudar.',
  };
}

export default async function DigitalDripPage() {
  const project = await getFileBySlug('work', 'surface-tension-digital-drip');

  if (!project) {
    notFound();
  }

  const { metadata, content } = project;

  const contentSections = content.split('---').filter(section => section.trim());
  const mainDescription = contentSections[0]?.trim() || '';
  
  const approachSections = contentSections.slice(1).filter(section => {
    const trimmed = section.trim();
    return trimmed.startsWith('##');
  }).map(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].replace('##', '').trim();
    const body = lines.slice(1).join('\n').trim();
    return { title, body };
  });

  // CRT / Projection Mapping Aesthetic - Analog meets Digital
  const phosphor = '#39FF14';       // CRT phosphor green
  const strobe = '#FF006E';         // Strobe magenta
  const beam = '#00F0FF';           // Projection beam cyan
  const amber = '#FFB000';          // Amber CRT
  const static_ = '#1a1a1a';        // Static noise bg
  const scanline = 'rgba(0,240,255,0.03)'; // Scan lines

  const stats = [
    { value: '70', label: 'TICKETS SOLD OUT', color: phosphor },
    { value: '8K+', label: 'DIGITAL REACH', color: strobe },
    { value: '2-WAY', label: 'PROJECTION', color: beam },
  ];

  return (
    <article className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* CSS Keyframes for animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      
      {/* CRT SCREEN EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Scan lines */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${scanline} 2px,
              ${scanline} 4px
            )`,
            backgroundSize: '100% 4px'
          }}
        />
        
        {/* Screen curvature vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
          }}
        />

        {/* CRT flicker - subtle */}
        <div className="absolute inset-0 bg-black opacity-[0.01] animate-pulse" style={{ animationDuration: '4s' }} />

        {/* RGB chromatic aberration edges */}
        <div 
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 100px rgba(255,0,110,0.05), inset 0 0 100px rgba(0,240,255,0.05)'
          }}
        />
      </div>

      {/* PROJECTION MAPPING BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Projection beam lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={beam} stopOpacity="0.5" />
              <stop offset="50%" stopColor={beam} stopOpacity="0.1" />
              <stop offset="100%" stopColor={beam} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beam2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strobe} stopOpacity="0.3" />
              <stop offset="50%" stopColor={strobe} stopOpacity="0.1" />
              <stop offset="100%" stopColor={strobe} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="url(#beam1)" strokeWidth="100" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="url(#beam2)" strokeWidth="80" />
        </svg>

        {/* Projected text fragments - Asymmetric placement */}
        <div className="absolute top-[15%] left-[8%] font-mono text-[6vw] uppercase opacity-[0.04] blur-sm" style={{ color: beam }}>
          Surface Tension
        </div>
        <div className="absolute top-[35%] right-[12%] font-mono text-[4vw] uppercase opacity-[0.03] blur-sm" style={{ color: strobe }}>
          CIR 10
        </div>
        <div className="absolute bottom-[25%] left-[20%] font-mono text-[5vw] uppercase opacity-[0.035] blur-sm" style={{ color: phosphor }}>
          Studio Certain
        </div>

        {/* Static noise texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* HERO - CRT MONITOR STYLE */}
      <header className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-20">
        {/* Background video - st-mapped */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={getVideoUrl('/work/st-mapped.webm')} type="video/webm" />
          <source src={getVideoUrl('/work/st-mapped.mp4')} type="video/mp4" />
        </video>
        
        {/* Mute toggle for hero video */}
        <div className="absolute bottom-24 right-6 z-20 md:hidden">
          <VideoMuteToggle phosphor={phosphor} />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-[1]" />

        {/* Screen border frame */}
        <div className="absolute inset-8 border border-[#333] pointer-events-none hidden lg:block z-10">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: phosphor }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: phosphor }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: phosphor }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: phosphor }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Top status bar - CRT style */}
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#333]">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: phosphor, animationDuration: '3s' }} />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: phosphor }}>
                SIGNAL: ACTIVE
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#444] uppercase">
              CH: {metadata.year}
            </span>
          </div>

          {/* Main Title - Glitch/CRT style */}
          <div className="mb-8 relative">
            {/* Glitch layers */}
            <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] text-white uppercase leading-[0.9] tracking-tight relative z-10">
              SURFACE
            </h1>
            <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.9] tracking-tight relative z-10"
              style={{ 
                color: phosphor,
                textShadow: `2px 0 ${strobe}, -2px 0 ${beam}` 
              }}>
              TENSION
            </h1>
            <h2 className="font-display text-[clamp(1.5rem,4vw,3rem)] uppercase leading-[0.9] tracking-tight mt-2"
              style={{ color: amber }}>
              DIGITAL DRIP
            </h2>
          </div>

          {/* Subtitle with typewriter cursor */}
          <div className="flex items-center gap-2 mb-12">
            <span className="font-mono text-sm md:text-base text-[#888] uppercase tracking-wider">
              A coffee shop by day, a dimensional portal by night_
            </span>
            <span className="w-3 h-5 bg-[#888] animate-pulse" style={{ animationDuration: '2s' }} />
          </div>

          {/* Stats row - CRT data display */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="border-l-2 pl-4" style={{ borderColor: stat.color }}>
                <span className="font-display text-3xl md:text-4xl block" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#666] block mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Role - Terminal style */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#555]">{'>'}</span>
            <span className="font-mono text-sm uppercase tracking-wider" style={{ color: phosphor }}>
              {metadata.role}
            </span>
            <span className="font-mono text-[10px] text-[#444]">|</span>
            <span className="font-mono text-[10px] text-[#444] uppercase">
              {metadata.client}
            </span>
          </div>
        </div>

        {/* Bottom scan bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
          style={{
            background: `linear-gradient(to right, transparent, ${phosphor}, transparent)`,
          }}
        />
      </header>

      {/* MAIN CONTENT - Split screen CRT style */}
      <section className="relative px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Content - Amber monitor style + Video Frame */}
            <div className="space-y-8">
              {/* Monitor frame */}
              <div className="relative">
                <div className="border-4 border-[#2a2a2a] bg-[#0f0f0f] p-1">
                  <div className="border border-[#3a3a3a] p-6 md:p-8"
                    style={{
                      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
                      boxShadow: `inset 0 0 40px ${amber}10`
                    }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#333]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: amber }} />
                      <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: amber }}>
                        DESCRIPTION.LOG
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <div className="font-mono text-sm uppercase tracking-wide leading-[2]" style={{ color: amber }}>
                        <MDXRemote source={mainDescription} components={mdxComponents} />
                      </div>
                    </div>

                    {/* Terminal prompt */}
                    <div className="mt-8 pt-4 border-t border-[#333] flex items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: amber }}>root@digital-drip:~$</span>
                      <span className="w-2 h-4 bg-[#555] animate-pulse" style={{ animationDuration: '2s' }} />
                    </div>
                  </div>
                </div>

                {/* Monitor stand hint */}
                <div className="mx-auto w-32 h-4 bg-[#222] mt-1" />
                <div className="mx-auto w-48 h-2 bg-[#1a1a1a]" />
              </div>
            </div>

            {/* Right: Photo frames - Projection mapped style */}
            <div className="space-y-4">
              {/* Frame 1 - Wide projection */}
              <div className="relative">
                <div 
                  className="border-2 p-1"
                  style={{ borderColor: `${beam}40` }}
                >
                  <div className="aspect-video bg-[#111] relative overflow-hidden">
                    {/* Background video - st-create */}
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    >
                      <source src={getVideoUrl('/work/st-create.webm')} type="video/webm" />
                      <source src={getVideoUrl('/work/st-create.mp4')} type="video/mp4" />
                    </video>

                    {/* Corner keystone markers - projection mapping style */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-l border-t z-10" style={{ borderColor: beam }} />
                    <div className="absolute top-2 right-2 w-4 h-4 border-r border-t z-10" style={{ borderColor: beam }} />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b z-10" style={{ borderColor: beam }} />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b z-10" style={{ borderColor: beam }} />

                    {/* Scan line overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${beam}10 3px, ${beam}10 6px)`,
                        backgroundSize: '100% 6px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Frame 2 & 3 - Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div 
                    className="border-2 p-1"
                    style={{ borderColor: `${strobe}40` }}
                  >
                    <div className="aspect-square bg-[#111] relative overflow-hidden">
                      {/* Background video - st-crt */}
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      >
                        <source src={getVideoUrl('/work/st-crt.webm')} type="video/webm" />
                        <source src={getVideoUrl('/work/st-crt.mp4')} type="video/mp4" />
                      </video>

                      {/* CRT phosphor glow */}
                      <div className="absolute inset-0 pointer-events-none opacity-20 z-[5]"
                        style={{ boxShadow: `inset 0 0 40px ${phosphor}` }}
                      />

                      {/* CRT flicker */}
                      <div className="absolute inset-0 bg-black opacity-[0.03] animate-pulse z-[5]" style={{ animationDuration: '3s' }} />

                      <div className="absolute top-2 left-2 w-3 h-3 border-l border-t z-10" style={{ borderColor: strobe }} />
                      <div className="absolute top-2 right-2 w-3 h-3 border-r border-t z-10" style={{ borderColor: strobe }} />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b z-10" style={{ borderColor: strobe }} />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b z-10" style={{ borderColor: strobe }} />
                      
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div 
                    className="border-2 p-1"
                    style={{ borderColor: `${phosphor}40` }}
                  >
                    <div className="aspect-square bg-[#111] relative overflow-hidden">
                      {/* Background video - st-coffee */}
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      >
                        <source src={getVideoUrl('/work/st-coffee.webm')} type="video/webm" />
                        <source src={getVideoUrl('/work/st-coffee.mp4')} type="video/mp4" />
                      </video>

                      <div className="absolute top-2 left-2 w-3 h-3 border-l border-t z-10" style={{ borderColor: phosphor }} />
                      <div className="absolute top-2 right-2 w-3 h-3 border-r border-t z-10" style={{ borderColor: phosphor }} />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b z-10" style={{ borderColor: phosphor }} />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b z-10" style={{ borderColor: phosphor }} />
                      
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 4 - Strobe effect */}
              <div className="relative">
                <div 
                  className="border-2 p-1"
                  style={{ borderColor: `${amber}40` }}
                >
                  <div className="aspect-video bg-[#111] relative overflow-hidden">
                    {/* Background video - st-atmosphere */}
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    >
                      <source src={getVideoUrl('/work/st-atmosphere.webm')} type="video/webm" />
                      <source src={getVideoUrl('/work/st-atmosphere.mp4')} type="video/mp4" />
                    </video>

                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 z-10" style={{ borderColor: amber }} />
                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 z-10" style={{ borderColor: amber }} />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 z-10" style={{ borderColor: amber }} />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 z-10" style={{ borderColor: amber }} />
                    

                    {/* Party atmosphere effects */}
                    {/* Strobe flash - slow rave pulse */}
                    <div className="absolute inset-0 pointer-events-none animate-pulse opacity-[0.08] z-10"
                      style={{ backgroundColor: strobe, animationDuration: '3s' }}
                    />
                    
                    {/* Color wash overlay - shifting */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-10 mix-blend-color-dodge"
                      style={{
                        background: `linear-gradient(45deg, ${amber}20, transparent, ${beam}20)`,
                        animation: 'gradientShift 8s ease infinite'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL SCROLLING GALLERY - Digital Drip Event Photos */}
      <OptimizedHorizontalGallery 
        phosphor={phosphor} 
        images={[
          { webp: getImageUrl('/work/st-dd1.webp', 1920), jpg: getImageUrl('/work/st-dd1.jpg', 1920), alt: 'Digital Drip Event - Photo 1' },
          { webp: getImageUrl('/work/st-dd2.webp', 1920), jpg: getImageUrl('/work/st-dd2.jpg', 1920), alt: 'Digital Drip Event - Photo 2' },
          { webp: getImageUrl('/work/st-dd3.webp', 1920), jpg: getImageUrl('/work/st-dd3.jpg', 1920), alt: 'Digital Drip Event - Photo 3' },
          { webp: getImageUrl('/work/st-dd4.webp', 1920), jpg: getImageUrl('/work/st-dd4.jpg', 1920), alt: 'Digital Drip Event - Photo 4' },
          { webp: getImageUrl('/work/st-dd5.webp', 1920), jpg: getImageUrl('/work/st-dd5.jpg', 1920), alt: 'Digital Drip Event - Photo 5' },
          { webp: getImageUrl('/work/st-dd6.webp', 1920), jpg: getImageUrl('/work/st-dd6.jpg', 1920), alt: 'Digital Drip Event - Photo 6' },
          { webp: getImageUrl('/work/st-dd7.webp', 1920), jpg: getImageUrl('/work/st-dd7.jpg', 1920), alt: 'Digital Drip Event - Photo 7' },
        ]}
      />

      {/* PROCESS - Strobe cut style */}
      <section className="relative px-6 md:px-12 lg:px-20 py-24 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          {/* Section header - Glitch style */}
          <div className="mb-16 relative">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-20" style={{ backgroundColor: strobe }} />
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: strobe }}>
                /// EXECUTION_LOG
              </span>
            </div>
          </div>

          {/* Process steps - Sharp cuts */}
          <div className="space-y-1">
            {approachSections.map((approach, index) => (
              <div 
                key={approach.title}
                className="relative group"
              >
                {/* Strobe line */}
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ 
                    backgroundColor: index === 0 ? phosphor : index === 1 ? strobe : beam,
                    opacity: 0.5
                  }}
                />

                <div className="pl-8 py-8 border-b border-[#222] hover:bg-[#0f0f0f] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Step number - Binary style */}
                    <div className="flex-shrink-0">
                      <span 
                        className="font-mono text-4xl md:text-5xl font-bold"
                        style={{ 
                          color: index === 0 ? phosphor : index === 1 ? strobe : beam,
                          textShadow: index === 1 ? `0 0 20px ${strobe}` : 'none'
                        }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-xs text-[#333] block mt-1">
                        {index === 0 ? '0x01' : index === 1 ? '0x02' : '0x03'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 
                        className="font-display text-2xl md:text-3xl uppercase tracking-tight mb-4"
                        style={{ color: index === 0 ? phosphor : index === 1 ? strobe : beam }}
                      >
                        {approach.title}
                      </h3>
                      <div className="font-mono text-sm uppercase tracking-wide leading-[1.9] text-[#666]">
                        <MDXRemote source={approach.body} components={mdxComponents} />
                      </div>
                    </div>

                    {/* Arrow - Glitch style */}
                    <div className="hidden md:flex items-center">
                      <span 
                        className="font-mono text-2xl"
                        style={{ 
                          color: index === 0 ? phosphor : index === 1 ? strobe : beam,
                          opacity: 0.5
                        }}>
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE VIDEO FRAME - Before End of Transmission */}
      <section className="relative px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="relative w-[280px]">
            {/* Mobile frame bezel */}
            <div className="border-4 border-[#333] rounded-[2rem] p-2 bg-[#1a1a1a]">
              <div className="border border-[#444] rounded-[1.5rem] overflow-hidden">
                {/* Vertical video area */}
                <div className="aspect-[9/16] bg-[#111] relative">
                  {/* Background video - st-mobile */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  >
                    <source src={getVideoUrl('/work/st-mobile.webm')} type="video/webm" />
                    <source src={getVideoUrl('/work/st-mobile.mp4')} type="video/mp4" />
                  </video>

                  {/* Phone notch area */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#1a1a1a] rounded-b-lg z-20" />
                  
                  {/* Corner markers */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-l border-t z-10" style={{ borderColor: amber }} />
                  <div className="absolute top-4 right-4 w-4 h-4 border-r border-t z-10" style={{ borderColor: amber }} />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b z-10" style={{ borderColor: amber }} />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b z-10" style={{ borderColor: amber }} />
                  
                  {/* Recording UI */}
                  <div className="absolute top-6 right-4 flex items-center gap-1 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDuration: '2s' }} />
                    <span className="font-mono text-[8px] text-[#666]">REC</span>
                  </div>
                  

                  {/* Mobile scan lines */}
                  <div className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${amber}05 2px, ${amber}05 4px)`,
                      backgroundSize: '100% 4px'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Phone home bar */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#444] rounded-full" />
          </div>
        </div>
      </section>

      {/* CLOSING - CRT power off effect */}
      <section className="relative px-6 md:px-12 lg:px-20 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Power off line */}
          <div className="relative">
            <div 
              className="h-[2px] w-full mb-12"
              style={{
                background: `linear-gradient(to right, transparent, ${phosphor}, transparent)`,
                boxShadow: `0 0 20px ${phosphor}`
              }}
            />

            <span className="font-mono text-[10px] tracking-[0.4em] uppercase block mb-6" style={{ color: phosphor }}>
              END_OF_TRANSMISSION
            </span>

            <h3 className="font-display text-3xl md:text-4xl text-white uppercase tracking-tight mb-6">
              GLITCH IN THE MATRIX
            </h3>

            <p className="font-mono text-sm text-[#666] uppercase tracking-wider max-w-xl mx-auto leading-relaxed">
              A COFFEE RAVE THAT INVITES YOU TO COME FOR THE MOCKTAILS AND ART SHOW AND STAY FOR THE DISSONANCE.
            </p>

            {/* Final scan */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <span className="font-mono text-xs text-[#444]">[</span>
              <span className="font-mono text-xs" style={{ color: phosphor }}>SIGNAL_TERMINATED</span>
              <span className="font-mono text-xs text-[#444]">]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Footer */}
      <WorkProjectFooter currentSlug="surface-tension-digital-drip" />
    </article>
  );
}
