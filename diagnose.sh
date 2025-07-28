#!/bin/bash

# Apparel Flow Desktop - Diagnostic Script
echo "🔍 Diagnosing Apparel Flow Desktop..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DIAGNOSE]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

echo "================================================"
echo "🔍 COMPREHENSIVE DIAGNOSIS"
echo "================================================"

# Check 1: File Structure
print_status "1. Checking file structure..."
if [ -f "dist/index.html" ]; then
    print_success "dist/index.html exists"
    echo "   Content preview:"
    head -5 dist/index.html
else
    print_error "dist/index.html missing"
fi

if [ -f "dist/electron-main.js" ]; then
    print_success "dist/electron-main.js exists"
else
    print_error "dist/electron-main.js missing"
fi

if [ -f "server/dist/index.js" ]; then
    print_success "server/dist/index.js exists"
else
    print_error "server/dist/index.js missing"
fi

# Check 2: JavaScript files
print_status "2. Checking JavaScript files..."
JS_FILES=$(ls dist/assets/main-*.js 2>/dev/null | wc -l)
if [ $JS_FILES -gt 0 ]; then
    print_success "Found $JS_FILES JavaScript files"
    ls -la dist/assets/main-*.js
else
    print_error "No JavaScript files found"
fi

# Check 3: CSS files
print_status "3. Checking CSS files..."
CSS_FILES=$(ls dist/assets/main-*.css 2>/dev/null | wc -l)
if [ $CSS_FILES -gt 0 ]; then
    print_success "Found $CSS_FILES CSS files"
    ls -la dist/assets/main-*.css
else
    print_error "No CSS files found"
fi

# Check 4: HTML content
print_status "4. Checking HTML content..."
if [ -f "dist/index.html" ]; then
    echo "   HTML file size: $(wc -c < dist/index.html) bytes"
    echo "   JavaScript references:"
    grep -o 'src="[^"]*"' dist/index.html
    echo "   CSS references:"
    grep -o 'href="[^"]*"' dist/index.html
else
    print_error "Cannot check HTML content"
fi

# Check 5: Backend status
print_status "5. Checking backend status..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    print_success "Backend is running on port 8080"
    if curl -s http://localhost:8080/health > /dev/null; then
        print_success "Backend is responding"
    else
        print_warning "Backend is running but not responding"
    fi
else
    print_warning "Backend is not running on port 8080"
fi

# Check 6: Process status
print_status "6. Checking running processes..."
ELECTRON_PROCESSES=$(pgrep -f "Apparel Flow Desktop" | wc -l)
if [ $ELECTRON_PROCESSES -gt 0 ]; then
    print_success "Found $ELECTRON_PROCESSES Electron processes"
    pgrep -f "Apparel Flow Desktop"
else
    print_warning "No Electron processes found"
fi

NODE_SERVER_PROCESSES=$(pgrep -f "node.*server" | wc -l)
if [ $NODE_SERVER_PROCESSES -gt 0 ]; then
    print_success "Found $NODE_SERVER_PROCESSES Node server processes"
    pgrep -f "node.*server"
else
    print_warning "No Node server processes found"
fi

# Check 7: File permissions
print_status "7. Checking file permissions..."
if [ -r "dist/index.html" ]; then
    print_success "dist/index.html is readable"
else
    print_error "dist/index.html is not readable"
fi

if [ -r "dist/electron-main.js" ]; then
    print_success "dist/electron-main.js is readable"
else
    print_error "dist/electron-main.js is not readable"
fi

echo ""
echo "================================================"
echo "📋 DIAGNOSIS SUMMARY"
echo "================================================"
echo "If you see [PASS] messages, the files are correct."
echo "If you see [FAIL] messages, there are issues to fix."
echo "If you see [WARN] messages, the app might work but needs attention."
echo ""
echo "Next steps:"
echo "1. If all [PASS]: Run ./launch-app.sh"
echo "2. If [FAIL] messages: Check the specific issues above"
echo "3. If [WARN] messages: The app might still work"
echo "================================================" 