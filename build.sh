#!/bin/bash

echo "🚀 Building Apparel Flow Desktop App..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf server/dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build backend
echo "🔧 Building backend..."
cd server
npm install
npm run build
npm run init-db
cd ..

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Build Electron main process
echo "⚡ Building Electron main process..."
npm run build:electron-main

# Create assets directory if it doesn't exist
mkdir -p assets

# Create a simple icon (you can replace this with your own icon)
echo "🎨 Creating app icon..."
cat > assets/icon.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#3B82F6"/>
  <path d="M128 256L224 352L384 160" stroke="white" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="64" stroke="white" stroke-width="16" fill="none"/>
</svg>
EOF

# Convert SVG to PNG (if you have ImageMagick installed)
if command -v convert &> /dev/null; then
    convert assets/icon.svg -resize 512x512 assets/icon.png
    convert assets/icon.svg -resize 256x256 assets/icon@2x.png
    convert assets/icon.svg -resize 128x128 assets/icon@1x.png
fi

echo "📦 Building distributable..."
npm run dist

echo "✅ Build complete! Check the dist/ directory for your installer."
echo "📁 DMG file: dist/Apparel Flow Desktop-1.0.0-arm64.dmg" 