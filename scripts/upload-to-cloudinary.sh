#!/bin/bash

# Cloudinary Media Upload Script
# Usage: ./upload-to-cloudinary.sh

set -e

# Configuration - UPDATE THESE
CLOUD_NAME="prxatt"  # Your Cloudinary cloud name
API_KEY="YOUR_API_KEY"  # Get from Cloudinary Dashboard
API_SECRET="YOUR_API_SECRET"  # Get from Cloudinary Dashboard

# Source directory
MEDIA_DIR="${1:-../public/work}"

echo "🚀 Uploading media to Cloudinary..."
echo "Cloud: $CLOUD_NAME"
echo "Source: $MEDIA_DIR"
echo ""

# Function to upload a file
upload_file() {
  local file="$1"
  local folder="$2"
  local filename=$(basename "$file")
  
  echo "Uploading: $filename to folder: $folder"
  
  curl -s -X POST \
    "https://api.cloudinary.com/v1_1/$CLOUD_NAME/$folder/upload" \
    -F "file=@$file" \
    -F "upload_preset=pratt_work" \
    -F "public_id=$filename" \
    -F "api_key=$API_KEY" \
    -F "timestamp=$(date +%s)" \
    | grep -o '"secure_url":"[^"]*"' | cut -d'"' -f4
}

# Upload images
echo "📸 Uploading images..."
find "$MEDIA_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.gif" \) | while read file; do
  upload_file "$file" "image"
done

# Upload videos
echo "🎥 Uploading videos..."
find "$MEDIA_DIR" -type f \( -name "*.mp4" -o -name "*.webm" -o -name "*.mov" \) | while read file; do
  upload_file "$file" "video"
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variable: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=prxatt"
echo "2. Update media paths in components to use getMediaUrl()"
echo "3. Or add Cloudinary URLs directly in your content files"
