// ============================================
// WORK PROJECTS DATA - Shared across components
// ============================================

import { getImageUrl, getVideoUrl } from '@/lib/media';

/** Video cards require an MP4 (or other Safari-friendly) URL alongside WebM. */
export type WorkProjectThumbnail =
  | {
      type: 'image';
      src: string;
      alt: string;
      objectPosition?: string;
    }
  | {
      type: 'video';
      src: string;
      fallback: string;
      alt: string;
      objectPosition?: string;
    };

export interface WorkProject {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string[];
  year: string;
  client: string;
  role: string;
  featured: boolean;
  featuredSize: 'small' | 'medium' | 'large';
  thumbnail: WorkProjectThumbnail;
  heroMedia?: string;
  clientLogos?: string[];
  tags?: string[];
}

export const workProjects: WorkProject[] = [
  {
    id: 'crypt-volumetric',
    slug: 'the-crypt-volumetric',
    title: 'THE CRYPT',
    subtitle: 'Volumetric Video in Spatial Computing | Private Research Initiative',
    description: 'Volumetric video capture and playback system for spatial computing platforms. Private research initiative exploring the future of immersive media.',
    category: ['R&D', 'Volumetric', 'Spatial Computing'],
    year: '2026',
    client: 'Private Research',
    role: 'Creative Technologist',
    featured: true,
    featuredSize: 'large',
    thumbnail: {
      type: 'video',
      src: getVideoUrl('/work/the-crypt-thumb.webm'),
      fallback: getVideoUrl('/work/the-crypt-thumb.mp4'),
      alt: 'The Crypt volumetric capture immersive experience',
    },
    heroMedia: getVideoUrl('/work/the-crypt-hero.webm'),
    tags: ['volumetric', 'video', 'spatial', 'computing', 'research', 'immersive', 'capture', 'playback']
  },
  {
    id: 'weights-biases-connected',
    slug: 'weights-and-biases-fully-connected',
    title: "WEIGHTS & BIASES 'FULLY CONNECTED'",
    subtitle: 'AI CONFERENCE | MLOPS',
    description: 'Production and creative direction for the leading MLOps conference. Stage design, motion graphics, and technical production for AI industry leaders.',
    category: ['AI + TECH', 'Conference', 'Production'],
    year: '2025',
    client: 'Weights & Biases',
    role: 'Producer / Creative Director',
    featured: true,
    featuredSize: 'medium',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/weights-biases-thumb.webp', 800),
      alt: 'Weights & Biases Fully Connected AI conference stage',
    },
    clientLogos: ['/logos/weights-biases.svg'],
    tags: ['ai', 'conference', 'mlops', 'stage design', 'motion graphics', 'technical production']
  },
  {
    id: 'surface-tension-drip',
    slug: 'surface-tension-digital-drip',
    title: 'SURFACE TENSION PRESENTS DIGITAL DRIP',
    subtitle: 'EXPERIENTIAL | IMMERSIVE ART',
    description: 'Immersive art installation combining physical and digital experiences. Interactive environment with generative visuals and spatial audio.',
    category: ['EXPERIENTIAL', 'Art Installation', 'Interactive'],
    year: '2025',
    client: 'Surface Tension',
    role: 'Creative Director',
    featured: true,
    featuredSize: 'medium',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/surface-tension-drip.webp', 800),
      alt: 'Surface Tension Digital Drip immersive art installation',
    },
    tags: ['experiential', 'immersive', 'art', 'installation', 'interactive', 'generative', 'spatial audio']
  },
  {
    id: 'boubyan-bank',
    slug: 'boubyan-bank-hq',
    title: 'THE SHAPE OF FINANCE WITH BOUBYAN BANK',
    subtitle: '3D GENERATIVE EXPERIENCE | EXPERIENTIAL',
    description: '3D previsualization for new Kuwait headquarters. Photorealistic renderings, architectural mockups, lighting designs, and interactive environments.',
    category: ['EXPERIENTIAL', '3D', 'Generative', 'Architecture'],
    year: '2024',
    client: 'Khabari Inc',
    role: 'Producer',
    featured: true,
    featuredSize: 'medium',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/boubyan-bank-thumb.webp', 800),
      alt: 'Boubyan Bank HQ 3D generative architectural visualization',
    },
    heroMedia: getVideoUrl('/work/boubyan-hero.webm'),
    clientLogos: ['/logos/khabari.svg'],
    tags: ['3d', 'previsualization', 'kuwait', 'architectural', 'renderings', 'lighting', 'interactive']
  },
  {
    id: 'salesforce-grant',
    slug: 'salesforce-grant-celebration',
    title: 'SALESFORCE GRANT CELEBRATION & DREAMFORCE ACTIVATION',
    subtitle: 'CORPORATE EVENTS | FUNDRAISER',
    description: 'Large-scale corporate fundraiser and conference activation. Multi-day event production with interactive installations and live broadcast.',
    category: ['CORPORATE EVENTS', 'Fundraiser', 'Conference'],
    year: '2023',
    client: 'Salesforce',
    role: 'Producer',
    featured: false,
    featuredSize: 'small',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/salesforce-thumb.webp', 800),
      alt: 'Salesforce Grant Celebration Dreamforce activation event',
    },
    tags: ['corporate', 'events', 'fundraiser', 'dreamforce', 'conference', 'broadcast']
  },
  {
    id: 'levis-labs',
    slug: 'levis-innovation-labs',
    title: "LEVI'S INNOVATION LABS",
    subtitle: 'IMMERSIVE BRANDED CONTENT | VR 360',
    description: 'VR 360° immersive brand experience showcasing innovation and heritage. Interactive storytelling for retail and digital platforms.',
    category: ['EXPERIENTIAL', 'VR', '360', 'Brand Experience'],
    year: '2023',
    client: "Levi's",
    role: 'Creative Director',
    featured: true,
    featuredSize: 'small',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/levis-thumb.webp', 800),
      alt: "Levi's Innovation Labs VR 360 immersive brand experience",
    },
    tags: ['vr', '360', 'immersive', 'brand', 'experience', 'retail', 'storytelling', 'heritage']
  },
  {
    id: 'pwc-liftoff',
    slug: 'pwc-liftoff-vr360',
    title: 'PWC LIFTOFF ACCELERATORS CONFERENCE IN VR 360',
    subtitle: 'LARGE CONFERENCE | VR 360',
    description: 'VR 360° conference experience for PwC accelerators program. Immersive presentation environment for global startup showcase.',
    category: ['EXPERIENTIAL', 'VR', '360', 'Conference'],
    year: '2023',
    client: 'PwC',
    role: 'Producer',
    featured: false,
    featuredSize: 'small',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/pwc-liftoff-thumb.webp', 800),
      alt: 'PwC Liftoff VR 360 conference immersive experience',
    },
    tags: ['vr', '360', 'conference', 'pwc', 'accelerators', 'startup', 'showcase']
  },
  {
    id: 'stability-ai',
    slug: 'stability-ai',
    title: 'STABILITY AI',
    subtitle: 'BRAND LAUNCH EVENT',
    description: 'Brand launch event for leading generative AI company. Keynote production, visual identity, and immersive presentation design.',
    category: ['AI + TECH', 'Brand Launch', 'Event Production'],
    year: '2022',
    client: 'Stability AI',
    role: 'Producer / Creative Director',
    featured: true,
    featuredSize: 'small',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/stability-ai-thumb.webp', 800),
      alt: 'Stability AI brand launch event presentation',
    },
    tags: ['ai', 'generative', 'brand launch', 'keynote', 'visual identity', 'presentation']
  },
  {
    id: 'women-losers',
    slug: 'women-is-losers',
    title: 'WOMEN IS LOSERS',
    subtitle: 'INDEPENDENT FILM PRODUCTION',
    description: 'Independent feature film production. Full production services from development through post-production and distribution.',
    category: ['FILM + DIGITAL', 'Feature Film', 'Production'],
    year: '2021',
    client: 'Independent',
    role: 'Producer',
    featured: false,
    featuredSize: 'small',
    thumbnail: {
      type: 'image',
      src: getImageUrl('/work/women-is-losers-thumb.webp', 800),
      alt: 'Women Is Losers independent film production still',
      objectPosition: 'center 10%',
    },
    tags: ['film', 'feature', 'production', 'independent', 'post-production', 'distribution']
  },
];

