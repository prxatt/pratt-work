import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Update } from '@/config/updates';

export const runtime = 'nodejs';
export const revalidate = 3600; // 1 hour - filesystem doesn't change often

// Scan directories for new content
async function scanDirectory(dirPath: string, type: 'website' | 'venture'): Promise<Update[]> {
  const updates: Update[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
        // Check for page.tsx or equivalent
        const pagePath = path.join(dirPath, entry.name, 'page.tsx');
        try {
          const stats = await fs.stat(pagePath);
          
          // Create update entry for this page
          const title = entry.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          updates.push({
            id: `${type}-${entry.name}`,
            title: type === 'venture' ? `New venture: ${title}` : `New project: ${title}`,
            description: type === 'venture' 
              ? 'Added to ventures portfolio' 
              : 'Added to work portfolio',
            url: type === 'venture' ? `/ventures#${entry.name}` : `/work/${entry.name}`,
            date: stats.mtime.toISOString(), // Use file modification time
            type,
            source: 'manual',
            badge: 'NEW',
            priority: 'normal',
            external: false,
          });
        } catch {
          // Page doesn't exist, skip
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error);
  }
  
  return updates;
}

// Get recent media additions from public folder
async function scanMediaUpdates(): Promise<Update[]> {
  const updates: Update[] = [];
  
  try {
    // Check work folder for new images
    const workMediaPath = path.join(process.cwd(), 'public', 'work');
    const stats = await fs.stat(workMediaPath).catch(() => null);
    
    if (stats) {
      updates.push({
        id: 'media-work-update',
        title: 'Portfolio media updated',
        description: 'New project imagery added',
        url: '/work',
        date: stats.mtime.toISOString(),
        type: 'website',
        source: 'manual',
        badge: 'UPDATED',
        priority: 'low',
        external: false,
      });
    }
  } catch (error) {
    console.error('Error scanning media:', error);
  }
  
  return updates;
}

export async function GET() {
  try {
    const projectDir = path.join(process.cwd(), 'src', 'app', 'work');
    const venturesDir = path.join(process.cwd(), 'src', 'app', 'ventures');
    
    // Scan for new content
    const [projectUpdates, ventureUpdates, mediaUpdates] = await Promise.all([
      scanDirectory(projectDir, 'website'),
      scanDirectory(venturesDir, 'venture'),
      scanMediaUpdates(),
    ]);
    
    // Combine all updates
    const allUpdates = [...projectUpdates, ...ventureUpdates, ...mediaUpdates];
    
    // Sort by date (newest first) and take top 10
    const sortedUpdates = allUpdates
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    return NextResponse.json({
      updates: sortedUpdates,
      count: sortedUpdates.length,
      timestamp: new Date().toISOString(),
      categories: {
        projects: projectUpdates.length,
        ventures: ventureUpdates.length,
        media: mediaUpdates.length,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Website updates API error:', error);
    
    return NextResponse.json({
      updates: [],
      count: 0,
      timestamp: new Date().toISOString(),
      error: 'Failed to scan website updates',
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
