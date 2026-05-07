import { NextResponse } from 'next/server';
import { staticUpdates, type Update } from '@/config/updates';

export const runtime = 'nodejs';
export const revalidate = 3600; // 1 hour - filesystem doesn't change often

export async function GET() {
  try {
    // Important: keep this endpoint lightweight for Vercel bundle limits.
    // The old implementation scanned the filesystem, which caused Vercel to package huge assets.
    // We intentionally serve only the curated updates here.
    const sortedUpdates: Update[] = [...staticUpdates]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    return NextResponse.json({
      updates: sortedUpdates,
      count: sortedUpdates.length,
      timestamp: new Date().toISOString(),
      categories: {
        projects: 0,
        ventures: 0,
        media: 0,
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
