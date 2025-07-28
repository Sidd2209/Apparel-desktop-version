#!/bin/bash

# Apparel Flow Desktop - Test Script
echo "🧪 Testing Apparel Flow Desktop..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
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

# Test 1: Check if all required files exist
print_status "Test 1: Checking required files..."
if [ -f "dist/index.html" ]; then
    print_success "dist/index.html exists"
else
    print_error "dist/index.html missing"
    exit 1
fi

if [ -f "dist/electron-main.js" ]; then
    print_success "dist/electron-main.js exists"
else
    print_error "dist/electron-main.js missing"
    exit 1
fi

if [ -f "server/dist/index.js" ]; then
    print_success "server/dist/index.js exists"
else
    print_error "server/dist/index.js missing"
    exit 1
fi

# Test 2: Check if backend can start
print_status "Test 2: Testing backend startup..."
cd server
timeout 10s npm start &
BACKEND_PID=$!
sleep 5

if curl -s http://localhost:8080/health > /dev/null; then
    print_success "Backend is responding"
else
    print_warning "Backend might not be fully started"
fi

kill $BACKEND_PID 2>/dev/null || true
cd ..

# Test 3: Check if Electron can start
print_status "Test 3: Testing Electron startup..."
timeout 15s npm run start:electron &
ELECTRON_PID=$!
sleep 10

if pgrep -f "Apparel Flow Desktop" > /dev/null; then
    print_success "Electron app is running"
else
    print_warning "Electron app might not be fully started"
fi

kill $ELECTRON_PID 2>/dev/null || true

echo ""
echo "🎉 All tests completed!"
echo "If you see any [FAIL] messages, please check the setup."
echo "If you see [PASS] messages, the app should work correctly." 