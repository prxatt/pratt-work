# Recognition Section - Media Assets Guide

## Where to Add Poster Images and Video Trailers

### Location
Add all media files to:
```
/public/recognition/
```

---

## Poster Images

### 1. ALONE (Short Film - 2024)
**File:**
- Path: `/public/recognition/alone-poster.jpg`
- Format: JPG or WebP (recommended)
- Dimensions: Portrait ratio (2:3), minimum 800x1200px
- Style: Film poster aesthetic, cinematic, dark/moody tone

**Integration Point:**
In `RecognitionSection.tsx` - AloneModal component:
- Currently has placeholder div at line ~137 (Portrait Poster Frame)
- Replace the gradient placeholder with the actual poster image

**Current Code Location:**
```tsx
{/* Portrait Poster Frame - Replace with actual image */}
<motion.div className="w-32 h-48 md:w-44 md:h-64 lg:w-52 lg:h-80...">
  {/* Current: gradient placeholder */}
  {/* Add: <Image src="/recognition/alone-poster.jpg" ... /> */}
</motion.div>
```

---

### 2. WOMEN IS LOSERS (SXSW - 2021)
**File:**
- Path: `/public/recognition/women-is-losers-poster.jpg`
- Format: JPG or WebP
- Dimensions: Portrait ratio (2:3), minimum 800x1200px
- Style: 1960s San Francisco period aesthetic, warm amber/gold tones

**Integration Point:**
In `RecognitionSection.tsx` - WomenIsLosersModal component:
- Currently has SXSW badge placeholder at line ~388
- Replace with actual film poster

**Current Code Location:**
```tsx
{/* SXSW Official Selection Badge - Replace with poster */}
<motion.div className="w-32 h-48 md:w-44 md:h-64 lg:w-52 lg:h-80...">
  {/* Current: SXSW badge design */}
  {/* Add: <Image src="/recognition/women-is-losers-poster.jpg" ... /> */}
</motion.div>
```

---

### 3. SYNCHRONICITY (Documentary - 2021)
**File:**
- Path: `/public/recognition/synchronicity-poster.jpg`
- Format: JPG or WebP
- Dimensions: Portrait ratio (2:3), minimum 800x1200px
- Style: Musical documentary aesthetic, purple/indigo tones, artistic

**Integration Point:**
In `RecognitionSection.tsx` - SynchronicityDocumentaryModal component:
- Currently has waveform visualization placeholder at line ~1059
- Replace with actual documentary poster

**Current Code Location:**
```tsx
{/* Documentary Poster Frame - Replace with poster */}
<motion.div className="w-32 h-48 md:w-44 md:h-64 lg:w-52 lg:h-80...">
  {/* Current: waveform visualization */}
  {/* Add: <Image src="/recognition/synchronicity-poster.jpg" ... /> */}
</motion.div>
```

---

## Video Trailers

### 1. ALONE Trailer
**File:**
- Path: `/public/recognition/alone-trailer.mp4`
- Optional WebM: `/public/recognition/alone-trailer.webm`
- Format: MP4 (H.264) + optional WebM (VP9)
- Resolution: 1920x1080 (Full HD) minimum
- Max file size: 20-30MB for web
- Length: 30-90 seconds optimal

**Integration Point:**
In `RecognitionSection.tsx` - AloneModal component:
- Add after the poster section, before content sections
- Use `<video>` element with controls

---

### 2. WOMEN IS LOSERS Trailer
**File:**
- Path: `/public/recognition/women-is-losers-trailer.mp4`
- Optional WebM: `/public/recognition/women-is-losers-trailer.webm`
- Format: MP4 (H.264) + optional WebM (VP9)
- Resolution: 1920x1080 (Full HD) minimum

---

### 3. SYNCHRONICITY Trailer
**File:**
- Path: `/public/recognition/synchronicity-trailer.mp4`
- Optional WebM: `/public/recognition/synchronicity-trailer.webm`
- Format: MP4 (H.264) + optional WebM (VP9)
- Resolution: 1920x1080 (Full HD) minimum

---

## Naming Convention Summary

```
/public/recognition/
├── alone-poster.jpg              (Portrait film poster)
├── alone-trailer.mp4             (Video trailer)
├── alone-trailer.webm            (Optional WebM version)
├── women-is-losers-poster.jpg    (Portrait film poster)
├── women-is-losers-trailer.mp4   (Video trailer)
├── synchronicity-poster.jpg      (Portrait documentary poster)
└── synchronicity-trailer.mp4     (Video trailer)
```

---

## Recommended Specifications

### Posters
- **Format:** JPG (quality 85-90%) or WebP
- **Aspect Ratio:** 2:3 (portrait)
- **Min Resolution:** 800x1200px
- **Max File Size:** 200-500KB
- **Color Space:** sRGB

### Videos
- **Format:** MP4 (H.264 codec) required, WebM optional
- **Resolution:** 1920x1080 (1080p)
- **Frame Rate:** 24fps (cinematic) or 30fps
- **Bitrate:** 5-8 Mbps for 1080p
- **Audio:** AAC, 128-256kbps
- **Max Duration:** 90 seconds

---

## Next Steps After Adding Files

Once you've added the media files, I can update the RecognitionSection.tsx to:
1. Replace placeholder divs with actual Image components
2. Add video players with trailer sources
3. Implement lazy loading for performance
4. Add responsive sizing for all viewports

Just let me know when the files are ready!
