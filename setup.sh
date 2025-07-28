#!/bin/bash

# Apparel Flow Desktop - Auto Setup Script
# This script automatically sets up the entire development environment

set -e  # Exit on any error

echo "🚀 Starting Apparel Flow Desktop Auto Setup..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        print_status "You can download it from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed successfully"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd server
    npm install
    cd ..
    print_success "Backend dependencies installed successfully"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    cd server
    npx prisma generate
    cd ..
    print_success "Prisma client generated successfully"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    npm run build
    print_success "Frontend built successfully"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    cd server
    npm run build
    cd ..
    print_success "Backend built successfully"
}

# Build Electron main process
build_electron() {
    print_status "Building Electron main process..."
    npm run build:electron-main
    print_success "Electron main process built successfully"
}

# Test backend connection
test_backend() {
    print_status "Testing backend connection..."
    cd server
    timeout 10s npm start &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test GraphQL endpoint
    if curl -s http://localhost:8080/graphql > /dev/null; then
        print_success "Backend is running and accessible"
    else
        print_warning "Backend might not be fully started yet"
    fi
    
    # Kill the test backend
    kill $BACKEND_PID 2>/dev/null || true
    cd ..
}

# Create launch script
create_launch_script() {
    print_status "Creating launch script..."
    
    cat > launch-app.sh << 'EOF'
#!/bin/bash

# Apparel Flow Desktop - Launch Script
echo "🚀 Launching Apparel Flow Desktop..."

# Kill any existing backend processes
pkill -f "node.*server" 2>/dev/null || true

# Start the app
npm run start:electron
EOF

    chmod +x launch-app.sh
    print_success "Launch script created: launch-app.sh"
}

# Create debug script
create_debug_script() {
    print_status "Creating debug script..."
    
    cat > debug-app.sh << 'EOF'
#!/bin/bash

# Apparel Flow Desktop - Debug Script
echo "🐛 Starting Apparel Flow Desktop in debug mode..."

# Kill any existing backend processes
pkill -f "node.*server" 2>/dev/null || true

# Start with dev tools
NODE_ENV=development npm run start:electron
EOF

    chmod +x debug-app.sh
    print_success "Debug script created: debug-app.sh"
}

# Create quick start guide
create_quick_start() {
    print_status "Creating quick start guide..."
    
    cat > QUICK-START.md << 'EOF'
# Apparel Flow Desktop - Quick Start Guide

## 🚀 Quick Launch
```bash
./launch-app.sh
```

## 🐛 Debug Mode
```bash
./debug-app.sh
```

## 📁 Project Structure
- `src/` - Frontend React code
- `server/` - Backend GraphQL server
- `dist/` - Built application files
- `electron-main.ts` - Electron main process

## 🔧 Development Commands
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build everything
npm run build
cd server && npm run build && cd ..
npm run build:electron-main

# Start development
npm run start:electron
```

## 🌐 Backend API
- GraphQL: http://localhost:8080/graphql
- Health Check: http://localhost:8080/health

## 📝 Troubleshooting
1. If you get 404 errors, restart the app
2. If backend doesn't connect, check if port 8080 is free
3. If Prisma errors occur, run: `cd server && npx prisma generate && cd ..`
EOF

    print_success "Quick start guide created: QUICK-START.md"
}

# Main setup function
main() {
    echo "================================================"
    echo "🔧 Apparel Flow Desktop Auto Setup"
    echo "================================================"
    
    # Check prerequisites
    check_node
    check_npm
    
    # Install dependencies
    install_frontend_deps
    install_backend_deps
    
    # Generate Prisma client
    generate_prisma
    
    # Build everything
    build_frontend
    build_backend
    build_electron
    
    # Test backend
    test_backend
    
    # Create convenience scripts
    create_launch_script
    create_debug_script
    create_quick_start
    
    echo "================================================"
    print_success "🎉 Setup completed successfully!"
    echo "================================================"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run: ./launch-app.sh"
    echo "2. Or for debug mode: ./debug-app.sh"
    echo "3. Check QUICK-START.md for more info"
    echo ""
    echo "🚀 Ready to launch Apparel Flow Desktop!"
    echo "================================================"
}

# Run the setup
main "$@" 