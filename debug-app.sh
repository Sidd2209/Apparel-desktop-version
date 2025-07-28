#!/bin/bash

# Apparel Flow Desktop - Comprehensive Debug Script
echo "🐛 Starting Apparel Flow Desktop in debug mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kill any existing processes
print_status "Killing existing processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "Apparel Flow Desktop" 2>/dev/null || true
sleep 2

# Check if files exist
print_status "Checking file structure..."
if [ -f "dist/index.html" ]; then
    print_success "dist/index.html exists"
else
    print_error "dist/index.html missing!"
fi

if [ -f "dist/electron-main.js" ]; then
    print_success "dist/electron-main.js exists"
else
    print_error "dist/electron-main.js missing!"
fi

if [ -f "server/dist/index.js" ]; then
    print_success "server/dist/index.js exists"
else
    print_error "server/dist/index.js missing!"
fi

# Check port availability
print_status "Checking port 8080..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "Port 8080 is already in use"
    lsof -i :8080
else
    print_success "Port 8080 is available"
fi

# Start with comprehensive debugging
print_status "Starting app with debug mode..."
NODE_ENV=development DEBUG=* npm run start:electron
