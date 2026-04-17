# Cloudinary Media Setup Guide

## Quick Start (5 minutes)

### Step 1: Sign up for Cloudinary (Free)
1. Go to https://cloudinary.com/users/register/free
2. Sign up with GitHub or email
3. Note your **Cloud Name** (e.g., `prxatt`)
4. Get your **API Key** and **API Secret** from Dashboard → Settings → API Keys

### Step 2: Configure Environment Variable
```bash
# Add to your shell profile (.zshrc or .bash_profile)
export NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# Or create .env.local in project root
echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name" > .env.local
```

### Step 3: Upload Media
**Option A: Drag & Drop (Easiest)**
1. Go to https://console.cloudinary.com/console/c-geo
2. Click "Media Library"
3. Create folders: `images/` and `videos/`
4. Drag files from `public/work/` into respective folders

**Option B: Command Line**
```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Configure
cloudinary config cloud_name=your-cloud-name api_key=YOUR_KEY api_secret=YOUR_SECRET

# Upload
cloudinary upload_dir public/work
```

### Step 4: Update Media References
Find and replace in your components:

**Before:**
```tsx
<Image src="/work/boubyan-thumb.webp" ... />
<video src="/work/boubyan-video.mp4" ... />
```

**After:**
```tsx
import { getImageUrl, getVideoUrl } from '@/lib/media';

<Image src={getImageUrl('/work/boubyan-thumb.webp', 800)} ... />
<video src={getVideoUrl('/work/boubyan-video.mp4')} ... />
```

Or use direct Cloudinary URLs:
```tsx
<Image 
  src="https://res.cloudinary.com/your-cloud/image/upload/images/boubyan-thumb.webp"
  ... 
/>
```

## Benefits

| Metric | Before (Git) | After (Cloudinary) |
|--------|-------------|-------------------|
| Git Push | 30+ min (fails) | 10 seconds |
| Vercel Build | 5+ min | 1 min |
| Image Delivery | Unoptimized | Auto WebP/AVIF |
| Global CDN | Vercel only | 300+ edge locations |
| Responsive Images | Manual | Automatic |

## Troubleshooting

**Images not loading?**
- Check `next.config.ts` has Cloudinary in `remotePatterns`
- Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set

**Build failing?**
```bash
rm -rf .next
npm run build
```

## Complete Migration

Once you've verified Cloudinary works:

```bash
# Remove local media from Git tracking
git rm -r --cached public/work/*.mp4 public/work/*.webm
git commit -m "Move large media to Cloudinary"

# Keep small images in repo for backup
git add public/work/*.webp public/work/*.jpg
git commit -m "Keep optimized images in repo"
```

## Advanced: Auto-Optimization

Cloudinary automatically:
- Converts to WebP/AVIF (smaller than JPEG/PNG)
- Resizes for device viewport
- Compresses with quality: auto
- Delivers from nearest edge server

No code changes needed - just change the URL!
