# Cloudinary Media Setup Guide (Non-Technical Developer Version)

## Your Cloudinary Account Details
- **Cloud Name**: `dj0n7b4ma`
- **API Key**: `622435791171169`
- **API Secret**: `N6V2_7By1QGFYzUQ00m8EYxPFmU`

---

## Step 1: Configure Environment Variable (Simple)

**What this does**: Tells your website where to find images and videos on Cloudinary instead of your computer.

**Action**: Open your terminal and run this exact command:

```bash
cd /Users/prattmajmudar/Desktop/pratt.work
echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dj0n7b4ma" > .env.local
```

That's it! You just created a file called `.env.local` with your cloud name in it.

---

## Step 2: Upload Your Media to Cloudinary

### Understanding Your Folders
You have media files in several folders on your computer:
- `public/work/` - Project images and videos
- `public/recognition/` - Recognition/award images
- `public/ventures/` - Ventures page media
- `public/videos/` - General videos

### Which Format to Upload? (Important!)

**Upload ONLY ONE format per file**. Cloudinary will automatically create all other formats for you.

**Images**:
- Upload the **WebP** version if you have it (smallest file size)
- If no WebP, upload **JPEG** or **PNG**
- **Don't upload both** - Cloudinary creates WebP automatically

**Videos**:
- Upload **MP4** only (best compatibility)
- **Don't upload WebM** - Cloudinary can serve WebM automatically if needed

### Recommended Folder Structure in Cloudinary

Create these folders in Cloudinary to match your local structure:

```
Media Library
├── work/
│   ├── images/
│   └── videos/
├── recognition/
│   └── images/
├── ventures/
│   ├── images/
│   └── videos/
└── videos/
    └── (upload directly here)
```

**Why organize this way?** It makes it easier to find and replace URLs in your code later.

### How to Upload (Drag & Drop Method - Easiest)

1. Go to https://console.cloudinary.com/console/c-geo
2. Click "Media Library" on the left
3. Click "+ New Folder" and create folders as shown above
4. Open each folder
5. Drag files from your computer into the matching Cloudinary folder:
   - Files from `public/work/images/` → Cloudinary `work/images/`
   - Files from `public/work/videos/` → Cloudinary `work/videos/`
   - Files from `public/recognition/` → Cloudinary `recognition/images/`

**Keep the same filenames!** If your local file is named `boubyan-thumb.webp`, name it exactly the same in Cloudinary.

---

## Step 3: Update Your Website Code to Use Cloudinary URLs

**Before** (using local files):
```tsx
<Image src="/work/boubyan-thumb.webp" ... />
<video src="/work/boubyan-video.mp4" ... />
```

**After** (using Cloudinary):

**Option A: Use the Helper Function (Easier)**
```tsx
import { getImageUrl, getVideoUrl } from '@/lib/media';

// For images
<Image src={getImageUrl('/work/boubyan-thumb.webp', 800)} ... />

// For videos
<video src={getVideoUrl('/work/boubyan-video.mp4')} ... />
```

**Option B: Use Direct Cloudinary URLs**
```tsx
// Image URL format:
https://res.cloudinary.com/dj0n7b4ma/image/upload/work/images/boubyan-thumb.webp

// Video URL format:
https://res.cloudinary.com/dj0n7b4ma/video/upload/work/videos/boubyan-video.mp4
```

### URL Format Cheat Sheet

| Local Path | Cloudinary URL |
|------------|----------------|
| `/work/boubyan-thumb.webp` | `https://res.cloudinary.com/dj0n7b4ma/image/upload/work/images/boubyan-thumb.webp` |
| `/recognition/award.jpg` | `https://res.cloudinary.com/dj0n7b4ma/image/upload/recognition/images/award.jpg` |
| `/ventures/hero.mp4` | `https://res.cloudinary.com/dj0n7b4ma/video/upload/ventures/videos/hero.mp4` |
| `/videos/reel.mp4` | `https://res.cloudinary.com/dj0n7b4ma/video/upload/videos/reel.mp4` |

**Pattern**: `https://res.cloudinary.com/dj0n7b4ma/[image or video]/upload/[folder path]/[filename]`

---

## What Cloudinary Does Automatically

Once uploaded, Cloudinary automatically:
- ✓ Converts JPEG/PNG to WebP/AVIF (60% smaller files)
- ✓ Delivers from 300+ global servers (faster loading)
- ✓ Resizes images for mobile vs desktop (optimal sizes)
- ✓ Compresses with best quality settings

**You upload ONE format, Cloudinary serves the BEST format.**

---

## Troubleshooting

**Images not loading?**
1. Check the URL is correct (use the format above)
2. Make sure file is uploaded to Cloudinary Media Library
3. Verify `.env.local` has your cloud name

**Not sure if Cloudinary is working?**
Paste this in your browser:
```
https://res.cloudinary.com/dj0n7b4ma/image/upload/work/images/[your-filename]
```
If you see your image, it's working!

---

## Quick Reference

**Your Cloudinary Dashboard**: https://console.cloudinary.com/console/c-geo
**Media Library**: https://console.cloudinary.com/console/media_library
**Base URL for Images**: `https://res.cloudinary.com/dj0n7b4ma/image/upload/`
**Base URL for Videos**: `https://res.cloudinary.com/dj0n7b4ma/video/upload/`
