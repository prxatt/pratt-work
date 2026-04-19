'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCursor } from '@/context/CursorContext';
import { getImageUrl, getVideoUrl } from '@/lib/media';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';

// Thumbnail mapping for projects
const projectThumbnails: Record<string, { src: string; alt: string; objectPosition?: string }> = {
  'the-crypt-volumetric': { src: '/work/the-crypt-thumb.webm', alt: 'The Crypt Volumetric' },
  'weights-and-biases-fully-connected': { src: '/work/weights-biases-thumb.webp', alt: 'Weights & Biases Fully Connected' },
  'surface-tension-digital-drip': { src: '/work/surface-tension-thumb.webm', alt: 'Surface Tension Digital Drip' },
  'boubyan-bank-hq': { src: '/work/boubyan-bank-thumb.webp', alt: 'Boubyan Bank HQ' },
  'salesforce-grant-celebration': { src: '/work/salesforce-thumb.webp', alt: 'Salesforce Grant Celebration' },
  'levis-innovation-labs': { src: '/work/levis-thumb.webp', alt: "Levi's Innovation Labs" },
  'pwc-liftoff-vr360': { src: '/work/pwc-liftoff-thumb.webp', alt: 'PwC Liftoff VR360' },
  'stability-ai': { src: '/work/stability-ai-thumb.webp', alt: 'Stability AI' },
  'women-is-losers': { src: '/work/women-is-losers-thumb.webp', alt: 'Women Is Losers', objectPosition: 'center 10%' },
};

// All available projects for randomization
const allProjects = [
  {
    slug: 'the-crypt-volumetric',
    title: 'THE CRYPT',
    subtitle: 'Volumetric Video in Spatial Computing | Private Research Initiative',
    category: 'R&D',
    year: '2026',
  },
  {
    slug: 'weights-and-biases-fully-connected',
    title: "WEIGHTS & BIASES 'FULLY CONNECTED'",
    subtitle: 'AI CONFERENCE | MLOPS',
    category: 'AI + TECH',
    year: '2025',
  },
  {
    slug: 'surface-tension-digital-drip',
    title: 'SURFACE TENSION PRESENTS DIGITAL DRIP',
    subtitle: 'EXPERIENTIAL | IMMERSIVE ART',
    category: 'EXPERIENTIAL',
    year: '2025',
  },
  {
    slug: 'boubyan-bank-hq',
    title: 'THE SHAPE OF FINANCE WITH BOUBYAN BANK',
    subtitle: '3D GENERATIVE EXPERIENCE | EXPERIENTIAL',
    category: 'EXPERIENTIAL',
    year: '2024',
  },
  {
    slug: 'salesforce-grant-celebration',
    title: 'SALESFORCE GRANT CELEBRATION & DREAMFORCE ACTIVATION',
    subtitle: 'CORPORATE EVENTS | FUNDRAISER',
    category: 'CORPORATE EVENTS',
    year: '2023',
  },
  {
    slug: 'levis-innovation-labs',
    title: "LEVI'S INNOVATION LABS",
    subtitle: 'IMMERSIVE BRANDED CONTENT | VR 360',
    category: 'EXPERIENTIAL',
    year: '2023',
  },
  {
    slug: 'pwc-liftoff-vr360',
    title: 'PWC LIFTOFF ACCELERATORS CONFERENCE IN VR 360',
    subtitle: 'LARGE CONFERENCE | VR 360',
    category: 'EXPERIENTIAL',
    year: '2023',
  },
  {
    slug: 'stability-ai',
    title: 'STABILITY AI',
    subtitle: 'BRAND LAUNCH EVENT',
    category: 'AI + TECH',
    year: '2022',
  },
  {
    slug: 'women-is-losers',
    title: 'WOMEN IS LOSERS',
    subtitle: 'INDEPENDENT FILM PRODUCTION',
    category: 'FILM + DIGITAL',
    year: '2021',
  },
];

// Get project thumbnail
const getProjectThumbnail = (slug: string) => {
  return projectThumbnails[slug] || null;
};

// Check if thumbnail is a video file
const isVideoThumbnail = (src: string): boolean => {
  const videoExtensions = ['.webm', '.mp4', '.mov', '.m4v'];
  const lowerSrc = src.toLowerCase();
  return videoExtensions.some(ext => lowerSrc.endsWith(ext));
};

// Get category color
const getCategoryColor = (category: string) => {
  const upperCategory = category.toUpperCase();
  if (upperCategory.includes('EXPERIENTIAL')) return '#22C55E';
  if (upperCategory.includes('AI') || upperCategory.includes('TECH')) return '#3B82F6';
  if (upperCategory.includes('FILM')) return '#F59E0B';
  if (upperCategory.includes('R&D')) return '#A855F7';
  if (upperCategory.includes('CORPORATE')) return '#EC4899';
  return '#8A8A85';
};

// Get category gradient
const getCategoryGradient = (category: string) => {
  const upperCategory = category.toUpperCase();
  if (upperCategory.includes('EXPERIENTIAL')) 
    return 'linear-gradient(135deg, #0f1f12 0%, #1a3a1f 100%)';
  if (upperCategory.includes('AI') || upperCategory.includes('TECH')) 
    return 'linear-gradient(135deg, #0a0f1e 0%, #0f1a38 100%)';
  if (upperCategory.includes('FILM')) 
    return 'linear-gradient(135deg, #1e1208 0%, #3a2010 100%)';
  if (upperCategory.includes('R&D')) 
    return 'linear-gradient(135deg, #150a1e 0%, #2a0f3a 100%)';
  if (upperCategory.includes('CORPORATE')) 
    return 'linear-gradient(135deg, #1e0a1a 0%, #3a1028 100%)';
  return 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)';
};

interface WorkProjectFooterProps {
  currentSlug: string;
}

// Enhanced Project Card Component with 3D effects and micro-animations
function ProjectCard({ 
  project, 
  index, 
  projColor, 
  projGradient,
  thumbnail 
}: { 
  project: typeof allProjects[0]; 
  index: number; 
  projColor: string; 
  projGradient: string;
  thumbnail: { src: string; alt: string; objectPosition?: string } | null;
}) {
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = thumbnail && isVideoThumbnail(thumbnail.src);

  // For video thumbnails, show immediately without waiting for load
  useEffect(() => {
    if (isVideo) {
      setImageLoaded(true);
      // Ensure video plays
      const video = videoRef.current;
      if (video) {
        video.load();
        video.play().catch(() => {
          // Autoplay blocked - video will still show as poster
        });
      }
    }
  }, [isVideo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.9, 
        delay: index * 0.2, 
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 1000 }}
    >
      <Link
        href={`/work/${project.slug}`}
        className="group block relative"
        onMouseEnter={() => {
          setIsHovered(true);
          setCursorState('hover');
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setCursorState('default');
        }}
      >
        {/* Card Container with 3D Tilt */}
        <motion.div
          className="relative"
          animate={{
            y: isHovered ? -8 : 0,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow Effect */}
          <motion.div
            className="absolute -inset-4 rounded-2xl blur-2xl -z-10"
            style={{ backgroundColor: projColor }}
            animate={{ opacity: isHovered ? 0.2 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Card Image Area */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[#0D0D0D] rounded-lg border border-[#1a1a1a] group-hover:border-[#333] transition-colors duration-500">
            {/* Background gradient (shown while loading or if no thumbnail) */}
            <motion.div 
              className="absolute inset-0 z-0"
              style={{ background: projGradient }}
              animate={{ opacity: thumbnail && imageLoaded ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Shimmer Loading Effect */}
              {!imageLoaded && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>

            {/* Actual Thumbnail - Image or Video */}
            {thumbnail && (
              <motion.div
                className="absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {isVideoThumbnail(thumbnail.src) ? (
                  /* Video Thumbnail */
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setImageLoaded(false)}
                      style={{ willChange: 'transform' }}
                    >
                      {thumbnail.src.toLowerCase().endsWith('.webm') ? (
                        <>
                          <source src={getVideoUrl(thumbnail.src)} type="video/webm" />
                          <source
                            src={getVideoUrl(thumbnail.src.replace(/\.webm$/i, '.mp4'))}
                            type="video/mp4"
                          />
                        </>
                      ) : (
                        <source src={getVideoUrl(thumbnail.src)} type="video/mp4" />
                      )}
                    </video>
                    {/* Subtle overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  /* Image Thumbnail */
                  <>
                    <Image
                      src={getImageUrl(thumbnail.src, 1200, { format: 'webp' })}
                      alt={thumbnail.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onLoad={() => setImageLoaded(true)}
                      priority={index < 2}
                      style={thumbnail.objectPosition ? { objectPosition: thumbnail.objectPosition } : undefined}
                    />
                    {/* Subtle overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                )}
              </motion.div>
            )}
            
            {/* Noise texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Corner Accents - Animated */}
            <motion.div 
              className="absolute top-0 left-0 w-16 h-[2px] z-30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ originX: 0, backgroundColor: projColor }}
            />
            <motion.div 
              className="absolute top-0 left-0 w-[2px] h-16"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ originY: 0, backgroundColor: projColor }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-16 h-[2px]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ originX: 1, backgroundColor: projColor }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-[2px] h-16"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{ originY: 1, backgroundColor: projColor }}
            />

            {/* Project Number */}
            <motion.div
              className="absolute top-4 right-4 font-display text-6xl md:text-7xl"
              style={{ color: `${projColor}20` }}
              animate={{ 
                opacity: isHovered ? 0.4 : 0.2,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              0{index + 1}
            </motion.div>

            {/* Hover overlay with VIEW button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ 
                  scale: isHovered ? 1 : 0.8, 
                  y: isHovered ? 0 : 20,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span 
                  className="font-display text-sm tracking-widest uppercase px-8 py-4 rounded-full border-2 flex items-center gap-3"
                  style={{ 
                    borderColor: projColor, 
                    color: projColor,
                    backgroundColor: `${projColor}15`,
                  }}
                >
                  <motion.span
                    animate={{ x: isHovered ? [0, 4, 0] : 0 }}
                    transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
                  >
                    VIEW PROJECT
                  </motion.span>
                  <motion.svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Card Info */}
          <motion.div 
            className="pt-5 pb-2"
            animate={{ y: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.span 
                className="font-mono text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full border"
                style={{ 
                  color: projColor, 
                  borderColor: `${projColor}40`,
                  backgroundColor: `${projColor}08`,
                }}
                animate={{ 
                  borderColor: isHovered ? projColor : `${projColor}40`,
                }}
                transition={{ duration: 0.3 }}
              >
                {project.category}
              </motion.span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase">
                {project.year}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl text-[#F2F2F0] uppercase tracking-tight leading-none mb-2">
              {project.title}
            </h3>
            <p className="font-mono text-[10px] tracking-[0.15em] text-tertiary uppercase">
              {project.subtitle}
            </p>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function WorkProjectFooter({ currentSlug }: WorkProjectFooterProps) {
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration-safe: deterministic on server/initial render, randomized after mount
  const randomProject = useMemo(() => {
    const otherProjects = allProjects.filter(p => p.slug !== currentSlug);
    if (!isMounted) {
      // Deterministic during SSR - pick first project alphabetically
      return otherProjects.sort((a, b) => a.slug.localeCompare(b.slug))[0] || otherProjects[0];
    }
    // Randomized only after client mount
    return otherProjects[Math.floor(Math.random() * otherProjects.length)];
  }, [currentSlug, isMounted]);

  // Hydration-safe: deterministic on server/initial render, randomized after mount
  const featuredProjects = useMemo(() => {
    const otherProjects = allProjects.filter(p => p.slug !== currentSlug);
    if (!isMounted) {
      // Deterministic during SSR - pick first 2 projects alphabetically
      return otherProjects.sort((a, b) => a.slug.localeCompare(b.slug)).slice(0, 2);
    }
    // Randomized only after client mount
    const shuffled = [...otherProjects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [currentSlug, isMounted]);

  // Set mounted state after hydration completes
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categoryColor = getCategoryColor(randomProject.category);
  const categoryGradient = getCategoryGradient(randomProject.category);

  return (
    <footer className="mt-0">
      {/* MORE WORKS Marquee Section - Reference Image Style */}
      <section className="relative py-16 overflow-hidden border-t border-[#262626]">
        {/* Scrolling Marquee Text */}
        <div className="relative mb-12 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex whitespace-nowrap"
          >
            <div className="animate-marquee-left flex items-center gap-8">
              {[...Array(4)].map((_, i) => (
                <React.Fragment key={i}>
                  <span className="font-display text-5xl md:text-7xl text-[#F2F2F0] uppercase tracking-tight">
                    MORE WORKS
                  </span>
                  <span className="font-display text-5xl md:text-7xl text-[#525252] uppercase tracking-tight">
                    SEE ALSO
                  </span>
                  <span className="font-display text-5xl md:text-7xl text-[#F2F2F0] uppercase tracking-tight">
                    MORE WORKS
                  </span>
                  <span className="font-display text-5xl md:text-7xl text-[#525252] uppercase tracking-tight">
                    SEE ALSO
                  </span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Project Cards Grid */}
        <div className="px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => {
              const projColor = getCategoryColor(project.category);
              const projGradient = getCategoryGradient(project.category);
              const thumbnail = getProjectThumbnail(project.slug);
              
              return (
                <ProjectCard 
                  key={project.slug}
                  project={project}
                  index={index}
                  projColor={projColor}
                  projGradient={projGradient}
                  thumbnail={thumbnail}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Navigation Bar - Steve Jobs Level Thinking */}
      <section 
        className="border-t border-[#262626] bg-[#0D0D0D]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between py-8">
            {/* Left: Back to All Projects */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/work"
                className="group flex items-center gap-4 text-[#F2F2F0] hover:text-white/70 transition-colors duration-300"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
              >
                <motion.div 
                  className="relative w-10 h-10 rounded-full border border-[#333] flex items-center justify-center overflow-hidden"
                  whileHover={{ borderColor: '#525252' }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowLeft className="w-4 h-4 relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-[#1a1a1a]"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ borderRadius: '50%' }}
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] tracking-widest text-tertiary uppercase">
                    Back to
                  </span>
                  <span className="font-display text-lg tracking-widest uppercase">
                    All Projects
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Center: Randomize Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: isHovered ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Shuffle className="w-4 h-4 text-tertiary" />
              </motion.div>
              <span className="font-mono text-[10px] tracking-widest text-tertiary uppercase">
                Random Selection
              </span>
            </motion.div>

            {/* Right: Next Random Project */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/work/${randomProject.slug}`}
                className="group flex items-center gap-4 text-[#F2F2F0] hover:text-white/70 transition-colors duration-300"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
              >
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[10px] tracking-widest text-tertiary uppercase">
                    Next Project
                  </span>
                  <span 
                    className="font-display text-lg tracking-widest uppercase max-w-[200px] truncate"
                    style={{ color: categoryColor }}
                  >
                    {randomProject.title}
                  </span>
                </div>
                <motion.div 
                  className="relative w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden"
                  style={{ borderColor: `${categoryColor}40` }}
                  whileHover={{ borderColor: categoryColor }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="w-4 h-4 relative z-10" style={{ color: categoryColor }} />
                  <motion.div
                    className="absolute inset-0"
                    style={{ backgroundColor: `${categoryColor}20` }}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Progress Line - Subtle Animation */}
        <motion.div
          className="h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Bottom Info Strip */}
        <div className="px-6 md:px-12 lg:px-20 py-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-widest text-tertiary uppercase">
              {allProjects.length} Projects Available
            </span>
            <span className="font-mono text-[9px] tracking-widest text-tertiary uppercase">
              {randomProject.category} • {randomProject.year}
            </span>
          </div>
        </div>
      </section>
    </footer>
  );
}
