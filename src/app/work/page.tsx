'use client';

import { motion, AnimatePresence, useInView, useReducedMotion, Variants } from 'framer-motion';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCursor } from '@/context/CursorContext';
import Head from 'next/head';
import { getImageUrl, getVideoUrl } from '@/lib/media';

const projects = [
  {
    slug: 'the-crypt-volumetric',
    title: 'THE CRYPT',
    subtitle: 'Volumetric Video in Spatial Computing | Private Research Initiative',
    category: 'R&D',
    year: '2026',
    thumbnail: {
      type: 'video' as const,
      src: getVideoUrl('/work/the-crypt-thumb.webm'),
      fallback: getVideoUrl('/work/the-crypt-thumb.mp4'),
      alt: 'The Crypt volumetric capture immersive experience',
    },
  },
  {
    slug: 'weights-and-biases-fully-connected',
    title: "WEIGHTS & BIASES 'FULLY CONNECTED'",
    subtitle: 'AI CONFERENCE | MLOPS',
    category: 'AI + TECH',
    year: '2025',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/weights-biases-thumb.webp', 1200),
      fallback: getImageUrl('/work/weights-biases-thumb.jpeg', 1200, { format: 'jpg' }),
      alt: 'Weights & Biases Fully Connected AI conference stage',
    },
  },
  {
    slug: 'surface-tension-digital-drip',
    title: 'SURFACE TENSION PRESENTS DIGITAL DRIP',
    subtitle: 'EXPERIENTIAL | IMMERSIVE ART',
    category: 'EXPERIENTIAL',
    year: '2025',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/surface-tension-drip.webp', 1200),
      fallback: getImageUrl('/work/surface-tension-drip.jpg', 1200),
      alt: 'Surface Tension Digital Drip immersive art installation',
    },
  },
  {
    slug: 'boubyan-bank-hq',
    title: 'THE SHAPE OF FINANCE WITH BOUBYAN BANK',
    subtitle: '3D GENERATIVE EXPERIENCE | EXPERIENTIAL',
    category: 'EXPERIENTIAL',
    year: '2024',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/boubyan-bank-thumb.webp', 1200),
      fallback: getImageUrl('/work/boubyan-bank-thumb.jpg', 1200),
      alt: 'Boubyan Bank HQ 3D generative architectural visualization',
    },
  },
  {
    slug: 'salesforce-grant-celebration',
    title: 'SALESFORCE GRANT CELEBRATION & DREAMFORCE ACTIVATION',
    subtitle: 'CORPORATE EVENTS | FUNDRAISER',
    category: 'CORPORATE EVENTS',
    year: '2023',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/salesforce-thumb.webp', 1200),
      fallback: getImageUrl('/work/salesforce-thumb.jpeg', 1200),
      alt: 'Salesforce Grant Celebration Dreamforce activation event',
    },
  },
  {
    slug: 'levis-innovation-labs',
    title: "LEVI'S INNOVATION LABS",
    subtitle: 'IMMERSIVE BRANDED CONTENT | VR 360',
    category: 'EXPERIENTIAL',
    year: '2023',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/levis-thumb.webp', 1200),
      fallback: getImageUrl('/work/levis-thumb.jpg', 1200),
      alt: "Levi's Innovation Labs VR 360 immersive brand experience",
    },
  },
  {
    slug: 'pwc-liftoff-vr360',
    title: 'PWC LIFTOFF ACCELERATORS CONFERENCE IN VR 360',
    subtitle: 'LARGE CONFERENCE | VR 360',
    category: 'EXPERIENTIAL',
    year: '2023',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/pwc-liftoff-thumb.webp', 1200),
      fallback: getImageUrl('/work/pwc-liftoff-thumb.jpg', 1200),
      alt: 'PwC Liftoff VR 360 conference immersive experience',
    },
  },
  {
    slug: 'stability-ai',
    title: 'STABILITY AI',
    subtitle: 'BRAND LAUNCH EVENT',
    category: 'AI + TECH',
    year: '2022',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/stability-ai-thumb.webp', 1200),
      fallback: getImageUrl('/work/stability-ai-thumb.jpg', 1200),
      alt: 'Stability AI brand launch event presentation',
    },
  },
  {
    slug: 'women-is-losers',
    title: 'WOMEN IS LOSERS',
    subtitle: 'INDEPENDENT FILM PRODUCTION',
    category: 'FILM + DIGITAL',
    year: '2021',
    thumbnail: {
      type: 'image' as const,
      src: getImageUrl('/work/women-is-losers-thumb.webp', 1200),
      fallback: getImageUrl('/work/women-is-losers-thumb.jpeg', 1200),
      alt: 'Women Is Losers independent film production still',
      objectPosition: 'center 10%',
    },
  },
];

const getCategoryColor = (category: string) => {
  const u = category.toUpperCase();
  if (u.includes('EXPERIENTIAL')) return '#22C55E';
  if (u.includes('AI') || u.includes('TECH')) return '#3B82F6';
  if (u.includes('FILM')) return '#F59E0B';
  if (u.includes('R&D')) return '#A855F7';
  if (u.includes('CORPORATE')) return '#EC4899';
  return '#8A8A85';
};

// Cohesive animation variants following site-wide aggressive easing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const filterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardImageVariants: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
};

// Magnetic hover effect hook
function useMagneticHover<T extends HTMLElement>(strength: number = 0.3) {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    setPosition({ x, y });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return { ref, position, handleMouseMove, handleMouseLeave };
}

const VideoThumbnail = ({ src, fallback, alt }: { src: string; fallback: string; alt: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const handleCanPlay = () => {
      setIsReady(true);
      video.play().catch(() => {});
    };

    const handleLoadedData = () => {
      setIsReady(true);
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    setIsReady(true);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover gpu-accelerated"
      style={{ 
        opacity: isReady ? 1 : 0,
        transform: 'translateZ(0)',
      }}
      aria-label={alt}
    >
      <source src={src} type="video/webm" />
      <source src={fallback} type="video/mp4" />
    </video>
  );
};

const ImageThumbnail = ({ src, alt, priority, objectPosition, isHovered }: { src: string; alt: string; priority: boolean; objectPosition?: string; isHovered?: boolean }) => (
  <motion.div
    className="absolute inset-0 gpu-accelerated"
    initial={false}
    animate={{ scale: isHovered ? 1.05 : 1 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      quality={85}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      className="object-cover"
      style={objectPosition ? { objectPosition } : undefined}
    />
  </motion.div>
);

// Category filter button with microanimation
function CategoryButton({ 
  category, 
  isActive, 
  color, 
  onClick 
}: { 
  category: string; 
  isActive: boolean; 
  color: string; 
  onClick: () => void;
}) {
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const { ref, position, handleMouseMove, handleMouseLeave } = useMagneticHover<HTMLButtonElement>(0.15);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); setCursorState('hover'); }}
      onMouseLeave={() => { setIsHovered(false); setCursorState('default'); handleMouseLeave(); }}
      onMouseMove={handleMouseMove}
      variants={filterVariants}
      className="relative font-mono text-xs tracking-[0.2em] uppercase px-4 py-2 rounded-full border transition-colors duration-300 min-h-[44px] touch-manipulation gpu-accelerated"
      style={{
        backgroundColor: isActive ? color : 'transparent',
        borderColor: isActive ? color : `${color}50`,
        color: isActive ? '#fff' : `${color}90`,
        transform: prefersReducedMotion ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        boxShadow: isActive ? `0 0 20px ${color}30` : 'none',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Active pulse ring */}
      {isActive && !prefersReducedMotion && (
        <motion.span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ borderColor: color, borderWidth: '1px' }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {category}
    </motion.button>
  );
}

// Project card with cohesive microanimations
function ProjectCard({ 
  project, 
  index, 
  isHovered, 
  onHover, 
  onLeave,
  totalFiltered 
}: { 
  project: typeof projects[0]; 
  index: number; 
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  totalFiltered: number;
}) {
  const { setCursorState } = useCursor();
  const color = getCategoryColor(project.category);
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="content-visibility-auto contain-layout"
    >
      <Link
        href={`/work/${project.slug}`}
        className="group block gpu-accelerated"
        onMouseEnter={() => { onHover(); setCursorState('hover'); }}
        onMouseLeave={() => { onLeave(); setCursorState('default'); }}
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] bg-[#141414] overflow-hidden mb-4 rounded-sm gpu-accelerated">
          {project.thumbnail.type === 'video' ? (
            <VideoThumbnail src={project.thumbnail.src} fallback={project.thumbnail.fallback} alt={project.thumbnail.alt} />
          ) : (
            <ImageThumbnail 
              src={project.thumbnail.src} 
              alt={project.thumbnail.alt} 
              priority={index < 4} 
              objectPosition={'objectPosition' in project.thumbnail ? project.thumbnail.objectPosition : undefined}
              isHovered={isHovered}
            />
          )}
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-[1]" />
          
          {/* Category badge */}
          <motion.div 
            className="absolute top-4 left-4 flex items-center gap-2 z-10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
          >
            <motion.div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: isHovered ? 1.3 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/80">{project.category}</span>
          </motion.div>
          
          {/* Year badge */}
          <motion.div 
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
          >
            <span className="font-mono text-xs text-white/60">{project.year}</span>
          </motion.div>
          
          {/* Hover gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-[2]"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Hover arrow */}
          <motion.div 
            className="absolute bottom-4 right-4 z-10"
            initial={false}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -8,
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          {/* Corner accent on hover */}
          <motion.div
            className="absolute top-0 left-0 w-16 h-[2px] z-10"
            style={{ backgroundColor: color, originX: 0 }}
            initial={false}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute top-0 left-0 w-[2px] h-16 z-10"
            style={{ backgroundColor: color, originY: 0 }}
            initial={false}
            animate={{ scaleY: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Title and Subtitle - FIXED: No mid-word cutoff */}
        <div className="space-y-2 min-w-0">
          <h3 className="font-display text-xl sm:text-2xl md:text-[1.75rem] text-primary uppercase tracking-tight leading-[1.15] transition-colors duration-300 break-words hyphens-auto">
            {project.title}
          </h3>
          <p className="font-mono text-xs tracking-[0.12em] text-tertiary uppercase break-words">
            {project.subtitle}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function WorkPage() {
  const { setCursorState } = useCursor();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const gridRef = useRef(null);
  
  const headerInView = useInView(headerRef, { once: true, margin: '-100px' });
  const filtersInView = useInView(filtersRef, { once: true, margin: '-50px' });
  const gridInView = useInView(gridRef, { once: true, margin: '-100px' });
  
  // Preload critical above-the-fold images
  const criticalImages = projects
    .filter((p) => p.thumbnail.type === 'image')
    .slice(0, 5)
    .map((p) => p.thumbnail.src);

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return ['ALL', ...Array.from(cats)];
  }, []);

  const filteredProjects = useMemo(
    () => (selectedCategory === 'ALL' ? projects : projects.filter((p) => p.category === selectedCategory)),
    [selectedCategory]
  );

  return (
    <>
      <Head>
        {criticalImages.map((src, i) => (
          <link key={i} rel="preload" as="image" href={src} type="image/webp" />
        ))}
      </Head>
      <main className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
        {/* Hero Section */}
        <section ref={headerRef} className="px-6 md:px-12 lg:px-20 pt-32 pb-16">
          <motion.div 
            initial={prefersReducedMotion ? 'visible' : 'hidden'}
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="flex items-center gap-4 mb-8"
              variants={itemVariants}
            >
              <motion.div 
                className="h-[1px] bg-primary"
                initial={{ scaleX: 0, width: 64 }}
                animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ originX: 0 }}
              />
              <motion.span 
                className="font-mono text-[10px] tracking-[0.4em] text-tertiary uppercase"
                variants={itemVariants}
              >
                Portfolio
              </motion.span>
            </motion.div>
            <motion.h1 
              className="font-display text-[clamp(2.5rem,10vw,8rem)] text-primary uppercase leading-[0.85] tracking-tight mb-8"
              variants={itemVariants}
            >
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Selected
              </motion.span>
              <motion.span 
                className="text-secondary block"
                initial={{ opacity: 0, y: 30 }}
                animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                Work
              </motion.span>
            </motion.h1>
            <motion.p 
              className="font-sans text-lg text-secondary max-w-2xl leading-relaxed"
              variants={itemVariants}
            >
              A curated collection of experiential productions, brand activations, and creative technology projects.
            </motion.p>
          </motion.div>
        </section>

      {/* Category Filters - with staggered microanimation */}
      <section ref={filtersRef} className="px-6 md:px-12 lg:px-20 pb-8">
        <motion.div 
          className="flex flex-wrap gap-3 sm:gap-4"
          initial="hidden"
          animate={filtersInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {categories.map((category) => {
            const color = getCategoryColor(category);
            const isActive = selectedCategory === category;
            return (
              <CategoryButton
                key={category}
                category={category}
                isActive={isActive}
                color={color}
                onClick={() => setSelectedCategory(isActive ? 'ALL' : category)}
              />
            );
          })}
        </motion.div>
        
        {/* Filter count indicator */}
        <motion.div 
          className="mt-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={filtersInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.div 
            className="h-[1px] bg-tertiary/30 flex-1"
            initial={{ scaleX: 0 }}
            animate={filtersInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />
          <span className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase shrink-0">
            {filteredProjects.length} Projects
          </span>
          <motion.div 
            className="h-[1px] bg-tertiary/30 w-12"
            initial={{ scaleX: 0 }}
            animate={filtersInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />
        </motion.div>
      </section>

      {/* Projects Grid - with cohesive microanimations */}
      <section ref={gridRef} className="px-6 md:px-12 lg:px-20 pb-32">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          layout
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                isHovered={hoveredIndex === index}
                onHover={() => setHoveredIndex(index)}
                onLeave={() => setHoveredIndex(null)}
                totalFiltered={filteredProjects.length}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mono text-sm text-tertiary uppercase tracking-widest">
              No projects found in this category
            </p>
          </motion.div>
        )}
      </section>
      </main>
    </>
  );
}
