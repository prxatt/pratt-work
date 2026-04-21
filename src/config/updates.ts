// Updates configuration for real-time feed
// This file serves as the source of truth for manual updates
// API-fetched updates are merged with these at runtime

export type UpdateType = 'social' | 'website' | 'venture' | 'announcement';
export type UpdateSource = 'twitter' | 'linkedin' | 'instagram' | 'manual';
export type UpdatePriority = 'high' | 'normal' | 'low';
export type UpdateBadge = 'NEW' | 'LIVE' | 'UPDATED' | 'SHIPPED' | 'BETA';

export interface Update {
  id: string;
  title: string;
  description?: string;
  url?: string;
  date: string; // ISO 8601 format
  type: UpdateType;
  source: UpdateSource;
  badge?: UpdateBadge;
  priority?: UpdatePriority;
  external?: boolean; // Opens in new tab if true
}

// Static updates - manually curated
export const staticUpdates: Update[] = [
  {
    id: 'website-online',
    title: 'pratt.work is now online',
    description: 'Shipped with playful details: cinematic transitions, hidden hover moments, and a menu built like a control panel.',
    url: '/',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: 'website',
    source: 'manual',
    badge: 'NEW',
    priority: 'high',
    external: false,
  },
  {
    id: 'website-easter-egg',
    title: 'Menu update: notification center upgraded',
    description: 'Live Twitter pulse + manual website notes now share one timeline.',
    url: '/',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    type: 'website',
    source: 'manual',
    badge: 'UPDATED',
    priority: 'normal',
    external: false,
  },
  {
    id: 'website-motion-pass',
    title: 'Hero performance pass shipped',
    description: 'Homepage and About hero animation stack tuned for smoother motion and cleaner typography.',
    url: '/about',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    type: 'website',
    source: 'manual',
    badge: 'UPDATED',
    priority: 'normal',
    external: false,
  },
];

// Social profile links for the feed
export const socialProfiles = [
  {
    platform: 'linkedin',
    handle: 'prxatt',
    url: 'https://linkedin.com/in/prxatt',
    displayName: 'LinkedIn',
    color: '#0A66C2',
    status: 'Live feed connected',
  },
  {
    platform: 'twitter',
    handle: 'prxatt',
    url: 'https://twitter.com/prxatt',
    displayName: 'Twitter / X',
    color: '#000000',
    status: 'Live feed connected',
  },
  {
    platform: 'instagram',
    handle: 'pratt.work',
    url: 'https://instagram.com/pratt.work',
    displayName: 'Instagram',
    color: '#E4405F',
    status: 'Latest posts available',
  },
] as const;

// Helper functions
export const getUpdatesByType = (type: UpdateType, updates: Update[] = staticUpdates): Update[] => {
  return updates.filter(u => u.type === type).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getUpdatesBySource = (source: UpdateSource, updates: Update[] = staticUpdates): Update[] => {
  return updates.filter(u => u.source === source).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getPriorityUpdates = (updates: Update[] = staticUpdates): Update[] => {
  return updates.filter(u => u.priority === 'high').sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getLatestUpdates = (count: number = 5, updates: Update[] = staticUpdates): Update[] => {
  return updates
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Merge static updates with API-fetched updates
export const mergeUpdates = (
  staticData: Update[] = staticUpdates, 
  apiData: Update[] = []
): Update[] => {
  // Remove duplicates based on id
  const allUpdates = [...apiData, ...staticData];
  const uniqueUpdates = allUpdates.filter(
    (update, index, self) => index === self.findIndex(u => u.id === update.id)
  );
  
  return uniqueUpdates.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};
