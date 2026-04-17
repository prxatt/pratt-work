// ============================================
// SEARCH WEB WORKER - Off-thread filtering
// For smooth 60fps on mobile while searching
// ============================================

export interface SearchWorkerMessage {
  type: 'search' | 'init';
  query?: string;
  index?: SearchItem[];
}

export interface SearchWorkerResult {
  type: 'results' | 'ready';
  results?: SearchResult[];
}

interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  type: string;
  icon: string;
  keywords: string[];
  category?: string;
  year?: string;
  priority: number;
}

interface SearchResult extends SearchItem {
  score: number;
}

// Search scoring algorithm
function calculateScore(item: SearchItem, searchTerms: string[]): number {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();
  const keywordsLower = item.keywords.map(k => k.toLowerCase());
  
  searchTerms.forEach(term => {
    // Exact title match - highest score
    if (titleLower.includes(term)) score += 10;
    
    // Keyword match - high score
    if (keywordsLower.some(k => k.includes(term))) score += 5;
    
    // Description match - medium score
    if (descLower.includes(term)) score += 3;
    
    // Type match - low score
    if (item.type.toLowerCase().includes(term)) score += 2;
    
    // General text match - lowest score
    const allText = `${titleLower} ${descLower} ${keywordsLower.join(' ')}`;
    if (allText.includes(term)) score += 1;
  });
  
  // Boost by priority
  score += item.priority * 0.5;
  
  return score;
}

// Perform search
function performSearch(index: SearchItem[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (searchTerms.length === 0) return [];
  
  const scoredResults: SearchResult[] = [];
  
  for (const item of index) {
    const score = calculateScore(item, searchTerms);
    if (score > 0) {
      scoredResults.push({ ...item, score });
    }
  }
  
  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);
  
  return scoredResults.slice(0, 10);
}

// Worker message handler
self.onmessage = function(e: MessageEvent<SearchWorkerMessage>) {
  const { type, query, index } = e.data;
  
  if (type === 'init' && index) {
    // Store index in worker scope
    (self as any).searchIndex = index;
    self.postMessage({ type: 'ready' });
  } else if (type === 'search' && query) {
    const searchIndex = (self as any).searchIndex || [];
    const results = performSearch(searchIndex, query);
    self.postMessage({ type: 'results', results });
  }
};

export default {};
