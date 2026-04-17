# Ventures Teaser Images Guide

## Overview
This folder contains teaser images that appear when hovering over the SOEN and CulturePulse venture cards on the homepage.

## Required Images

### 1. SOEN Teaser Image
- **Filename**: `soen-teaser.jpg`
- **Recommended Size**: 560 x 360 pixels (2:1.3 aspect ratio)
- **Format**: JPG or PNG
- **Location**: `/public/ventures/soen-teaser.jpg`

**Design Suggestions**:
- AI-themed imagery with cyan/teal color palette (#06b6d4)
- Abstract technology patterns, neural networks, or human-AI interaction visuals
- Clean, modern aesthetic matching the SOEN brand
- Avoid text-heavy images - let the visual speak

### 2. CulturePulse Teaser Image
- **Filename**: `culturepulse-teaser.jpg`
- **Recommended Size**: 560 x 360 pixels (2:1.3 aspect ratio)
- **Format**: JPG or PNG
- **Location**: `/public/ventures/culturepulse-teaser.jpg`

**Design Suggestions**:
- Enterprise/data visualization theme with violet/indigo palette (#6366f1)
- Dashboard mockups, data flows, or team collaboration visuals
- Professional, corporate aesthetic matching CulturePulse brand
- Abstract representations of intelligence and insights

## Image Specifications

### Technical Requirements
- **Resolution**: Minimum 560x360px
- **Aspect Ratio**: Approximately 16:10 (landscape)
- **File Size**: Under 200KB for fast loading
- **Format**: JPG (preferred) or PNG
- **Color Space**: sRGB

### Visual Style Guide
- **Contrast**: High contrast for visibility against dark background
- **Style**: Modern, minimal, tech-forward
- **Overlay**: Images will have a subtle gradient overlay (black at bottom 30%)
- **Corner Accents**: White corner brackets will be added automatically

## How to Add Images

### Step 1: Prepare Your Images
1. Create or source your teaser images
2. Resize to 560x360px
3. Optimize for web (use tools like TinyPNG or Squoosh)
4. Save as `soen-teaser.jpg` and `culturepulse-teaser.jpg`

### Step 2: Add to Folder
```bash
# Copy images to the ventures folder
cp /path/to/your/soen-teaser.jpg /public/ventures/
cp /path/to/your/culturepulse-teaser.jpg /public/ventures/
```

Or simply drag and drop into:
```
/Users/prattmajmudar/Desktop/pratt.work/public/ventures/
```

### Step 3: Verify Installation
1. Start the dev server: `npm run dev`
2. Navigate to the homepage
3. Scroll to the Ventures section
4. Hover over "SOEN" text - you should see the teaser image appear to the left
5. Hover over "CULTUREPULSE" text - you should see the teaser image appear to the left

## Preview Behavior

### Hover Effects
- **SOEN**: Image appears to the left of the text card (280x180px)
- **CulturePulse**: Image appears to the left of the text card (280x180px)
- **Animation**: Smooth fade-in with scale (0.4s duration, cubic-bezier easing)
- **Exit**: Smooth fade-out when mouse leaves

### Current Fallback
If images are not yet added, the hover will still work but will show a broken image placeholder. Add your images to complete the experience.

## Troubleshooting

### Images Not Showing
1. Check file names match exactly: `soen-teaser.jpg` and `culturepulse-teaser.jpg`
2. Verify files are in `/public/ventures/` folder
3. Restart the Next.js dev server
4. Clear browser cache (Cmd+Shift+R on Mac)

### Images Too Large/Small
- The display size is fixed at 280x180px
- Source images should be at least 560x360px for retina displays
- Images will be automatically scaled down by Next.js Image component

### Wrong Colors/Appearance
- SOEN uses cyan accent (#06b6d4) - match this in your image
- CulturePulse uses violet accent (#6366f1) - match this in your image
- Consider the dark background (#0a0a0a) when designing

## Brand Guidelines

### SOEN Brand
- Tagline: "AI for Humans"
- Color: Cyan/Teal (#06b6d4)
- Vibe: Approachable, human-centric AI
- Coming: 2026

### CulturePulse Brand
- Tagline: "Enterprise Intelligence Platform"
- Color: Violet/Indigo (#6366f1)
- Vibe: Professional, data-driven, corporate
- Status: Enterprise (locked/private)

## Examples of Good Teaser Images

### SOEN
- Abstract AI interface mockup
- Neural network visualization with cyan nodes
- Human silhouette with digital overlay
- Minimalist chatbot conversation UI
- Gradient abstract with cyan tones

### CulturePulse
- Dashboard with charts and analytics
- Team collaboration interface
- Data flow visualization with violet accents
- Corporate meeting with insights overlay
- Abstract enterprise architecture diagram

---

**Note**: Once images are added, the homepage Ventures section will be 100% complete with stunning hover teaser effects!
