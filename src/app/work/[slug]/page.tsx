import { getFileBySlug, getAllFilesMetadata } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { Metadata } from 'next';
import Image from 'next/image';
import { getImageUrl, getVideoUrl } from '@/lib/media';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getFileBySlug('work', slug);

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

export async function generateStaticParams() {
  const projects = await getAllFilesMetadata('work');
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function WorkProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getFileBySlug('work', slug);

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
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  });

  const categoryColors: Record<string, string> = {
    'CORPORATE EVENTS': '#EC4899',
    'EXPERIENTIAL': '#22C55E',
    'AI + TECH': '#3B82F6',
    'FILM + DIGITAL': '#F59E0B',
    'R&D': '#A855F7',
  };
  
  const primaryCategory = metadata.category?.[0] || 'PROJECT';
  const accentColor = categoryColors[primaryCategory] || '#8A8A85';

  return (
    <article className="min-h-screen bg-[#0D0D0D]">
      {/* HERO SECTION */}
      <header className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div 
          className="absolute top-1/4 right-0 w-[800px] h-[800px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />
        
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-[1px]" style={{ backgroundColor: accentColor }} />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: accentColor }}>
              {metadata.year} — {primaryCategory}
            </span>
          </div>

          <h1 
            className="font-display text-[#F2F2F0] uppercase leading-[0.85] tracking-tight max-w-6xl"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
          >
            {metadata.title}
          </h1>

          <div className="mt-8 flex items-center gap-4">
            <span 
              className="font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 rounded-full border"
              style={{ 
                color: accentColor, 
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}08`
              }}
            >
              {metadata.role}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase">
              For {metadata.client}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#262626] pt-8">
            <div>
              <span className="font-mono text-[9px] tracking-[0.3em] text-tertiary uppercase block mb-2">Client</span>
              <span className="font-display text-xl text-[#F2F2F0] uppercase tracking-wide">{metadata.client}</span>
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-[0.3em] text-tertiary uppercase block mb-2">Year</span>
              <span className="font-display text-xl text-[#F2F2F0] uppercase tracking-wide">{metadata.year}</span>
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-[0.3em] text-tertiary uppercase block mb-2">Role</span>
              <span className="font-display text-xl text-[#F2F2F0] uppercase tracking-wide">{metadata.role}</span>
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-[0.3em] text-tertiary uppercase block mb-2">Category</span>
              <span className="font-display text-lg text-[#F2F2F0] uppercase tracking-wide">{metadata.category?.join(' + ') || 'PROJECT'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO MEDIA */}
      {metadata.heroMedia && (
        <section className="relative px-6 md:px-12 lg:px-20 py-16">
          <div className="relative max-w-[90vw] mx-auto">
            <div 
              className="relative bg-[#141414] overflow-hidden group"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
            >
              <div className="absolute top-0 left-0 w-12 h-[2px] z-20" style={{ backgroundColor: accentColor }} />
              <div className="absolute top-0 left-0 w-[2px] h-12 z-20" style={{ backgroundColor: accentColor }} />
              <div className="absolute top-0 right-0 w-12 h-[2px] z-20" style={{ backgroundColor: accentColor }} />
              <div className="absolute top-0 right-0 w-[2px] h-12 z-20" style={{ backgroundColor: accentColor }} />

              <div className="relative aspect-[21/9] bg-[#0a0a0a]">
                {/\.(webm|mp4|mov)$/i.test(metadata.heroMedia) ? (
                  <video src={getVideoUrl(metadata.heroMedia)} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <Image src={getImageUrl(metadata.heroMedia, 1920)} alt={metadata.title} fill className="object-cover" priority />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/60 uppercase">Project Visual</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[1px]" style={{ backgroundColor: accentColor }} />
                  <span className="font-mono text-[9px] tracking-[0.15em] text-white/40">001</span>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden xl:block">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-tertiary" style={{ writingMode: 'vertical-rl' }}>Featured</span>
            </div>
          </div>
        </section>
      )}

      {/* MAIN DESCRIPTION */}
      <section className="px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>Overview</span>
            <div className="flex-1 h-[1px] bg-[#262626]" />
          </div>
          <div className="font-sans text-lg md:text-xl text-[#A3A3A3] leading-[1.8] uppercase tracking-wide">
            <MDXRemote source={mainDescription} components={mdxComponents} />
          </div>
        </div>
      </section>

      {/* TWO PHOTO FRAMES */}
      <section className="px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Photo Frame 1 */}
          <div className="relative group">
            <div className="relative bg-[#141414] overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
              <div className="absolute top-0 left-0 w-8 h-[2px] z-10" style={{ backgroundColor: accentColor }} />
              <div className="absolute top-0 left-0 w-[2px] h-8 z-10" style={{ backgroundColor: accentColor }} />
              <div className="relative aspect-[4/3] bg-[#0a0a0a] flex items-center justify-center">
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border border-[#333] flex items-center justify-center mx-auto mb-4 group-hover:border-[#444] transition-colors duration-500">
                    <span className="font-mono text-[10px] text-[#4A4A47]">[IMG]</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#333] uppercase tracking-[0.3em]">Event Space</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${accentColor}30` }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="font-mono text-[8px] text-[#333] tracking-wider">002</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[1px] bg-[#262626]" />
                    <span className="font-mono text-[8px] text-[#333]">PHOTO</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accentColor }} />
            </div>
          </div>

          {/* Photo Frame 2 - Offset */}
          <div className="relative group lg:mt-16">
            <div className="relative bg-[#141414] overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
              <div className="absolute top-0 left-0 w-8 h-[2px] z-10" style={{ backgroundColor: accentColor }} />
              <div className="absolute top-0 left-0 w-[2px] h-8 z-10" style={{ backgroundColor: accentColor }} />
              <div className="relative aspect-[4/3] bg-[#0a0a0a] flex items-center justify-center">
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border border-[#333] flex items-center justify-center mx-auto mb-4 group-hover:border-[#444] transition-colors duration-500">
                    <span className="font-mono text-[10px] text-[#4A4A47]">[IMG]</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#333] uppercase tracking-[0.3em]">Activation Detail</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${accentColor}30` }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="font-mono text-[8px] text-[#333] tracking-wider">003</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[1px] bg-[#262626]" />
                    <span className="font-mono text-[8px] text-[#333]">PHOTO</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>
      </section>

      {/* THREE APPROACHES */}
      {approachSections.length > 0 && (
        <section className="px-6 md:px-12 lg:px-20 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>Approach</span>
              <div className="flex-1 h-[1px] bg-[#262626]" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase">
                {String(approachSections.length).padStart(2, '0')} Perspectives
              </span>
            </div>

            <div className="space-y-16">
              {approachSections.map((approach, index) => (
                <div key={approach.title} className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start group">
                  <div className="md:col-span-2 flex items-start gap-4">
                    <span className="font-display text-6xl md:text-7xl leading-none" style={{ color: `${accentColor}20` }}>0{index + 1}</span>
                    <div className="hidden md:block w-[1px] h-16 mt-2" style={{ backgroundColor: `${accentColor}30` }} />
                  </div>
                  <div className="md:col-span-10">
                    <h3 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight mb-6">{approach.title}</h3>
                    <div className="font-sans text-base text-[#A3A3A3] leading-[1.8] uppercase tracking-wide max-w-2xl">
                      <MDXRemote source={approach.content} components={mdxComponents} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEO FRAME */}
      <section className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>Video</span>
            <div className="flex-1 h-[1px] bg-[#262626]" />
          </div>

          <div className="relative group">
            <div className="relative bg-[#141414] p-4 rounded-lg border border-[#262626]">
              <div className="relative aspect-video bg-[#0a0a0a] rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500" style={{ borderColor: accentColor }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: accentColor }}>
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-mono text-[9px] text-[#4A4A47] uppercase tracking-[0.3em]">Project Documentation</span>
                  </div>
                </div>
                <div className="absolute top-3 left-3 w-6 h-[1px] bg-white/10" />
                <div className="absolute top-3 left-3 w-[1px] h-6 bg-white/10" />
                <div className="absolute top-3 right-3 w-6 h-[1px] bg-white/10" />
                <div className="absolute top-3 right-3 w-[1px] h-6 bg-white/10" />
                <div className="absolute bottom-3 left-3 w-6 h-[1px] bg-white/10" />
                <div className="absolute bottom-3 left-3 w-[1px] h-6 bg-white/10" />
                <div className="absolute bottom-3 right-3 w-6 h-[1px] bg-white/10" />
                <div className="absolute bottom-3 right-3 w-[1px] h-6 bg-white/10" />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                  <span className="font-mono text-[8px] text-white/40 uppercase tracking-wider">REC</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#333]" />
                  <div className="w-3 h-3 rounded-full bg-[#333]" />
                  <div className="w-3 h-3 rounded-full bg-[#333]" />
                </div>
                <span className="font-mono text-[9px] text-tertiary tracking-wider">00:00 / 02:34</span>
              </div>
            </div>
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:block">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-tertiary" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Documentation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Footer - Work pages use WorkProjectFooter, NOT the main PRXATT Footer */}
      <WorkProjectFooter currentSlug={slug} />
    </article>
  );
}
