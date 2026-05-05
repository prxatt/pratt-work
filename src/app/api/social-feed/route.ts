import { NextResponse } from 'next/server';
import { Update, staticUpdates } from '@/config/updates';

export const runtime = 'edge';
export const revalidate = 300; // 5 minutes

const ACTIVITY_WINDOW_MS = 72 * 60 * 60 * 1000;

// Twitter/X API fetch (requires Bearer token)
async function fetchTwitterUpdates(): Promise<Update[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    return []; // Return empty if no token configured
  }

  try {
    // Fetch recent tweets from @prxatt (replies excluded).
    const response = await fetch(
      'https://api.twitter.com/2/users/by/username/prxatt/tweets?max_results=12&exclude=replies&tweet.fields=created_at',
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    
    const cutoff = Date.now() - ACTIVITY_WINDOW_MS;
    return (
      data.data
        ?.filter((tweet: any) => new Date(tweet.created_at).getTime() >= cutoff)
        .map((tweet: any) => {
          const text = String(tweet.text || '').trim();
          const isRepost = /^RT\s@/i.test(text);
          return {
            id: `twitter-${tweet.id}`,
            title: text.slice(0, 72) + (text.length > 72 ? '...' : ''),
            description: isRepost ? 'Repost on X' : 'Tweet on X',
            url: `https://twitter.com/prxatt/status/${tweet.id}`,
            date: tweet.created_at,
            type: 'social' as const,
            source: 'twitter' as const,
            badge: 'LIVE' as const,
            priority: 'normal' as const,
            external: true,
          };
        }) || []
    );
  } catch (error) {
    console.error('Twitter fetch failed:', error);
    return [];
  }
}

export async function GET() {
  try {
    // Live activity source: Twitter tweets/reposts from the last 72 hours.
    const twitterUpdates = await fetchTwitterUpdates();
    const apiUpdates: Update[] = twitterUpdates;

    // Update center is treated as live (manual + optional social sources).
    const isRealtime = true;

    // Merge with static updates
    const allUpdates = [...apiUpdates, ...staticUpdates];
    
    // Remove duplicates based on ID
    const uniqueUpdates = allUpdates.filter(
      (update, index, self) => index === self.findIndex(u => u.id === update.id)
    );

    // Sort by date (newest first)
    const sortedUpdates = uniqueUpdates.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      updates: sortedUpdates,
      isRealtime,
      count: sortedUpdates.length,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Social feed API error:', error);
    
    // Return static updates as fallback
    return NextResponse.json({
      updates: staticUpdates,
      isRealtime: false,
      count: staticUpdates.length,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch real-time updates',
    }, {
      status: 200, // Return 200 with fallback data
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
