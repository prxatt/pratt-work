// ============================================
// SMART SEARCH INDEX - Steve Jobs Level
// Auto-updating, keyword-extracting, performance-optimized
// ============================================

import { workProjects, WorkProject } from '@/data/workProjects';

export type SearchResultType = 'page' | 'section' | 'work' | 'blog' | 'ventures' | 'media';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  type: SearchResultType;
  icon: string;
  keywords: string[];
  category?: string;
  year?: string;
  priority: number;
  lastModified?: number;
}

// Static pages and sections
const staticPages: SearchResult[] = [
  // Core Pages
  { id: 'home', title: 'Home', description: 'Portfolio homepage with featured work', href: '/', type: 'page', icon: 'Layout', keywords: ['home', 'portfolio', 'pratt', 'main', 'landing', 'start'], priority: 10 },
  { id: 'work', title: 'Work', description: 'Case studies and creative projects', href: '/work', type: 'page', icon: 'Briefcase', keywords: ['work', 'projects', 'case studies', 'portfolio', 'creative', 'production'], priority: 10 },
  { id: 'ventures', title: 'Ventures', description: 'Startup investments and product ventures', href: '/ventures', type: 'page', icon: 'FlaskConical', keywords: ['ventures', 'startups', 'investments', 'soen', 'culturepulse', 'surface tension'], priority: 9 },
  { id: 'about', title: 'About', description: 'Background, story, and experience', href: '/about', type: 'page', icon: 'User', keywords: ['about', 'pratt majmudar', 'background', 'story', 'bio', 'experience'], priority: 9 },
  { id: 'blog', title: 'Blog', description: 'Articles, insights, and thoughts', href: '/blog', type: 'page', icon: 'Newspaper', keywords: ['blog', 'articles', 'insights', 'writing', 'thoughts', 'ideas'], priority: 8 },
  { id: 'playground', title: 'Playground', description: 'Experiments and creative prototypes', href: '/playground', type: 'page', icon: 'Sparkles', keywords: ['playground', 'experiments', 'prototypes', 'creative', 'fun'], priority: 7 },
  { id: 'contact', title: 'Contact', description: 'Get in touch for projects', href: '/contact', type: 'page', icon: 'Mail', keywords: ['contact', 'email', 'reach out', 'hire', 'collaborate', 'connect'], priority: 9 },
  
  // Sections - About
  { id: 'about-story', title: 'My Story', description: 'About page - Personal journey and background', href: '/about#story', type: 'section', icon: 'FileText', keywords: ['story', 'journey', 'background', 'history', 'path'], priority: 6 },
  { id: 'about-values', title: 'Core Values', description: 'About page - Principles and values', href: '/about#values', type: 'section', icon: 'FileText', keywords: ['values', 'principles', 'philosophy', 'beliefs', 'ethics'], priority: 6 },
  { id: 'about-experience', title: 'Experience', description: 'About page - Professional background', href: '/about#experience', type: 'section', icon: 'FileText', keywords: ['experience', 'career', 'background', 'skills', 'expertise'], priority: 6 },
  
  // Sections - Work
  { id: 'work-case-studies', title: 'Case Studies', description: 'Work page - Featured project case studies', href: '/work#case-studies', type: 'section', icon: 'FileText', keywords: ['case studies', 'projects', 'portfolio', 'work samples'], priority: 7 },
  { id: 'work-categories', title: 'Categories', description: 'Work page - Browse by category', href: '/work#categories', type: 'section', icon: 'Filter', keywords: ['categories', 'filter', 'sort', 'browse', 'organization'], priority: 6 },
  
  // Sections - Ventures
  { id: 'ventures-parent', title: 'Surface Tension', description: 'Ventures page - Parent company', href: '/ventures#surface-tension', type: 'ventures', icon: 'Building2', keywords: ['surface tension', 'parent company', 'experiential', 'production'], priority: 8 },
  { id: 'ventures-soen', title: 'SOEN', description: 'AI productivity platform - Coming 2026', href: '/ventures#soen', type: 'ventures', icon: 'Brain', keywords: ['soen', 'ai', 'productivity', 'artificial intelligence', 'workflow', 'automation'], priority: 8 },
  { id: 'ventures-culturepulse', title: 'CulturePulse', description: 'Enterprise intelligence platform', href: '/ventures#culturepulse', type: 'ventures', icon: 'Activity', keywords: ['culturepulse', 'enterprise', 'intelligence', 'data', 'analytics'], priority: 8 },
  
  // Sections - Blog
  { id: 'blog-latest', title: 'Latest Articles', description: 'Blog page - Recent posts', href: '/blog#latest', type: 'section', icon: 'FileText', keywords: ['latest', 'recent', 'new', 'articles', 'posts'], priority: 6 },
  { id: 'blog-categories', title: 'Topics', description: 'Blog page - Browse by topic', href: '/blog#topics', type: 'section', icon: 'Tags', keywords: ['topics', 'categories', 'tags', 'subjects', 'themes'], priority: 6 },
  
  // Media Types
  { id: 'media-3d', title: '3D & Volumetric', description: '3D experiences and volumetric projects', href: '/work?category=3D', type: 'media', icon: 'Box', keywords: ['3d', 'volumetric', 'three dimensional', 'spatial', 'depth'], priority: 7 },
  { id: 'media-vr', title: 'VR & 360°', description: 'Virtual reality and immersive 360 content', href: '/work?category=VR', type: 'media', icon: 'Glasses', keywords: ['vr', 'virtual reality', '360', 'immersive', 'headset'], priority: 7 },
  { id: 'media-film', title: 'Film & Video', description: 'Cinematic and video production work', href: '/work?category=Film', type: 'media', icon: 'Film', keywords: ['film', 'video', 'cinema', 'movie', 'production'], priority: 7 },
  { id: 'media-experiential', title: 'Experiential', description: 'Physical and digital experiential projects', href: '/work?category=Experiential', type: 'media', icon: 'Zap', keywords: ['experiential', 'events', 'installation', 'interactive', 'physical'], priority: 7 },
  { id: 'media-generative', title: 'Generative AI', description: 'AI-generated and generative content', href: '/work?category=Generative', type: 'media', icon: 'Bot', keywords: ['generative', 'ai', 'artificial intelligence', 'generated', 'machine learning'], priority: 7 },
];

// Extract keywords from text content
function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();
  
  // Common tech/production terms to prioritize
  const techTerms = [
    '3d', 'vr', 'ar', 'ai', 'generative', 'volumetric', 'experiential',
    'production', 'creative', 'technology', 'innovation', 'design',
    'film', 'video', 'brand', 'strategy', 'consulting', 'development',
    'interactive', 'immersive', 'digital', 'physical', 'spatial',
    'visualization', 'rendering', 'animation', 'motion', 'graphics',
    'webgl', 'three.js', 'unity', 'unreal', 'web', 'app', 'platform',
    'kuwait', 'san francisco', 'los angeles', 'global', 'international',
    'enterprise', 'startup', 'scale', 'growth', 'transformation'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Extract tech terms
  techTerms.forEach(term => {
    if (lowerText.includes(term)) keywords.add(term);
  });
  
  // Extract capitalized terms (proper nouns, brands)
  const words = text.match(/\b[A-Z][a-zA-Z]{2,}\b/g) || [];
  words.forEach(word => {
    if (word.length > 2 && !['The', 'And', 'For', 'With'].includes(word)) {
      keywords.add(word.toLowerCase());
    }
  });
  
  return Array.from(keywords).slice(0, 20);
}

// Generate search results from work projects
function generateWorkResults(): SearchResult[] {
  return workProjects.map((project: WorkProject) => {
    const keywords = [
      ...project.category.map((c: string) => c.toLowerCase()),
      project.client.toLowerCase(),
      project.year,
      ...(project.tags || []),
      ...extractKeywords(project.description),
      ...extractKeywords(project.title)
    ];
    
    return {
      id: `work-${project.id}`,
      title: project.title,
      description: project.description,
      href: `/work/${project.slug}`,
      type: 'work',
      icon: 'Briefcase',
      keywords: [...new Set(keywords)],
      category: project.category[0],
      year: project.year,
      priority: project.featured ? 9 : 7
    };
  });
}

// Blog posts data (manual for now - can be made dynamic)
const blogPosts = [
  {
    id: 'building-soen',
    title: 'Building SOEN',
    subtitle: 'Behind the scenes of creating an AI-native productivity platform',
    category: 'BUILD',
    date: '2026',
    keywords: ['soen', 'ai', 'productivity', 'platform', 'build', 'development', 'architecture', 'intention']
  },
  {
    id: 'production-at-scale',
    title: 'Production at Scale',
    subtitle: 'Lessons from delivering experiential projects for global brands',
    category: 'PROCESS',
    date: '2026',
    keywords: ['production', 'scale', 'experiential', 'brands', 'global', 'process', 'delivery', 'management']
  },
  {
    id: 'future-creative-tech',
    title: 'The Future of Creative Tech',
    subtitle: 'Where AI, spatial computing, and human creativity converge',
    category: 'THOUGHTS',
    date: '2026',
    keywords: ['creative tech', 'ai', 'spatial computing', 'future', 'creativity', 'technology', 'innovation']
  }
];

// Generate search results from blog posts
function generateBlogResults(): SearchResult[] {
  return blogPosts.map(post => ({
    id: `blog-${post.id}`,
    title: post.title,
    description: post.subtitle,
    href: `/blog/${post.id}`,
    type: 'blog',
    icon: 'Newspaper',
    keywords: [...post.keywords, post.category.toLowerCase(), post.date],
    category: post.category,
    year: post.date,
    priority: 7
  }));
}

// Cache management
let searchCache: SearchResult[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Build complete search index
export function buildSearchIndex(): SearchResult[] {
  const now = Date.now();
  
  // Return cached version if fresh
  if (searchCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return searchCache;
  }
  
  // Build fresh index
  const workResults = generateWorkResults();
  const blogResults = generateBlogResults();
  
  const index = [
    ...staticPages,
    ...workResults,
    ...blogResults
  ].sort((a, b) => b.priority - a.priority);
  
  // Update cache
  searchCache = index;
  cacheTimestamp = now;
  
  return index;
}

// Force refresh index
export function refreshSearchIndex(): SearchResult[] {
  searchCache = null;
  return buildSearchIndex();
}

// Search function with scoring
export function searchIndex(query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const index = buildSearchIndex();
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  if (searchTerms.length === 0) return [];
  
  // Score and filter results
  const scoredResults = index.map(item => {
    let score = 0;
    const searchableText = `${item.title} ${item.description} ${item.keywords.join(' ')} ${item.type}`.toLowerCase();
    
    searchTerms.forEach(term => {
      // Exact title match - highest score
      if (item.title.toLowerCase().includes(term)) score += 10;
      
      // Keyword match - high score
      if (item.keywords.some(k => k.includes(term))) score += 5;
      
      // Description match - medium score
      if (item.description.toLowerCase().includes(term)) score += 3;
      
      // Type match - low score
      if (item.type.toLowerCase().includes(term)) score += 2;
      
      // General text match - lowest score
      if (searchableText.includes(term)) score += 1;
    });
    
    // Boost by priority
    score += item.priority * 0.5;
    
    return { item, score };
  }).filter(({ score }) => score > 0);
  
  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);
  
  return scoredResults.map(({ item }) => item).slice(0, 10);
}

// Get all keywords for autocomplete
export function getAllKeywords(): string[] {
  const index = buildSearchIndex();
  const allKeywords = new Set<string>();
  
  index.forEach(item => {
    item.keywords.forEach(k => allKeywords.add(k));
    allKeywords.add(item.title.toLowerCase());
    allKeywords.add(item.type.toLowerCase());
  });
  
  return Array.from(allKeywords).sort();
}
