import { NextRequest, NextResponse } from 'next/server';
import { Update, staticUpdates } from '@/config/updates';

export const runtime = 'edge';
export const revalidate = 300; // 5 minutes

// Twitter/X API fetch (requires Bearer token)
async function fetchTwitterUpdates(): Promise<Update[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    return []; // Return empty if no token configured
  }

  try {
    // Fetch recent tweets from @prxatt
    const response = await fetch(
      'https://api.twitter.com/2/users/by/username/prxatt/tweets?max_results=5&tweet.fields=created_at,public_metrics',
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
    
    return data.data?.map((tweet: any) => ({
      id: `twitter-${tweet.id}`,
      title: tweet.text.slice(0, 60) + (tweet.text.length > 60 ? '...' : ''),
      description: 'Posted on Twitter',
      url: `https://twitter.com/prxatt/status/${tweet.id}`,
      date: tweet.created_at,
      type: 'social',
      source: 'twitter',
      badge: 'LIVE',
      priority: 'normal',
      external: true,
    })) || [];
  } catch (error) {
    console.error('Twitter fetch failed:', error);
    return [];
  }
}

// LinkedIn API fetch (requires OAuth token)
async function fetchLinkedInUpdates(): Promise<Update[]> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  
  if (!accessToken) {
    return []; // Return empty if no token configured
  }

  try {
    // Fetch recent posts from LinkedIn
    // Note: This requires the r_basicprofile and r_organization_social permissions
    const response = await fetch(
      'https://api.linkedin.com/v2/posts?author=urn:li:person:prxatt&q=author&count=5',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.elements?.map((post: any) => ({
      id: `linkedin-${post.id}`,
      title: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text?.slice(0, 60) || 'New LinkedIn post',
      description: 'Posted on LinkedIn',
      url: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareMediaCategory === 'ARTICLE' 
        ? post.specificContent['com.linkedin.ugc.ShareContent'].media?.[0]?.originalUrl 
        : `https://linkedin.com/in/prxatt`,
      date: post.created?.time ? new Date(post.created.time).toISOString() : new Date().toISOString(),
      type: 'social',
      source: 'linkedin',
      badge: 'LIVE',
      priority: 'normal',
      external: true,
    })) || [];
  } catch (error) {
    console.error('LinkedIn fetch failed:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Attempt to fetch from APIs
    const [twitterUpdates, linkedinUpdates] = await Promise.allSettled([
      fetchTwitterUpdates(),
      fetchLinkedInUpdates(),
    ]);

    const apiUpdates: Update[] = [
      ...(twitterUpdates.status === 'fulfilled' ? twitterUpdates.value : []),
      ...(linkedinUpdates.status === 'fulfilled' ? linkedinUpdates.value : []),
    ];

    // Determine if we're using real-time data
    const isRealtime = apiUpdates.length > 0;

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
